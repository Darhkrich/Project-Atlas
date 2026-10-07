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

export function TransactionRow({ row, nowMs, onOpen }: Props) {
  return (
    <tr
      onClick={() => onOpen(row)}
      className="cursor-pointer border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40"
    >
      <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
        {nowMs ? formatRelative(row.occurredAt, nowMs) : "\u2014"}
      </td>
      <th
        scope="row"
        className="px-4 py-3 text-left text-sm font-medium text-neutral-950 dark:text-white"
      >
        <span className="block truncate">{row.description}</span>
        <span className="mt-0.5 block truncate text-xs font-normal text-neutral-500 dark:text-neutral-400">
          {walletLine(row)}
        </span>
      </th>
      <td className="px-4 py-3">
        <AtlasBadge variant={row.kindVariant}>{row.kindLabel}</AtlasBadge>
      </td>
      <td className="px-4 py-3">
        {row.statusLabel && row.statusVariant ? (
          <AtlasBadge variant={row.statusVariant}>{row.statusLabel}</AtlasBadge>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {"\u2014"}
          </span>
        )}
      </td>
      <td
        className={
          "whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums " +
          amountTone(row)
        }
      >
        {amountPrefix(row)}
        {formatCurrency(row.total ?? row.amount)}
      </td>
    </tr>
  );
}