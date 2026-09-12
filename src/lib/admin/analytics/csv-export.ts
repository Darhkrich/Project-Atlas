// lib/admin/analytics/csv-export.ts

import type {
  AnalyticsSummary,
  FailureReasonRow,
  PaymentMethodRow,
  ProviderPerformanceRow,
  SectionBreakdownRow,
  TopMerchantRow,
  TopResellerRow,
  TopServiceRow,
} from "@/lib/admin/types/analytics";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}

export function summaryToCsv(summary: AnalyticsSummary): string {
  const rows: (string | number)[][] = [
    ["Total revenue", summary.totalRevenue, `${summary.comparison.totalRevenue.toFixed(1)}%`],
    ["Total orders", summary.totalOrders, `${summary.comparison.totalOrders.toFixed(1)}%`],
    ["Active users", summary.activeUsers, `${summary.comparison.activeUsers.toFixed(1)}%`],
    ["Success rate", `${summary.successRate}%`, `${summary.comparison.successRate.toFixed(1)}%`],
    ["Avg order value", summary.avgOrderValue, `${summary.comparison.avgOrderValue.toFixed(1)}%`],
  ];
  return toCsv(["Metric", "Value", "Change"], rows);
}

export function sectionBreakdownToCsv(rows: SectionBreakdownRow[]): string {
  return toCsv(
    ["Section", "Revenue", "Orders", "Avg order value", "Success rate"],
    rows.map((r) => [
      r.section,
      r.revenue,
      r.orders,
      r.avgOrderValue,
      `${r.successRate}%`,
    ])
  );
}

export function providerPerformanceToCsv(
  rows: ProviderPerformanceRow[]
): string {
  return toCsv(
    ["Provider", "Transactions", "Success rate", "Avg response (ms)"],
    rows.map((r) => [
      r.providerName,
      r.transactions,
      `${r.successRate}%`,
      r.avgResponseMs,
    ])
  );
}

export function paymentMethodsToCsv(rows: PaymentMethodRow[]): string {
  return toCsv(
    ["Method", "Volume", "Share"],
    rows.map((r) => [r.method, r.volume, `${r.share}%`])
  );
}

export function topServicesToCsv(rows: TopServiceRow[]): string {
  return toCsv(
    ["Service", "Section", "Orders", "Revenue"],
    rows.map((r) => [r.service, r.section, r.orders, r.revenue])
  );
}

export function topResellersToCsv(rows: TopResellerRow[]): string {
  return toCsv(
    ["Reseller", "Tier", "Orders", "Commission paid"],
    rows.map((r) => [r.resellerName, r.tier, r.orders, r.commissionPaid])
  );
}

export function topMerchantsToCsv(rows: TopMerchantRow[]): string {
  return toCsv(
    ["Merchant", "Plan", "Orders", "Revenue"],
    rows.map((r) => [r.merchantName, r.plan, r.orders, r.revenue])
  );
}

export function failureReasonsToCsv(rows: FailureReasonRow[]): string {
  return toCsv(
    ["Reason", "Section", "Count"],
    rows.map((r) => [r.reason, r.section, r.count])
  );
}