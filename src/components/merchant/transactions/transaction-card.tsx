"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency, formatRelative } from "@/lib/shared/format";
import { describeWalletType, describeTransferWallet } from "@/lib/merchant/transactions/labels";
import type { MerchantTransaction } from "@/lib/merchant/transactions/types";

interface Props {
  row: MerchantTransaction;
  nowMs: number | null;
  onOpen: (row: MerchantTransaction) => void;
}

function amountTone(row: MerchantTransaction): string {
  if (row.direction === "internal") {
    return "text-neutral-700 dark:text-neutral-300";
  }
  if (row.direction === "credit") {
    return "text-success-700 dark:text-success-300";
  }
  return "text-neutral-950 dark:text-white";
}

function amountPrefix(row: MerchantTransaction): string {
  if (row.direction === "internal") return "";
  return row.direction === "credit" ? "+" : "\u2212";
}

function walletLine(row: MerchantTransaction): string {
  if (
    (row.kind === "transfer_in" || row.kind === "transfer_out") &&
    row.counterpartyWalletType
  ) {
    return describeTransferWallet(row.walletType, row.counterpartyWalletType);
  }
  return describeWalletType(row.walletType);
}

export function TransactionCard({ row, nowMs, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(row)}
      className="w-full px-4 py-3 text-left transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:bg-neutral-50 dark:hover:bg-neutral-900/40 dark:focus-visible:bg-neutral-900/40"
      aria-label={row.description + " " + formatCurrency(row.total ?? row.amount)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AtlasBadge variant={row.kindVariant}>{row.kindLabel}</AtlasBadge>
            {row.statusLabel && row.statusVariant && (
              <AtlasBadge variant={row.statusVariant}>
                {row.statusLabel}
              </AtlasBadge>
            )}
          </div>
          <p className="mt-1.5 truncate text-sm font-medium text-neutral-950 dark:text-white">
            {row.description}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {walletLine(row)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={
              "text-sm font-semibold tabular-nums " + amountTone(row)
            }
          >
            {amountPrefix(row)}
            {formatCurrency(row.total ?? row.amount)}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {nowMs ? formatRelative(row.occurredAt, nowMs) : "\u2014"}
          </p>
        </div>
      </div>
    </button>
  );
}