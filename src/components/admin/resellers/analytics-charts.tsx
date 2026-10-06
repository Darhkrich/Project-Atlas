// components/admin/resellers/analytics-charts.tsx
"use client";

import type {
  RevenueByResellerRow,
  RevenueByTierRow,
  VerificationCount,
} from "@/lib/admin/resellers/analytics-projection";
import type { Reseller } from "@/lib/admin/types/reseller";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { chartFormatter } from "@/lib/admin/charts/format";
import { ResellerDashboardChartCard } from "./reseller-dashboard-chart-card";
import {
  CHART_AXIS_PROPS,
  CHART_COLORS,
  CHART_GRID_PROPS,
  TIER_COLORS,
  VERIFICATION_COLORS,
} from "@/lib/admin/resellers/chart-theme";
import { VERIFICATION_STATUS_LABEL } from "@/lib/admin/resellers/dashboard-labels";

interface AnalyticsChartsProps {
  revenueByReseller: RevenueByResellerRow[];
  revenueByTier: RevenueByTierRow[];
  byVerification: VerificationCount[];
  topN: number;
  loading?: boolean;
}

export function AnalyticsCharts({
  revenueByReseller,
  revenueByTier,
  byVerification,
  topN,
  loading,
}: AnalyticsChartsProps) {
  const revResellerSummary = buildResellerSummary(revenueByReseller);
  const revTierSummary = buildTierSummary(revenueByTier);
  const verifSummary = buildVerificationSummary(byVerification);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerDashboardChartCard
        title="Revenue by reseller"
        period={`Top ${topN}`}
        srSummary={revResellerSummary}
        loading={loading}
        empty={revenueByReseller.length === 0}
        emptyMessage="No reseller revenue recorded yet."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={revenueByReseller}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis
              type="number"
              hide
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              reversed
              {...CHART_AXIS_PROPS}
            />
            <Tooltip
              formatter={chartFormatter((value) => [
                formatCurrency(value),
                "Revenue",
              ])}
            />
            <Bar dataKey="revenue" barSize={20} radius={[0, 4, 4, 0]}>
              {revenueByReseller.map((row) => (
                <Cell
                  key={row.id}
                  fill={TIER_COLORS[row.tier] ?? CHART_COLORS.brand}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ResellerDashboardChartCard>

      <ResellerDashboardChartCard
        title="Revenue by tier"
        period="All time"
        srSummary={revTierSummary}
        loading={loading}
        empty={revenueByTier.length === 0}
        emptyMessage="No tier data yet."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={revenueByTier}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="tier"
              type="category"
              width={100}
              reversed
              {...CHART_AXIS_PROPS}
            />
            <Tooltip
              formatter={chartFormatter((value, _name, entry) => {
                const row = entry.payload as
                  | RevenueByTierRow
                  | undefined;
                const suffix = row
                  ? " \u00B7 " + row.count + " resellers"
                  : "";
                return [formatCurrency(value) + suffix, "Revenue"];
              })}
            />
            <Bar dataKey="revenue" barSize={24} radius={[0, 4, 4, 0]}>
              {revenueByTier.map((row) => (
                <Cell
                  key={row.tierId}
                  fill={TIER_COLORS[row.tier] ?? CHART_COLORS.brand}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ResellerDashboardChartCard>

      <ResellerDashboardChartCard
        title="Resellers by verification status"
        period="Current"
        srSummary={verifSummary}
        loading={loading}
        empty={byVerification.every((v) => v.count === 0)}
        emptyMessage="No resellers to report."
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byVerification} margin={{ left: 20, right: 20 }}>
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis
              dataKey="status"
              tickFormatter={(v: Reseller["verificationStatus"]) =>
                VERIFICATION_STATUS_LABEL[v] ?? v
              }
              {...CHART_AXIS_PROPS}
            />
            <YAxis
              allowDecimals={false}
              {...CHART_AXIS_PROPS}
            />
            <Tooltip
              formatter={chartFormatter((value, _name, entry) => {
                const row = entry.payload as VerificationCount | undefined;
                const label = row
                  ? VERIFICATION_STATUS_LABEL[row.status]
                  : "Resellers";
                return [formatNumber(value), label];
              })}
            />
            <Bar dataKey="count" barSize={40} radius={[4, 4, 0, 0]}>
              {byVerification.map((row) => (
                <Cell
                  key={row.status}
                  fill={
                    VERIFICATION_COLORS[row.status] ?? CHART_COLORS.neutral
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ResellerDashboardChartCard>
    </div>
  );
}

/* ------------------------------ SR summaries -------------------------- */

function buildResellerSummary(rows: RevenueByResellerRow[]): string {
  if (rows.length === 0) return "No reseller revenue recorded.";
  const top = rows[0];
  const total = rows.reduce((sum, r) => sum + r.revenue, 0);
  return "Revenue by reseller, top " + rows.length + ". Highest: " + top.name + " at " + formatCurrency(top.revenue) + ". Combined across listed resellers: " + formatCurrency(total) + ".";
}

function buildTierSummary(rows: RevenueByTierRow[]): string {
  if (rows.length === 0) return "No tier data.";
  const parts = rows.map(
    (r) => r.tier + ": " + formatCurrency(r.revenue) + " across " + r.count + " resellers"
  );
  return "Revenue by tier. " + parts.join(". ") + ".";
}

function buildVerificationSummary(rows: VerificationCount[]): string {
  if (rows.length === 0) return "No verification data.";
  const parts = rows.map(
    (r) => VERIFICATION_STATUS_LABEL[r.status] + ": " + r.count
  );
  return "Resellers by verification status. " + parts.join(". ") + ".";
}