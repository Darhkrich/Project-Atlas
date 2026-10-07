"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency, formatRelative } from "@/lib/shared/format";
import type {
  MerchantPendingWithdrawalRow,
  RegisteredDestination,
} from "@/lib/merchant/types/wallet";

interface Props {
  pending: MerchantPendingWithdrawalRow[];
  destination: RegisteredDestination | null;
  nowMs: number | null;
  cancellingId: string | null;
  onCancel: (requestId: string) => void;
  onViewDestination: () => void;
}

export function WalletWaitingOnAtlas({
  pending,
  destination,
  nowMs,
  cancellingId,
  onCancel,
  onViewDestination,
}: Props) {
  const pendingChange = destination?.pendingChange ?? null;
  const hasPendingChange = pendingChange !== null;

  const isFirstAccountInReview =
    destination !== null &&
    destination.verifiedAt === null &&
    pendingChange !== null;

  const isChangeInReview =
    destination !== null &&
    destination.verifiedAt !== null &&
    pendingChange !== null;

  if (pending.length === 0 && !hasPendingChange) return null;

  return (
    <section aria-labelledby="wallet-waiting-heading">
      <h2
        id="wallet-waiting-heading"
        className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
      >
        Waiting on Atlas
      </h2>

      <ul role="list" className="space-y-3">
        {hasPendingChange && pendingChange && (
          <li>
            <AtlasCard className="border-warning-200 bg-warning-50/40 dark:border-warning-900/60 dark:bg-warning-950/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-neutral-950 dark:text-white">
                      {isChangeInReview
                        ? "Withdrawal account change"
                        : "Withdrawal account"}
                    </p>
                    <AtlasBadge variant="warning">In review</AtlasBadge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                    {pendingChange.provider} {pendingChange.maskedLabel} (
                    {pendingChange.nameOnAccount})
                  </p>
                  {isChangeInReview && (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Reason: {pendingChange.reason}
                    </p>
                  )}
                  {isFirstAccountInReview && (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Atlas reviews every new account before it can receive
                      payouts.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onViewDestination}
                  className="text-xs font-semibold text-brand-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
                >
                  View account
                </button>
              </div>
            </AtlasCard>
          </li>
        )}

        {pending.map((row) => {
          const isCancelling = cancellingId === row.id;
          return (
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
                    <p className="text-sm font-medium text-neutral-950 dark:text-white">
                      Withdrawal to {row.destination}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Requested{" "}
                      {nowMs
                        ? formatRelative(row.requestedAt, nowMs)
                        : "recently"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-neutral-950 dark:text-white">
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
                      disabled={isCancelling}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-danger-400 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-danger-600 dark:hover:text-danger-300"
                    >
                      {isCancelling ? "Cancelling" : "Cancel withdrawal"}
                    </button>
                  </div>
                )}
              </AtlasCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}