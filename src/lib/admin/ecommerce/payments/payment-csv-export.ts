import type { LedgerRow } from "@/lib/admin/types/merchant-money";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function ledgerToCsv(rows: LedgerRow[]): string {
  const header = [
    "Event ID",
    "Kind",
    "Merchant ID",
    "Merchant",
    "Amount",
    "Fee",
    "Status",
    "Source",
    "Reference",
    "Created At",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        esc(r.id),
        esc(r.kind),
        esc(r.merchantId),
        esc(r.merchantName),
        esc(r.amount),
        esc(r.fee),
        esc(r.statusLabel),
        esc(r.sourceLabel),
        esc(r.sourceRef),
        esc(r.createdAt),
      ].join(",")
    );
  }
  return lines.join("\n");
}