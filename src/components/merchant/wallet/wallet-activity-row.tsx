"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency, formatRelative } from "@/lib/shared/format";
import type { MerchantLedgerRow } from "@/lib/merchant/types/wallet";

interface Props {
  row: MerchantLedgerRow;
  nowMs: number | null;
}

const WALLET_LABEL: Record<"billing" | "main", string> = {
  billing: "Billing",
  main: "Main",
};

export function WalletActivityRow({ row, nowMs }: Props) {
  const isTransfer =
    row.kind === "transfer_in" || row.kind === "transfer_out";
  const isCredit = row.direction === "credit" && !isTransfer;

  const amountTone = isTransfer
    ? "text-neutral-700 dark:text-neutral-300"
    : isCredit
    ? "text-success-700 dark:text-success-300"
    : "text-neutral-950 dark:text-white";

  const prefix = isTransfer ? "" : isCredit ? "+" : "\u2212";

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <AtlasBadge variant={row.kindVariant}>{row.kindLabel}</AtlasBadge>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {WALLET_LABEL[row.walletType]}
          </span>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-neutral-950 dark:text-white">
          {row.description}
        </p>
        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
          {row.detail}
        </p>
      </div>

      <div className="text-right">
        <p className={"text-sm font-semibold tabular-nums " + amountTone}>
          {prefix}
          {formatCurrency(row.total ?? row.amount)}
        </p>
        {row.fee !== undefined && row.fee > 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            incl. {formatCurrency(row.fee)} fee
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {nowMs ? formatRelative(row.createdAt, nowMs) : "\u2014"}
        </p>
        {row.status && row.statusVariant && (
          <div className="mt-1">
            <AtlasBadge variant={row.statusVariant}>{row.status}</AtlasBadge>
          </div>
        )}
      </div>
    </div>
  );
}