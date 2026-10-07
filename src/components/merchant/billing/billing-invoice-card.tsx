"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency, formatDate } from "@/lib/shared/format";
import type { InvoiceRow } from "@/lib/merchant/billing/types";

interface Props {
  row: InvoiceRow;
}

export function BillingInvoiceCard({ row }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-950 dark:text-white">
          {row.invoiceNumber}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {row.planName}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(row.periodStart)} - {formatDate(row.periodEnd)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-neutral-950 dark:text-white">
          {formatCurrency(row.amount)}
        </p>
        <div className="mt-1">
          <AtlasBadge variant={row.statusVariant}>{row.statusLabel}</AtlasBadge>
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(row.issuedAt)}
        </p>
      </div>
    </div>
  );
}