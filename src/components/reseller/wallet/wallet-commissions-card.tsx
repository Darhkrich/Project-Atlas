"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type { ResellerCommissionsSummary } from "@/lib/reseller/types/wallet";

interface Props {
  summary: ResellerCommissionsSummary;
  nowMs: number | null;
}

export function WalletCommissionsCard({ summary, nowMs }: Props) {
  return (
    <AtlasCard className="border-success-200 bg-success-50/50 dark:border-success-900/60 dark:bg-success-950/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300">
            <AtlasIcon name="trending-up" className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-success-700 dark:text-success-300">
              Commission earnings
            </p>
            <p className="mt-1 text-2xl font-bold text-neutral-950 dark:text-white">
              {formatCurrency(summary.lifetimeTotal)}
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Lifetime commissions credited automatically to your wallet.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-right sm:min-w-[180px]">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            This month
          </p>
          <p className="text-sm font-semibold text-neutral-950 dark:text-white">
            {formatCurrency(summary.thisMonthTotal)}
          </p>
          {summary.lastCreditAmount !== null && summary.lastCreditOrderId && (
            <>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Last credit
              </p>
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                {formatCurrency(summary.lastCreditAmount)}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {summary.lastCreditOrderId}
                {summary.lastCreditAt && nowMs
                  ? " · " + formatRelative(summary.lastCreditAt, nowMs)
                  : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </AtlasCard>
  );
}