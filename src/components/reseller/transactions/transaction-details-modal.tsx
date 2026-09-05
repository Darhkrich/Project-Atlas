"use client";

import { Button } from "@/components/atlas/button";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import type { Transaction } from "@/lib/transactions-data";
import { formatTransactionAmount } from "@/lib/transactions-data";

type TransactionDetailsModalProps = {
  transaction: Transaction | null;
  onClose: () => void;
};

export function TransactionDetailsModal({
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const statusVariant =
    transaction.status === "Successful"
      ? "success"
      : transaction.status === "Pending"
        ? "warning"
        : "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close transaction details"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Transaction Details
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {transaction.reference}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl bg-neutral-50 p-5 text-center dark:bg-neutral-800/70">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Transaction Amount
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                transaction.amount >= 0
                  ? "text-success-700 dark:text-success-400"
                  : "text-neutral-900 dark:text-neutral-100"
              }`}
            >
              {formatTransactionAmount(transaction.amount)}
            </p>

            <div className="mt-3">
              <AtlasBadge variant={statusVariant}>
                {transaction.status}
              </AtlasBadge>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            <DetailRow label="Description" value={transaction.description} />

            <DetailRow label="Type" value={transaction.type} />

            <DetailRow label="Reference" value={transaction.reference} />

            <DetailRow label="Date" value={transaction.date} />

            {transaction.service && (
              <DetailRow label="Service" value={transaction.service} />
            )}

            {transaction.customer && (
              <DetailRow label="Customer" value={transaction.customer} />
            )}

            {transaction.paymentMethod && (
              <DetailRow
                label="Payment Method"
                value={transaction.paymentMethod}
              />
            )}

            <DetailRow
              label="Balance Before"
              value={`GH₵${transaction.balanceBefore.toFixed(2)}`}
            />

            <DetailRow
              label="Balance After"
              value={`GH₵${transaction.balanceAfter.toFixed(2)}`}
            />
          </div>

          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-4 py-3">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}