import type { TransactionLedgerRow } from "@/lib/admin/types/transaction";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_AUDIENCE_LABELS,
  TRANSACTION_SETTLEMENT_LABELS,
  TRANSACTION_OWNER_TYPE_LABELS,
  TRANSACTION_FAILURE_REASON_LABELS,
} from "./transactions-labels";

const HEADERS = [
  "Transaction ID",
  "Kind",
  "Audience",
  "Status",
  "Settlement",
  "Owner",
  "Owner type",
  "Wallet ID",
  "Amount",
  "Fee",
  "Net",
  "Currency",
  "Payment method",
  "Provider",
  "Order",
  "Created at",
  "Failure reason",
];

function escape(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowFor(row: TransactionLedgerRow): string[] {
  return [
    escape(row.id),
    escape(TRANSACTION_KIND_LABELS[row.kind]),
    escape(TRANSACTION_AUDIENCE_LABELS[row.audience]),
    escape(TRANSACTION_STATUS_LABELS[row.status]),
    escape(TRANSACTION_SETTLEMENT_LABELS[row.settlementStatus]),
    escape(row.ownerName),
    escape(TRANSACTION_OWNER_TYPE_LABELS[row.ownerType]),
    escape(row.walletId),
    escape(row.amount.toFixed(2)),
    escape(row.fee.toFixed(2)),
    escape(row.netAmount.toFixed(2)),
    escape(row.currency),
    escape(row.paymentMethodId),
    escape(row.providerId ?? ""),
    escape(row.relatedOrderId ?? ""),
    escape(row.createdAt),
    escape(row.failure ? TRANSACTION_FAILURE_REASON_LABELS[row.failure.reason] : ""),
  ];
}

export function exportTransactionsCsv(rows: TransactionLedgerRow[]): void {
  const lines: string[] = [];
  lines.push(HEADERS.join(","));
  for (const row of rows) {
    lines.push(rowFor(row).join(","));
  }
  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, "transactions-" + stamp + ".csv");
}