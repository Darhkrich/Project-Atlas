/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";
import type { Reseller } from "@/lib/admin/types/reseller";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { useVerificationQueue } from "@/lib/admin/hooks/use-verification-queue";
import {
  verifyReseller,
  rejectResellerVerification,
  type ResellerActor,
} from "@/lib/admin/resellers/reseller-mutations";
import { VerificationSummaryCards } from "@/components/admin/resellers/verification-summary-cards";
import { VerificationQueueCard } from "@/components/admin/resellers/verification-queue-card";
import { VerificationRejectModal } from "@/components/admin/resellers/verification-reject-modal";
import {
  VerificationDocumentsModal,
  type VerificationContext,
} from "@/components/admin/shared/verification-documents-modal";
import { formatDate } from "@/lib/admin/formatters";

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function ResellerVerificationQueuePage() {
  const admin = useCurrentAdmin();
  const { rows, summary, documents, loading } = useVerificationQueue();

  const [documentsTarget, setDocumentsTarget] = useState<Reseller | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Reseller | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Reseller | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

const actor: ResellerActor = useMemo(
  () =>
    admin
      ? { id: admin.id ?? admin.email, name: admin.name, email: admin.email }
      : { id: "system", name: "System", email: "system@atlas.com" },
  [admin]
);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 6000);
  };

  const handleVerify = () => {
    if (!verifyTarget) return;
    const result = verifyReseller(verifyTarget.id, actor);
    if (result.ok) {
      showToast("success", verifyTarget.businessName + " verified.");
    } else {
      showToast("error", result.error ?? "Could not verify reseller.");
    }
    setVerifyTarget(null);
  };

  const handleReject = (reason: string) => {
    if (!rejectTarget) return;
    const result = rejectResellerVerification(
      rejectTarget.id,
      reason,
      actor
    );
    if (result.ok) {
      showToast("success", rejectTarget.businessName + " rejected.");
    } else {
      showToast("error", result.error ?? "Could not reject reseller.");
    }
    setRejectTarget(null);
  };

  const context: VerificationContext | undefined = useMemo(() => {
    if (!documentsTarget) return undefined;
    const r = documentsTarget;
    const fields = [
      { label: "Business name", value: r.businessName },
      { label: "Contact person", value: r.contactPerson },
      { label: "Email", value: r.email },
      { label: "Phone", value: r.phone, mono: true },
      { label: "Reseller ID", value: r.id, mono: true },
      { label: "Tier", value: r.tierName ?? "No tier" },
      { label: "Country", value: "Ghana" },
      { label: "Joined", value: formatDate(r.joinedAt) },
    ];
    return {
      subtitle: r.id,
      fields,
    };
  }, [documentsTarget]);

  const headerMeta = (
    <>
      <span>{summary.pending} pending</span>
      {summary.pending > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span
            className={
              summary.longestWaitDays >= 7
                ? "text-danger-700 dark:text-danger-300"
                : summary.longestWaitDays >= 3
                ? "text-warning-700 dark:text-warning-300"
                : "text-neutral-500 dark:text-neutral-400"
            }
          >
            longest wait {summary.longestWaitDays} day
            {summary.longestWaitDays === 1 ? "" : "s"}
          </span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{summary.verified} verified</span>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verification queue"
        description="Review pending reseller verification requests and approve or reject them."
        meta={headerMeta}
      />

      <VerificationSummaryCards summary={summary} loading={loading} />

      <div className="rounded-lg border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800 dark:bg-info-900/20 dark:text-info-100">
        <p className="flex items-start gap-2">
          <AtlasIcon
            name="info"
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          <span>
            Open the documents and compare them against the reseller's
            details before approving. Approving an account with missing
            documents is allowed but should be reserved for cases where you
            have verified the missing items through another channel.
          </span>
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No resellers waiting for review"
            description="The verification queue is clear. New submissions will appear here as resellers complete their onboarding."
          />
        </div>
      ) : (
        <ul role="list" className="space-y-4">
          {rows.map((row) => (
            <li key={row.reseller.id}>
              <VerificationQueueCard
                row={row}
                documents={documents[row.reseller.id] ?? []}
                onViewDocuments={() => setDocumentsTarget(row.reseller)}
                onVerify={() => setVerifyTarget(row.reseller)}
                onReject={() => setRejectTarget(row.reseller)}
              />
            </li>
          ))}
        </ul>
      )}

      <VerificationDocumentsModal
        open={documentsTarget !== null}
        entityName={documentsTarget?.businessName ?? ""}
        documents={
          documentsTarget ? documents[documentsTarget.id] ?? [] : []
        }
        context={context}
        onClose={() => setDocumentsTarget(null)}
      />

      <ConfirmDialog
        open={verifyTarget !== null}
        title="Approve verification"
        description={
          verifyTarget
            ? "Approve " +
              verifyTarget.businessName +
              "? They will be able to sell on Atlas immediately. The decision is recorded in their audit trail."
            : ""
        }
        confirmLabel="Approve"
        onConfirm={handleVerify}
        onCancel={() => setVerifyTarget(null)}
      />

      <VerificationRejectModal
        open={rejectTarget !== null}
        reseller={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}