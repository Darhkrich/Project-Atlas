"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import { APPROVAL_REASON_LABEL } from "@/lib/reseller/wallet/wallet-labels";
import type { WalletApprovalReason } from "@/lib/domains/wallet/enums";
import type { ResellerPendingWithdrawalRow } from "@/lib/reseller/types/wallet";

interface Props {
  rows: ResellerPendingWithdrawalRow[];
  nowMs: number | null;
  onCancel: (requestId: string) => void;
  cancelling: boolean;
}

export function WalletPendingWithdrawals({
  rows,
  nowMs,
  onCancel,
  cancelling,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="reseller-pending-withdrawals-heading">
      <div className="mb-4">
        <h2
          id="reseller-pending-withdrawals-heading"
          className="text-lg font-semibold text-neutral-950 dark:text-white"
        >
          Withdrawals in progress
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
                  <div className="flex flex-wrap items-center gap-2">
                    <AtlasBadge variant="info">{row.kindLabel}</AtlasBadge>
                    <p className="text-sm font-medium text-neutral-950 dark:text-white">
                      {row.description}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Requested{" "}
                    {nowMs ? formatRelative(row.requestedAt, nowMs) : "recently"}
                  </p>
                  {row.approvalReasons.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      Reason:{" "}
                      {row.approvalReasons
                        .map((r) =>
                          r in APPROVAL_REASON_LABEL
                            ? APPROVAL_REASON_LABEL[
                                r as WalletApprovalReason
                              ]
                            : r
                        )
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">
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
                    Cancel request
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