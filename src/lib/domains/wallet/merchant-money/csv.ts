// lib/domains/wallet/merchant-money/csv.ts
//
// CSV writer for the merchant ledger view. Pure string builder. The
// caller handles the download.

import type { MerchantLedgerRow } from "./types";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function merchantLedgerToCsv(rows: MerchantLedgerRow[]): string {
  const header = [
    "id",
    "merchantId",
    "merchantName",
    "wallet",
    "kind",
    "direction",
    "amount",
    "fee",
    "total",
    "status",
    "description",
    "detail",
    "createdAt",
  ];

  const body = rows.map((r) => [
    r.id,
    r.merchantId,
    r.merchantName,
    r.walletType,
    r.kind,
    r.direction,
    r.amount,
    r.fee ?? "",
    r.total ?? "",
    r.status ?? "",
    r.description,
    r.detail,
    r.createdAt,
  ]);

  return [header, ...body]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}