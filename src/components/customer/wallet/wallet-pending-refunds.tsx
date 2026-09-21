"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { describeSource } from "@/lib/customer/wallet/wallet-labels";
import type { PendingRefundRow } from "@/lib/customer/wallet/wallet-projection";

interface Props {
  rows: PendingRefundRow[];
  nowMs: number | null;
  onCancel: (requestId: string) => void;
  cancelling: boolean;
}

export function WalletPendingRefunds({
  rows,
  nowMs,
  onCancel,
  cancelling,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="pending-refunds-heading"
      role="region"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="pending-refunds-heading"
          className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Refunds in progress
        </h2>
      </div>

      <ul role="list" className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <AtlasCard
              className={
                row.status === "pending_admin"
                  ? "border-warning-200 bg-warning-50/40 dark:border-warning-900/60 dark:bg-warning-950/30"
                  : undefined
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Refund to{" "}
                    {describeSource(
                      row.sourceMethodId,
                      row.sourceProvider,
                      row.sourceMaskedLabel
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Requested{" "}
                    {nowMs ? formatRelative(row.requestedAt, nowMs) : "recently"}
                  </p>
                  {row.approvalReasons.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      Reason: {row.approvalReasons.join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(row.total)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    incl. {formatCurrency(row.fee)} fee
                  </p>
                  <div className="mt-1">
                    <AtlasBadge variant={row.statusVariant}>
                      {row.statusLabel}
                    </AtlasBadge>
                  </div>
                </div>
              </div>

              {row.canCancel && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onCancel(row.id)}
                    disabled={cancelling}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-danger-400 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-danger-600 dark:hover:text-danger-300"
                  >
                    Cancel refund
                  </button>
                </div>
              )}
            </AtlasCard>
          </li>
        ))}
      </ul>
    </section>
  );
}