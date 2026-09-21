"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatCurrency, formatRelative, formatAbsolute } from "@/lib/shared/format";
import type { ResellerTransactionRow } from "@/lib/reseller/types/transaction";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KIND_VARIANTS,
} from "@/lib/reseller/wallet/transaction-labels";

type TransactionTableProps = {
  transactions: ResellerTransactionRow[];
  onSelect: (transaction: ResellerTransactionRow) => void;
};

function kindIcon(kind: ResellerTransactionRow["kind"]): AtlasIconName {
  if (kind === "wallet_funding") return "wallet";
  if (kind === "wallet_purchase") return "cart";
  if (kind === "external_purchase") return "credit-card";
  if (kind === "commission") return "percent";
  if (kind === "withdrawal") return "arrow-down";
  return "edit";
}

export function TransactionTable({
  transactions,
  onSelect,
}: TransactionTableProps) {
  const now = useNow();

  return (
    <div className="overflow-hidden">
      <div className="hidden md:block">
        <table className="w-full">
          <caption className="sr-only">Reseller transactions</caption>
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left dark:border-neutral-800 dark:bg-neutral-900">
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Description
              </th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Kind
              </th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Amount
              </th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Date
              </th>
              <th scope="col" className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      <AtlasIcon name={kindIcon(tx.kind)} className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {tx.description}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {tx.detail}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <AtlasBadge variant={TRANSACTION_KIND_VARIANTS[tx.kind]}>
                    {TRANSACTION_KIND_LABELS[tx.kind]}
                  </AtlasBadge>
                </td>

                <td className="px-5 py-4">
                  <p
                    className={
                      "text-sm font-semibold " +
                      (tx.direction === "credit"
                        ? "text-success-700 dark:text-success-400"
                        : "text-neutral-900 dark:text-neutral-100")
                    }
                  >
                    {tx.direction === "credit" ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  {tx.statusLabel && tx.statusVariant ? (
                    <AtlasBadge variant={tx.statusVariant}>
                      {tx.statusLabel}
                    </AtlasBadge>
                  ) : (
                    <span className="text-xs text-neutral-500">—</span>
                  )}
                </td>

                <td className="px-5 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <span title={formatAbsolute(tx.createdAt)}>
                    {now ? formatRelative(tx.createdAt, now) : "—"}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(tx)}
                    className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                    aria-label={"View transaction " + tx.id}
                  >
                    <AtlasIcon name="arrow-right" className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul role="list" className="divide-y divide-neutral-100 md:hidden dark:divide-neutral-800">
        {transactions.map((tx) => (
          <li key={tx.id}>
            <button
              type="button"
              onClick={() => onSelect(tx)}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                <AtlasIcon name={kindIcon(tx.kind)} className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {tx.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {TRANSACTION_KIND_LABELS[tx.kind]}
                  </span>
                  <span aria-hidden="true" className="text-neutral-300">•</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {now ? formatRelative(tx.createdAt, now) : "—"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={
                    "text-sm font-semibold " +
                    (tx.direction === "credit"
                      ? "text-success-700 dark:text-success-400"
                      : "text-neutral-900 dark:text-neutral-100")
                  }
                >
                  {tx.direction === "credit" ? "+" : "−"}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}