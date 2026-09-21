"use client";

import { Suspense, useMemo, useState } from "react";
import type { ResellerTier } from "@/lib/admin/types/commission";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useResellerTiers } from "@/lib/admin/hooks/use-reseller-tiers";
import {
  addTier,
  updateTier,
  removeTier,
  type TierActor,
  type TierInput,
} from "@/lib/admin/mock/reseller-tier-store";
import { TierSummaryCards } from "@/components/admin/resellers/tier-summary-cards";
import { TierCard } from "@/components/admin/resellers/tier-card";
import {
  TierEditorModal,
  type TierDraft,
} from "@/components/admin/resellers/tier-editor-modal";
import { TierDeleteModal } from "@/components/admin/resellers/tier-delete-modal";

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function ResellerTiersPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResellerTiersPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function ResellerTiersPageInner() {
  const admin = useCurrentAdmin();
  const { tiers, counts, summary, loading } = useResellerTiers();

  const [editorState, setEditorState] = useState<
    | { kind: "closed" }
    | { kind: "create" }
    | { kind: "edit"; tier: ResellerTier }
  >({ kind: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<ResellerTier | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: TierActor = useMemo(
    () =>
      admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    [admin]
  );

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 6000);
  };

  const headerMeta = (
    <>
      <span>
        {summary.tierCount} tier{summary.tierCount === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {summary.assignedResellers} of {summary.totalResellers} resellers
        assigned
      </span>
      {summary.tierCount > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            Extra cut {summary.extraCutRange.min}–{summary.extraCutRange.max}%
          </span>
        </>
      )}
    </>
  );

  const handleSubmit = (
    draft: TierDraft,
    mode: "create" | "edit"
  ): { ok: boolean; error?: string } => {
    const input: TierInput = {
      name: draft.name,
      minMonthlySales: draft.minMonthlySales,
      extraCutPercent: draft.extraCutPercent,
      baseCommissionRates: draft.baseCommissionRates,
      perks: draft.perks,
    };

    let result;
    if (mode === "create") {
      result = addTier(input, actor);
      if (result.ok && result.tier) {
        showToast("success", result.tier.name + " added.");
      }
    } else {
      const id = editorState.kind === "edit" ? editorState.tier.id : "";
      result = updateTier(id, input, actor);
      if (result.ok && result.tier) {
        showToast("success", result.tier.name + " updated.");
      }
    }

    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const count = counts[deleteTarget.id] ?? 0;
    const result = removeTier(deleteTarget.id, actor, count);
    if (result.ok) {
      showToast("success", deleteTarget.name + " deleted.");
    } else {
      showToast("error", result.error ?? "Could not delete tier.");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller tiers"
        description="Commission tiers, thresholds, and benefits for the reseller channel."
        meta={headerMeta}
        actions={
          <Can permission={PERMISSIONS.RESELLERS_TIER}>
            <Button
              size="sm"
              onClick={() => setEditorState({ kind: "create" })}
            >
              Add tier
            </Button>
          </Can>
        }
      />

      <TierSummaryCards summary={summary} loading={loading} />

      <div className="rounded-lg border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800 dark:bg-info-900/20 dark:text-info-100">
        <p className="flex items-start gap-2">
          <AtlasIcon
            name="info"
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          <span>
            Base rates apply to the Atlas price. When a reseller sets a
            higher price, the extra amount is split: Atlas keeps the tier's
            extra cut percent and the reseller keeps the rest. Higher tiers
            trade a lower Atlas cut for a higher Atlas contribution.
          </span>
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No tiers yet"
            description="Add your first tier to define commission policy for resellers."
            action={
              <Can permission={PERMISSIONS.RESELLERS_TIER}>
                <Button
                  size="sm"
                  onClick={() => setEditorState({ kind: "create" })}
                >
                  Add tier
                </Button>
              </Can>
            }
          />
        </div>
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {tiers.map((tier) => (
            <li key={tier.id}>
              <TierCard
                tier={tier}
                resellerCount={counts[tier.id] ?? 0}
                onEdit={(t) => setEditorState({ kind: "edit", tier: t })}
                onDelete={(t) => setDeleteTarget(t)}
              />
            </li>
          ))}
        </ul>
      )}

      <TierEditorModal
        open={editorState.kind !== "closed"}
        mode={editorState.kind === "edit" ? "edit" : "create"}
        current={editorState.kind === "edit" ? editorState.tier : null}
        existingTiers={tiers}
        onClose={() => setEditorState({ kind: "closed" })}
        onSubmit={(draft) =>
          handleSubmit(draft, editorState.kind === "edit" ? "edit" : "create")
        }
      />

      <TierDeleteModal
        open={deleteTarget !== null}
        tier={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
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