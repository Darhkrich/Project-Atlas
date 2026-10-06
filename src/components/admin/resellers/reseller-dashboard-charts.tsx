/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/resellers/reseller-dashboard-charts.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  PendingCommissionPoint,
  ResellerGrowthPoint,
  TierCommissionPoint,
  TopReseller,
} from "@/lib/admin/types/reseller-dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { chartFormatter } from "@/lib/admin/charts/format";
import { ResellerDashboardChartCard } from "./reseller-dashboard-chart-card";

interface ResellerDashboardChartsProps {
  growth: ResellerGrowthPoint[];
  topResellers: TopReseller[];
  commissionsByTier: TierCommissionPoint[];
  topPendingCommissions: PendingCommissionPoint[];
  loading?: boolean;
}

const CHART = {
  brand: "#166e59",
  success: "#22c55e",
  warning: "#f59e0b",
} as const;

const TIER_COLORS: Record<string, string> = {
  Bronze: "#a16207",
  Silver: "#64748b",
  Gold: "#166e59",
};

type CommissionView = "tier" | "pending";

export function ResellerDashboardCharts({
  growth,
  topResellers,
  commissionsByTier,
  topPendingCommissions,
  loading,
}: ResellerDashboardChartsProps) {
  const [commissionView, setCommissionView] = useState<CommissionView>("tier");

  const growthSummary = buildGrowthSummary(growth);
  const commissionSummary =
    commissionView === "tier"
      ? buildTierSummary(commissionsByTier)
      : buildPendingSummary(topPendingCommissions);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ResellerDashboardChartCard
        title="Reseller growth"
        period="Last 8 months"
        srSummary={growthSummary}
        loading={loading}
        empty={growth.length === 0}
        emptyMessage="No reseller growth data yet."
      >
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={growth}>
            <defs>
              <linearGradient
                id="resellerGrowthGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={CHART.brand}
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor={CHART.brand}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              allowDecimals={false}
            />
            <Tooltip
              formatter={chartFormatter((value) => [
                formatNumber(value),
                "New resellers",
              ])}
            />
            <Area
              type="monotone"
              dataKey="newResellers"
              stroke={CHART.brand}
              fill="url(#resellerGrowthGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ResellerDashboardChartCard>

      <TopResellersCard topResellers={topResellers} loading={loading} />

      <ResellerDashboardChartCard
        title="Commission breakdown"
        period="All time"
        srSummary={commissionSummary}
        loading={loading}
        empty={
          commissionView === "tier"
            ? commissionsByTier.length === 0
            : topPendingCommissions.length === 0
        }
        emptyMessage="No commission data yet."
        className="lg:col-span-2"
      >
        <div
          role="group"
          aria-label="Commission view"
          className="mb-3 flex justify-end gap-1"
        >
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={commissionView === "tier"}
            className={cn(
              "text-xs",
              commissionView === "tier" &&
                "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            )}
            onClick={() => setCommissionView("tier")}
          >
            By tier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={commissionView === "pending"}
            className={cn(
              "text-xs",
              commissionView === "pending" &&
                "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            )}
            onClick={() => setCommissionView("pending")}
          >
            Top pending
          </Button>
        </div>

        {commissionView === "tier" ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={commissionsByTier}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <XAxis
                dataKey="tier"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v: number) => formatNumber(v)}
              />
              <Tooltip
                formatter={chartFormatter((value, name) => [
                  formatCurrency(value),
                  name === "paid" ? "Paid" : "Pending",
                ])}
              />
              <Bar
                dataKey="paid"
                stackId="commission"
                fill={CHART.brand}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="pending"
                stackId="commission"
                fill={CHART.warning}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={topPendingCommissions}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
                fontSize={11}
                reversed
              />
              <Tooltip
                formatter={chartFormatter((value) => [
                  formatCurrency(value),
                  "Pending",
                ])}
              />
              <Bar
                dataKey="pending"
                fill={CHART.warning}
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ResellerDashboardChartCard>
    </div>
  );
}

/* ------------------------------ Top resellers ------------------------- */

function TopResellersCard({
  topResellers,
  loading,
}: {
  topResellers: TopReseller[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top resellers by revenue</CardTitle>
        <Link
          href="/admin/resellers"
          className="rounded-sm text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : topResellers.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No reseller revenue recorded yet.
          </p>
        ) : (
          <ol role="list" className="space-y-1">
            {topResellers.map((r, index) => (
              <li key={r.id}>
                <Link
                  href={r.href}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-neutral-900"
                >
                  <span className="w-4 text-right text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {r.name}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {r.tier}
                  </Badge>
                  <span className="w-20 text-right text-xs text-neutral-500 dark:text-neutral-400">
                    {formatCurrency(r.revenue)}
                  </span>
                  <span className="w-20 text-right text-xs font-medium">
                    {formatCurrency(r.commissions)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ SR summaries -------------------------- */

function buildGrowthSummary(growth: ResellerGrowthPoint[]): string {
  if (growth.length === 0) return "No reseller growth data.";
  const values = growth.map((p) => p.newResellers);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const peak = growth.find((p) => p.newResellers === max);
  const total = values.reduce((a, b) => a + b, 0);
  return "Reseller growth over " + growth.length + " months. " + total + " new resellers total. Range " + min + " to " + max + " per month, peaking in " + peak?.month + " " + peak?.year + ".";
}

function buildTierSummary(points: TierCommissionPoint[]): string {
  if (points.length === 0) return "No commission data.";
  const parts = points.map(
    (p) =>
      p.tier + ": " + formatCurrency(p.paid) + " paid, " + formatCurrency(p.pending) + " pending"
  );
  return "Commissions by tier. " + parts.join(". ") + ".";
}

function buildPendingSummary(points: PendingCommissionPoint[]): string {
  if (points.length === 0) return "No pending commissions.";
  const top = points[0];
  const total = points.reduce((sum, p) => sum + p.pending, 0);
  return "Top " + points.length + " resellers by pending commissions. " + formatCurrency(total) + " owed in total. Highest: " + top.name + " at " + formatCurrency(top.pending) + ".";
}