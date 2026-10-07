"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { formatCurrency, formatRelative } from "@/lib/shared/format";
import type {
  MerchantBillingSummary,
  MerchantWalletRecord,
} from "@/lib/merchant/types/wallet";

interface Props {
  record: MerchantWalletRecord;
  frozen: boolean;
  summary: MerchantBillingSummary | null;
  nowMs: number | null;
  onFund: () => void;
  onAutoPay: () => void;
}

function autoPayLabel(summary: MerchantBillingSummary | null): string {
  if (!summary) return "Auto-pay off";
  if (!summary.autoPayEnabled) return "Auto-pay off";
  if (summary.autoPaySource === "card") return "Auto-pay on: card on file";
  return "Auto-pay on: billing wallet";
}

export function WalletBillingCard({
  record,
  frozen,
  summary,
  nowMs,
  onFund,
  onAutoPay,
}: Props) {
  const nextAmount = summary?.nextChargeAmount ?? null;
  const nextDate = summary?.nextChargeDate ?? null;
  const lastAmount = summary?.lastChargeAmount ?? null;
  const lastAt = summary?.lastChargeAt ?? null;

  return (
    <AtlasCard
      className={
        "flex h-full flex-col " +
        (frozen ? "border-danger-200 dark:border-danger-900/60" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Plan fuel
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Atlas draws your plan charges from here.
          </p>
        </div>
        {frozen ? (
          <AtlasBadge variant="danger">Frozen</AtlasBadge>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <AtlasIcon
              name="credit-card"
              className="h-4 w-4 text-neutral-700 dark:text-neutral-200"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950 tabular-nums dark:text-white">
        {formatCurrency(record.balance)}
      </p>
      {record.lastCreditAt && nowMs && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Last credit {formatRelative(record.lastCreditAt, nowMs)}
        </p>
      )}

      <div className="mt-4 space-y-1 rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-800">
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {autoPayLabel(summary)}
        </p>
        {nextAmount !== null && (
          <p className="text-neutral-600 dark:text-neutral-400">
            Next charge {formatCurrency(nextAmount)}
            {nextDate && nowMs
              ? " \u00B7 " + formatRelative(nextDate, nowMs)
              : ""}
          </p>
        )}
        {lastAmount !== null && lastAt !== null && (
          <p className="text-neutral-600 dark:text-neutral-400">
            Last charge {formatCurrency(lastAmount)}
            {summary?.lastChargeStatus === "failed" && (
              <span className="ml-1 text-danger-600 dark:text-danger-400">
                (failed)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button size="sm" onClick={onFund} disabled={frozen}>
          Fund
        </Button>
        <Button variant="ghost" size="sm" onClick={onAutoPay} disabled={frozen}>
          Auto-pay
        </Button>
      </div>
    </AtlasCard>
  );
}