import type { Refund } from "@/lib/admin/types/refund";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  REFUND_TYPE_LABELS,
  REFUND_AUDIENCE_LABELS,
  REFUND_STATUS_LABELS,
  reasonLabel,
} from "./refunds-labels";
import { refundedAmount } from "./refunds-helpers";

const HEADERS = [
  "Refund ID",
  "Type",
  "Audience",
  "Status",
  "Order",
  "Customer",
  "Reseller",
  "Amount",
  "Refunded",
  "Atlas share",
  "Reseller share",
  "Reason",
  "Support ticket",
  "Requested at",
  "Completed at",
  "Rejection reason",
];

function escape(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowFor(refund: Refund): string[] {
  return [
    escape(refund.id),
    escape(REFUND_TYPE_LABELS[refund.type]),
    escape(REFUND_AUDIENCE_LABELS[refund.audience]),
    escape(REFUND_STATUS_LABELS[refund.status]),
    escape(refund.order.orderId),
    escape(refund.customer.name),
    escape(refund.reseller?.name ?? ""),
    escape(refund.amount.toFixed(2)),
    escape(refundedAmount(refund).toFixed(2)),
    escape(refund.atlasShareAmount.toFixed(2)),
    escape(refund.resellerShareAmount.toFixed(2)),
    escape(reasonLabel(refund.reason)),
    escape(refund.supportTicketId ?? ""),
    escape(refund.requestedAt),
    escape(refund.completedAt ?? ""),
    escape(refund.rejectionReason ?? ""),
  ];
}

export function exportRefundsCsv(refunds: Refund[]): void {
  const lines: string[] = [];
  lines.push(HEADERS.join(","));
  for (const refund of refunds) {
    lines.push(rowFor(refund).join(","));
  }
  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, "order-refunds-" + stamp + ".csv");
}