"use client";

import Link from "next/link";
import type { QueueRow } from "@/lib/admin/resellers/verification-projection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/admin/formatters";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  WAITING_TONE_CLASS,
  waitingLabel,
  waitingTone,
} from "@/lib/admin/resellers/verification-labels";
import type { VerificationDocument } from "@/lib/admin/types/verification-document";

interface VerificationQueueCardProps {
  row: QueueRow;
  documents: VerificationDocument[];
  onViewDocuments: () => void;
  onVerify: () => void;
  onReject: () => void;
}

export function VerificationQueueCard({
  row,
  documents,
  onViewDocuments,
  onVerify,
  onReject,
}: VerificationQueueCardProps) {
  const { reseller, waitingDays, documentsSubmitted, documentsTotal } = row;
  const tone = waitingTone(waitingDays);
  const allSubmitted =
    documentsTotal > 0 && documentsSubmitted === documentsTotal;
  const noneSubmitted = documentsTotal === 0 || documentsSubmitted === 0;

  const docBadgeVariant = allSubmitted
    ? "success"
    : noneSubmitted
    ? "danger"
    : "warning";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">
            <Link
              href={"/admin/resellers/" + reseller.id}
              className="rounded-sm text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
            >
              {reseller.businessName}
            </Link>
          </CardTitle>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {reseller.contactPerson}
            {" · "}
            <a
              href={"mailto:" + reseller.email}
              className="rounded-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {reseller.email}
            </a>
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs font-medium",
            WAITING_TONE_CLASS[tone]
          )}
          title={"Submitted " + formatDate(reseller.joinedAt)}
        >
          Waiting {waitingLabel(waitingDays)}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="neutral" size="sm">
            {reseller.tierName ?? "No tier"}
          </Badge>
          <button
            type="button"
            onClick={onViewDocuments}
            aria-label={
              "View " +
              documentsTotal +
              " document" +
              (documentsTotal === 1 ? "" : "s") +
              " for " +
              reseller.businessName
            }
            className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Badge variant={docBadgeVariant} size="sm">
              <AtlasIcon
                name="file-text"
                aria-hidden="true"
                className="mr-1 h-3 w-3"
              />
              {documentsSubmitted} of {documentsTotal} submitted
            </Badge>
          </button>
          <span className="text-neutral-500 dark:text-neutral-400">
            Joined {formatDate(reseller.joinedAt)}
          </span>
        </div>

        {documentsTotal === 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No documents required for this account type.
          </p>
        )}

        {documentsTotal > 0 && !allSubmitted && (
          <p className="text-xs text-warning-700 dark:text-warning-300">
            Some documents are still missing. Approval is possible but
            should wait until the reseller has submitted everything.
          </p>
        )}

        <Can permission={PERMISSIONS.RESELLERS_VERIFY}>
          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <Button variant="outline" size="sm" onClick={onViewDocuments}>
              View documents
            </Button>
            <Button size="sm" onClick={onVerify}>
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-600"
              onClick={onReject}
            >
              Reject
            </Button>
          </div>
        </Can>
      </CardContent>
    </Card>
  );
}