import type {
  PayoutRun,
  PlatformMargin,
} from "../types/commission";
import type { CommissionRow } from "./commission-projection";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
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

export function marginsToCsv(rows: PlatformMargin[]): string {
  const header = [
    "Margin ID",
    "Order",
    "Service",
    "Provider Cost",
    "Atlas Price",
    "Margin",
    "Margin %",
    "Date",
  ];
  const lines = [header.join(",")];
  for (const m of rows) {
    lines.push(
      [
        esc(m.id),
        esc(m.orderId),
        esc(m.service),
        esc(m.providerCost),
        esc(m.atlasPrice),
        esc(m.margin),
        esc(m.marginPercentage),
        esc(m.date),
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
      ].join(",")
    );
  }
  return lines.join("\n");
}