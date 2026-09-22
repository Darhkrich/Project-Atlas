// lib/domains/wallet/merchant-money/csv.ts
//
// CSV writers for merchant money views. Two writers: ledger and
// withdrawal queue. Both are pure string builders. Callers handle the
// download.

import type {
  MerchantLedgerRow,
  MerchantPendingWithdrawalRow,
} from "./types";

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

export function merchantWithdrawalQueueToCsv(
  rows: MerchantPendingWithdrawalRow[]
): string {
  const header = [
    "id",
    "amount",
    "fee",
    "total",
    "destination",
    "status",
    "approvalReasons",
    "requestedAt",
  ];

  const body = rows.map((r) => [
    r.id,
    r.amount,
    r.fee,
    r.total,
    r.destination,
    r.statusLabel,
    r.approvalReasons.join("|"),
    r.requestedAt,
  ]);

  return [header, ...body]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}