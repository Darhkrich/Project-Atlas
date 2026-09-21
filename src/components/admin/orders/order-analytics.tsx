"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import type {
  OrdersAnalyticsView,
  OrdersAnalyticsRange,
} from "@/lib/admin/orders/orders-projection";
import { cn } from "@/lib/utils";

interface OrderAnalyticsProps {
  view: OrdersAnalyticsView;
  range: OrdersAnalyticsRange;
  onRangeChange: (range: OrdersAnalyticsRange) => void;
}

const CHART_BRAND = "#166e59";
const CHART_GRID = "rgba(148, 163, 184, 0.25)";

const RANGE_OPTIONS: { value: OrdersAnalyticsRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

export function OrderAnalytics({
  view,
  range,
  onRangeChange,
}: OrderAnalyticsProps) {
  const trendData = useMemo(
    () =>
      view.trend.map((point) => ({
        label: point.label,
        orders: point.orders,
        revenue: point.revenue,
        failures: point.failures,
      })),
    [view.trend]
  );

  const serviceRows = useMemo(
    () =>
      [...view.serviceBreakdown].sort((a, b) => b.orders - a.orders).slice(0, 6),
    [view.serviceBreakdown]
  );

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="Analytics date range"
        className="flex flex-wrap items-center gap-1"
      >
        {RANGE_OPTIONS.map((option) => {
          const active = option.value === range;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onRangeChange(option.value)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/50 dark:text-brand-300"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        role="region"
        aria-label="Order analytics summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Retrying now
              </p>
              <p className="mt-2 text-2xl font-bold">
                {view.retryMetrics.retryingNow}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Automatic retry in flight
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Recovered today
              </p>
              <p className="mt-2 text-2xl font-bold text-success-700 dark:text-success-300">
                {view.retryMetrics.recoveredToday}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Orders delivered after a retry
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Exhausted today
              </p>
              <p className="mt-2 text-2xl font-bold text-danger-700 dark:text-danger-300">
                {view.retryMetrics.exhaustedToday}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Failed after all retry attempts
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Failure mix
              </p>
              <p className="mt-2 text-2xl font-bold">
                {view.failureClassCounts.system +
                  view.failureClassCounts.customer}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {view.failureClassCounts.system} system,{" "}
                {view.failureClassCounts.customer} customer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders and revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_GRID}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={40}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "revenue"
                    ? [formatCurrency(value), "Revenue"]
                    : [value, name === "orders" ? "Orders" : "Failures"]
                }
              />
              <Bar dataKey="orders" fill={CHART_BRAND} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {view.statusCounts.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders in this range.</p>
            ) : (
              <ul role="list" className="space-y-2">
                {view.statusCounts.map((entry) => {
                  const total = view.statusCounts.reduce(
                    (acc, s) => acc + s.count,
                    0
                  );
                  const pct =
                    total > 0 ? Math.round((entry.count / total) * 1000) / 10 : 0;
                  return (
                    <li
                      key={entry.status}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{entry.label}</span>
                      <span className="text-neutral-500">
                        {entry.count} ({pct}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service performance</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceRows.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders in this range.</p>
            ) : (
              <ul role="list" className="space-y-3">
                {serviceRows.map((row) => (
                  <li key={row.serviceId}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="text-neutral-500">
                        {row.orders} orders
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          row.successRate >= 95
                            ? "bg-success-500"
                            : row.successRate >= 90
                            ? "bg-warning-500"
                            : "bg-danger-500"
                        )}
                        style={{ width: row.successRate + "%" }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-neutral-500">
                      <span>Success: {row.successRate}%</span>
                      <span>Revenue: {formatCurrency(row.revenue)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}