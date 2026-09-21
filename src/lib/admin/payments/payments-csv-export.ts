import type { PaymentsLedgerRow } from "./payments-projection";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function paymentsToCsv(rows: PaymentsLedgerRow[]): string {
  const header = [
    "Payment ID",
    "Reference",
    "User",
    "User Type",
    "Amount",
    "Fee",
    "Net",
    "Method",
    "Provider",
    "Source",
    "Status",
    "Wallet Credit",
    "Refund",
    "Flags",
    "Reconciliations",
    "Created At",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        esc(r.id),
        esc(r.reference),
        esc(r.user.name),
        esc(r.user.type),
        esc(r.amount),
        esc(r.fee),
        esc(r.netAmount),
        esc(r.methodLabel),
        esc(r.provider ?? ""),
        esc(r.sourceLabel),
        esc(r.statusLabel),
        esc(r.walletCreditLabel ?? ""),
        esc(r.refundLabel ?? ""),
        esc(r.flagCount),
        esc(r.reconciliationCount),
        esc(r.createdAt),
      ].join(",")
    );
  }
  return lines.join("\n");
}