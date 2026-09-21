"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  PlanDistributionPoint,
  TemplateRevenuePoint,
  TopMerchantRow,
} from "@/lib/admin/ecommerce/dashboard-projection";
import { ResellerDashboardChartCard } from "@/components/admin/resellers/reseller-dashboard-chart-card";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import {
  PLAN_PIE_COLORS,
} from "@/lib/admin/ecommerce/dashboard-labels";

interface EcommerceDashboardChartsProps {
  planDistribution: PlanDistributionPoint[];
  topMerchants: TopMerchantRow[];
  revenueByTemplate: TemplateRevenuePoint[];
  loading?: boolean;
}

const CHART = {
  brand: "#166e59",
  info: "#3b82f6",
  warning: "#f59e0b",
} as const;

const TEMPLATE_COLORS: Record<string, string> = {
  "tpl-general-store": "#166e59",
  "tpl-cosmetics-luxe": "#a16207",
  "tpl-fashion-modern": "#3b82f6",
};

const CHART_GRID = {
  strokeDasharray: "3 3",
  stroke: "currentColor",
  className: "text-neutral-200 dark:text-neutral-700",
} as const;

const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  fontSize: 11,
} as const;

export function EcommerceDashboardCharts({
  planDistribution,
  topMerchants,
  revenueByTemplate,
  loading,
}: EcommerceDashboardChartsProps) {
  const totalMerchants = planDistribution.reduce(
    (sum, p) => sum + p.count,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerDashboardChartCard
        title="Subscription plan distribution"
        period="Current"
        srSummary={planDistributionSummary(planDistribution)}
        loading={loading}
        empty={totalMerchants === 0}
        emptyMessage="No merchants yet."
      >
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={planDistribution}
              dataKey="count"
              nameKey="plan"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {planDistribution.map((entry) => (
                <Cell
                  key={entry.code}
                  fill={PLAN_PIE_COLORS[entry.code] ?? CHART.brand}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name: string, payload) => {
                const point = payload?.payload as
                  | PlanDistributionPoint
                  | undefined;
                return [
                  formatNumber(value) +
                    " merchant" +
                    (value === 1 ? "" : "s"),
                  point ? point.plan : "Plan",
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <ul
          role="list"
          className="mt-3 flex flex-wrap justify-center gap-3 text-xs"
        >
          {planDistribution.map((p) => (
            <li key={p.code} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: PLAN_PIE_COLORS[p.code] ?? CHART.brand,
                }}
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                {p.plan}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                ({p.count})
              </span>
            </li>
          ))}
        </ul>
      </ResellerDashboardChartCard>

      <ResellerDashboardChartCard
        title="Top merchants by revenue"
        period="Lifetime"
        srSummary={topMerchantsSummary(topMerchants)}
        loading={loading}
        empty={topMerchants.length === 0}
        emptyMessage="No merchant revenue recorded."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={topMerchants}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid {...CHART_GRID} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              reversed
              {...AXIS_PROPS}
            />
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(value),
                "Revenue",
              ]}
            />
            <Bar
              dataKey="revenue"
              fill={CHART.brand}
              barSize={20}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ResellerDashboardChartCard>

      <ResellerDashboardChartCard
        title="Revenue by template"
        period="Lifetime"
        srSummary={templateRevenueSummary(revenueByTemplate)}
        loading={loading}
        empty={revenueByTemplate.length === 0}
        emptyMessage="No template revenue recorded."
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={revenueByTemplate}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid {...CHART_GRID} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="template"
              type="category"
              width={180}
              reversed
              {...AXIS_PROPS}
            />
            <Tooltip
              formatter={(value: number, _name: string, payload) => {
                const row = payload?.payload as
                  | TemplateRevenuePoint
                  | undefined;
                const suffix = row
                  ? " · " + row.merchantCount + " merchants"
                  : "";
                return [formatCurrency(value) + suffix, "Revenue"];
              }}
            />
            <Bar dataKey="revenue" barSize={24} radius={[0, 4, 4, 0]}>
              {revenueByTemplate.map((row) => (
                <Cell
                  key={row.template}
                  fill={TEMPLATE_COLORS[row.template] ?? CHART.info}
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

function planDistributionSummary(
  points: PlanDistributionPoint[]
): string {
  if (points.length === 0) return "No plan data.";
  const total = points.reduce((sum, p) => sum + p.count, 0);
  if (total === 0) return "No merchants on any plan.";
  const parts = points.map((p) => p.plan + ": " + p.count);
  return (
    "Subscription plan distribution. " +
    total +
    " merchants total. " +
    parts.join(". ") +
    "."
  );
}

function topMerchantsSummary(rows: TopMerchantRow[]): string {
  if (rows.length === 0) return "No merchant revenue recorded.";
  const top = rows[0];
  return (
    "Top " +
    rows.length +
    " merchants by lifetime revenue. Highest: " +
    top.name +
    " at " +
    formatCurrency(top.revenue) +
    " across " +
    formatNumber(top.orders) +
    " orders."
  );
}

function templateRevenueSummary(points: TemplateRevenuePoint[]): string {
  if (points.length === 0) return "No template revenue recorded.";
  const parts = points.map(
    (p) =>
      p.template +
      ": " +
      formatCurrency(p.revenue) +
      " across " +
      p.merchantCount +
      " merchants"
  );
  return "Revenue by template. " + parts.join(". ") + ".";
}