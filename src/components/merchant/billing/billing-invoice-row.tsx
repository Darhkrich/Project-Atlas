"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency, formatDate } from "@/lib/shared/format";
import type { InvoiceRow } from "@/lib/merchant/billing/types";

interface Props {
  row: InvoiceRow;
}

export function BillingInvoiceRow({ row }: Props) {
  return (
    <tr className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800">
      <th
        scope="row"
        className="px-4 py-3 text-left text-sm font-medium text-neutral-950 dark:text-white"
      >
        {row.invoiceNumber}
      </th>
      <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
        {row.planName}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
        {formatDate(row.periodStart)} - {formatDate(row.periodEnd)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-neutral-950 dark:text-white">
        {formatCurrency(row.amount)}
      </td>
      <td className="px-4 py-3">
        <AtlasBadge variant={row.statusVariant}>{row.statusLabel}</AtlasBadge>
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
        {formatDate(row.issuedAt)}
      </td>
    </tr>
  );
}