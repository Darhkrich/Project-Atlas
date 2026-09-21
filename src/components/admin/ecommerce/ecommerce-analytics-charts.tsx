"use client";

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
import type {
  CohortPoint,
  SubscriptionHealthRow,
} from "@/lib/admin/ecommerce/analytics-projection";
import { ResellerDashboardChartCard } from "@/components/admin/resellers/reseller-dashboard-chart-card";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import {
  ALL_SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_COLOR,
  SUBSCRIPTION_STATUS_LABEL,
  type SubscriptionHealthStatus,
} from "@/lib/admin/ecommerce/analytics-labels";

interface EcommerceAnalyticsChartsProps {
  cohorts: CohortPoint[];
  subscriptionHealth: SubscriptionHealthRow[];
  loading?: boolean;
}

const CHART = {
  brand: "#166e59",
} as const;

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

export function EcommerceAnalyticsCharts({
  cohorts,
  subscriptionHealth,
  loading,
}: EcommerceAnalyticsChartsProps) {
  const cohortTotal = cohorts.reduce((sum, c) => sum + c.count, 0);
  const healthTotal = subscriptionHealth.reduce(
    (sum, r) => sum + r.total,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerDashboardChartCard
        title="Merchant signups by cohort"
        period="All time"
        srSummary={cohortSummary(cohorts)}
        loading={loading}
        empty={cohorts.length === 0}
        emptyMessage="No merchant cohorts yet."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={cohorts} margin={{ top: 10, right: 10 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip
              formatter={(value: number, _name: string, payload) => {
                const point = payload?.payload as CohortPoint | undefined;
                const revenue = point
                  ? formatCurrency(point.lifetimeRevenue)
                  : "";
                return [
                  formatNumber(value) +
                    " merchant" +
                    (value === 1 ? "" : "s") +
                    (revenue ? " · " + revenue + " lifetime" : ""),
                  "Signups",
                ];
              }}
            />
            <Bar
              dataKey="count"
              fill={CHART.brand}
              radius={[4, 4, 0, 0]}
              barSize={28}
            >
              {cohorts.map((c) => (
                <Cell key={c.key} fill={CHART.brand} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {cohortTotal} merchant{cohortTotal === 1 ? "" : "s"} across{" "}
          {cohorts.length} cohort{cohorts.length === 1 ? "" : "s"}
        </p>
      </ResellerDashboardChartCard>

      <ResellerDashboardChartCard
        title="Subscription health by plan"
        period="Current"
        srSummary={healthSummary(subscriptionHealth)}
        loading={loading}
        empty={healthTotal === 0}
        emptyMessage="No subscriptions yet."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={subscriptionHealth}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid {...CHART_GRID} />
            <XAxis type="number" allowDecimals={false} {...AXIS_PROPS} />
            <YAxis
              dataKey="planName"
              type="category"
              width={100}
              reversed
              {...AXIS_PROPS}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatNumber(value) +
                  " merchant" +
                  (value === 1 ? "" : "s"),
                name,
              ]}
            />
            {ALL_SUBSCRIPTION_STATUSES.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="health"
                fill={SUBSCRIPTION_STATUS_COLOR[status]}
                name={SUBSCRIPTION_STATUS_LABEL[status]}
                barSize={24}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <ul
          role="list"
          className="mt-3 flex flex-wrap justify-center gap-3 text-xs"
        >
          {ALL_SUBSCRIPTION_STATUSES.map((status: SubscriptionHealthStatus) => (
            <li key={status} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SUBSCRIPTION_STATUS_COLOR[status] }}
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                {SUBSCRIPTION_STATUS_LABEL[status]}
              </span>
            </li>
          ))}
        </ul>
      </ResellerDashboardChartCard>
    </div>
  );
}

/* ------------------------------ SR summaries -------------------------- */

function cohortSummary(points: CohortPoint[]): string {
  if (points.length === 0) return "No merchant cohorts yet.";
  const total = points.reduce((sum, p) => sum + p.count, 0);
  const peak = points.reduce((a, b) => (a.count > b.count ? a : b));
  return (
    "Merchant signups by cohort. " +
    total +
    " merchants across " +
    points.length +
    " cohorts. Peak: " +
    peak.label +
    " with " +
    peak.count +
    " signups."
  );
}

function healthSummary(rows: SubscriptionHealthRow[]): string {
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  if (total === 0) return "No subscriptions yet.";
  const parts = rows.map(
    (r) =>
      r.planName +
      ": " +
      r.active +
      " active, " +
      r.past_due +
      " past due, " +
      r.expired +
      " expired, " +
      r.cancelled +
      " cancelled"
  );
  return "Subscription health by plan. " + parts.join(". ") + ".";
}