import type { PlanPricingRow } from "./types";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function pricingRowsToCsv(rows: PlanPricingRow[]): string {
  const header = [
    "Plan ID",
    "Category",
    "Network",
    "Plan",
    "Provider Cost",
    "Atlas Price",
    "Reseller Price",
    "Margin",
    "Margin %",
    "Status",
  ].join(",");

  const lines = rows.map((r) =>
    [
      esc(r.planId),
      esc(r.categoryName),
      esc(r.network),
      esc(r.planName),
      esc(r.providerCost.toFixed(2)),
      esc(r.atlasPrice.toFixed(2)),
      esc(r.resellerPrice.toFixed(2)),
      esc(r.margin.toFixed(2)),
      esc(r.marginPercent.toFixed(2)),
      esc(r.status),
    ].join(",")
  );

  return [header, ...lines].join("\n");
}