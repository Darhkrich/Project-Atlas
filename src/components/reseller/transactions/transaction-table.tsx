"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import type { Transaction } from "@/lib/transactions-data";
import { formatTransactionAmount } from "@/lib/transactions-data";

type TransactionTableProps = {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
};

function getAmountClass(amount: number) {
  if (amount > 0) {
    return "text-success-700 dark:text-success-400";
  }

  if (amount < 0) {
    return "text-neutral-900 dark:text-neutral-100";
  }

  return "text-neutral-500";
}

export function TransactionTable({
  transactions,
  onSelect,
}: TransactionTableProps) {
  return (
    <div className="overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left dark:border-neutral-800 dark:bg-neutral-900">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Transaction
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Type
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Amount
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Date
              </th>

              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      <span aria-hidden="true" className="text-lg font-semibold">
                        →
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {transaction.description}
                      </p>

                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {transaction.reference}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                  {transaction.type}
                </td>

                <td className="px-5 py-4">
                  <p
                    className={`text-sm font-semibold ${getAmountClass(
                      transaction.amount,
                    )}`}
                  >
                    {formatTransactionAmount(transaction.amount)}
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    Balance: GH₵{transaction.balanceAfter.toFixed(2)}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <AtlasBadge
                    variant={
                      transaction.status === "Successful"
                        ? "success"
                        : transaction.status === "Pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {transaction.status}
                  </AtlasBadge>
                </td>

                <td className="px-5 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {transaction.date}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(transaction)}
                    className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                    aria-label={`View ${transaction.reference}`}
                  >
                    <span aria-hidden="true" className="text-lg leading-none">
                      →
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-neutral-100 md:hidden dark:divide-neutral-800">
        {transactions.map((transaction) => (
          <button
            key={transaction.id}
            type="button"
            onClick={() => onSelect(transaction)}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <span aria-hidden="true" className="text-lg font-semibold">
                →
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {transaction.description}
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {transaction.type}
                </span>

                <span className="text-neutral-300">•</span>

                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {transaction.date}
                </span>
              </div>

              <div className="mt-2">
                <AtlasBadge
                  variant={
                    transaction.status === "Successful"
                      ? "success"
                      : transaction.status === "Pending"
                        ? "warning"
                        : "danger"
                  }
                >
                  {transaction.status}
                </AtlasBadge>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-semibold ${getAmountClass(
                  transaction.amount,
                )}`}
              >
                {formatTransactionAmount(transaction.amount)}
              </p>

              <span
                aria-hidden="true"
                className="ml-auto mt-1 text-lg leading-none text-neutral-400"
              >
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}