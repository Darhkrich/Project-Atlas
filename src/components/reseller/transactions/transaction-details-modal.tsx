"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatCurrency, formatRelative, formatAbsolute } from "@/lib/shared/format";
import type { ResellerTransactionRow } from "@/lib/reseller/types/transaction";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_DIRECTION_LABELS,
  TRANSACTION_DIRECTION_VARIANTS,
} from "@/lib/reseller/wallet/transaction-labels";
import { serviceLabel, networkLabel, providerLabel } from "@/lib/admin/orders/orders-labels";

type TransactionDetailsModalProps = {
  transaction: ResellerTransactionRow | null;
  onClose: () => void;
};

export function TransactionDetailsModal({
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  const now = useNow();

  if (!transaction) return null;

  return (
    <AtlasModalShell
      open
      onClose={onClose}
      title="Transaction Details"
      description={transaction.id}
      size="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-neutral-50 p-5 text-center dark:bg-neutral-800/70">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Transaction Amount
          </p>
          <p
            className={
              "mt-2 text-3xl font-bold " +
              (transaction.direction === "credit"
                ? "text-success-700 dark:text-success-400"
                : "text-neutral-900 dark:text-neutral-100")
            }
          >
            {transaction.direction === "credit" ? "+" : "−"}
            {formatCurrency(transaction.amount)}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <AtlasBadge variant={TRANSACTION_DIRECTION_VARIANTS[transaction.direction]}>
              {TRANSACTION_DIRECTION_LABELS[transaction.direction]}
            </AtlasBadge>
            {transaction.statusLabel && transaction.statusVariant && (
              <AtlasBadge variant={transaction.statusVariant}>
                {transaction.statusLabel}
              </AtlasBadge>
            )}
          </div>
        </div>

        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          <DetailRow label="Description" value={transaction.description} />
          <DetailRow label="Detail" value={transaction.detail} />
          <DetailRow label="Kind" value={TRANSACTION_KIND_LABELS[transaction.kind]} />
          <DetailRow label="Reference" value={transaction.id} />
          <DetailRow
            label="Date"
            value={now ? formatRelative(transaction.createdAt, now) : formatAbsolute(transaction.createdAt)}
          />

          {transaction.fee !== undefined && transaction.fee > 0 && (
            <DetailRow label="Fee" value={formatCurrency(transaction.fee)} />
          )}
          {transaction.total !== undefined && (
            <DetailRow label="Total" value={formatCurrency(transaction.total)} />
          )}

          {transaction.source.type === "order" && (
            <>
              <DetailRow
                label="Service"
                value={serviceLabel(transaction.source.order.serviceId)}
              />
              {transaction.source.order.networkId && (
                <DetailRow
                  label="Network"
                  value={networkLabel(transaction.source.order.networkId)}
                />
              )}
              <DetailRow
                label="Provider"
                value={providerLabel(transaction.source.order.providerId)}
              />
              <DetailRow
                label="Customer"
                value={transaction.source.order.customerName}
              />
            </>
          )}
        </div>
      </div>
    </AtlasModalShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
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