"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import type { RegisteredDestination } from "@/lib/merchant/types/wallet";
import { describeDestination } from "@/lib/merchant/wallet/wallet-labels";

interface Props {
  destination: RegisteredDestination | null;
  onEdit: () => void;
  frozen: boolean;
}

export function WalletDestinationCard({
  destination,
  onEdit,
  frozen,
}: Props) {
  if (!destination) {
    return (
      <AtlasCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              <AtlasIcon name="bank" className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                Withdrawal destination
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Add a bank or momo account so you can cash out from your main
                wallet.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onEdit} disabled={frozen}>
            Add destination
          </Button>
        </div>
      </AtlasCard>
    );
  }

  const hasPendingChange = destination.pendingChange !== undefined;

  return (
    <AtlasCard
      className={
        hasPendingChange
          ? "border-warning-200 bg-warning-50/40 dark:border-warning-900/60 dark:bg-warning-950/30"
          : undefined
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <AtlasIcon name="bank" className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                Withdrawal destination
              </p>
              {hasPendingChange ? (
                <AtlasBadge variant="warning">Change under review</AtlasBadge>
              ) : (
                <AtlasBadge variant="success">Verified</AtlasBadge>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-950 dark:text-white">
              {describeDestination(destination)}
            </p>

            {hasPendingChange && destination.pendingChange && (
              <div className="mt-3 rounded-lg border border-warning-200 bg-white p-3 dark:border-warning-900/60 dark:bg-neutral-900">
                <p className="text-xs font-medium text-warning-800 dark:text-warning-300">
                  Pending change
                </p>
                <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300">
                  {destination.pendingChange.provider}{" "}
                  {destination.pendingChange.maskedLabel} (
                  {destination.pendingChange.nameOnAccount})
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Reason: {destination.pendingChange.reason}
                </p>
              </div>
            )}
          </div>
        </div>
        {!hasPendingChange && (
          <Button variant="outline" onClick={onEdit} disabled={frozen}>
            Change destination
          </Button>
        )}
      </div>
    </AtlasCard>
  );
}