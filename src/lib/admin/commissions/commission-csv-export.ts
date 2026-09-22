// lib/admin/commissions/commission-csv-export.ts

import type { PayoutRun, ResellerCommission } from "../types/commission";
import type { CommissionRow } from "./commission-projection";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function type1Of(c: ResellerCommission): number {
  return Math.round((c.atlasPrice - c.providerCost) * 100) / 100;
}

function type2Of(c: ResellerCommission): number {
  return (
    Math.round((c.atlasPrice - c.providerCost - c.baseCommission) * 100) /
    100
  );
}

function type3Of(c: ResellerCommission): number {
  return (
    Math.round(
      (c.atlasPrice -
        c.providerCost -
        c.baseCommission +
        c.atlasExtraCut) *
        100
    ) / 100
  );
}

export function commissionsToCsv(rows: CommissionRow[]): string {
  const header = [
    "Commission ID",
    "Reseller",
    "Order",
    "Service",
    "Category",
    "Tier",
    "Provider Cost",
    "Atlas Price",
    "Reseller Price",
    "Base Commission",
    "Extra Amount",
    "Atlas Extra Cut",
    "Reseller Extra Cut",
    "Total Commission",
    "Extra Cut %",
    "Status",
    "Created",
    "Paid",
    "Reversed",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        esc(r.id),
        esc(r.resellerName),
        esc(r.orderId),
        esc(r.service),
        esc(r.serviceCategoryLabel),
        esc(r.tierName ?? ""),
        esc(r.providerCost),
        esc(r.atlasPrice),
        esc(r.resellerPrice),
        esc(r.baseCommission),
        esc(r.extraAmount),
        esc(r.atlasExtraCut),
        esc(r.resellerExtraCut),
        esc(r.totalCommission),
        esc(r.effectiveExtraCutPercent ?? ""),
        esc(r.statusLabel),
        esc(r.createdAt),
        esc(r.paidAt ?? ""),
        esc(r.reversedAt ?? ""),
      ].join(",")
    );
  }
  return lines.join("\n");
}

export function marginsToCsv(rows: CommissionRow[]): string {
  const header = [
    "Commission ID",
    "Order",
    "Service",
    "Provider Cost",
    "Atlas Price",
    "Type 1 Margin",
    "Type 2 Margin",
    "Type 3 Margin",
    "Date",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    if (r.status !== "paid") continue;
    const c = r.raw;
    lines.push(
      [
        esc(r.id),
        esc(r.orderId),
        esc(r.service),
        esc(r.providerCost),
        esc(r.atlasPrice),
        esc(type1Of(c)),
        esc(type2Of(c)),
        esc(type3Of(c)),
        esc(r.createdAt),
      ].join(",")
    );
  }
  return lines.join("\n");
}

export function payoutRunsToCsv(rows: PayoutRun[]): string {
  const header = [
    "Payout ID",
    "Date",
    "Total Amount",
    "Resellers",
    "Status",
    "Commission IDs",
    "Failure Reason",
  ];
  const lines = [header.join(",")];
  for (const p of rows) {
    lines.push(
      [
        esc(p.id),
        esc(p.date),
        esc(p.totalAmount),
        esc(p.resellerCount),
        esc(p.status),
        esc(p.commissionIds.join("; ")),
        esc(p.failureReason ?? ""),
      ].join(",")
    );
  }
  return lines.join("\n");
}