/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/analytics/provider-performance.tsx
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { formatNumber } from "@/lib/admin/formatters";
import {
  AnalyticsTooltip,
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
  chartMargins,
} from "@/lib/admin/analytics/chart-theme";
import type { ProviderPerformanceRow } from "@/lib/admin/types/analytics";

interface ProviderPerformanceProps {
  rows: ProviderPerformanceRow[];
}

function toneFor(successRate: number) {
  if (successRate >= 97) return "success";
  if (successRate >= 92) return "warning";
  return "danger";
}

export function ProviderPerformance({ rows }: ProviderPerformanceProps) {
  const chartData = rows
    .filter((r) => r.transactions > 0)
    .map((r) => ({
      name: r.providerName,
      successRate: r.successRate,
      transactions: r.transactions,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider performance</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Transaction success rates across configured providers.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {chartData.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No provider activity for the current filters.
          </p>
        ) : (
          <>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                >
                  <CartesianGrid {...chartGridProps} horizontal={false} vertical />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    {...chartAxisProps}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    {...chartAxisProps}
                  />
                  <Tooltip
                    content={
                      <AnalyticsTooltip
                        valueFormatter={(v) => `${v.toFixed(1)}%`}
                      />
                    }
                  />
                  <Bar
                    dataKey="successRate"
                    fill={CHART_COLORS[0]}
                    radius={[0, 4, 4, 0]}
                    name="Success rate"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.providerId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {row.providerName}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {formatNumber(row.transactions)} transactions ·{" "}
                      {row.avgResponseMs > 0
                        ? `${formatNumber(row.avgResponseMs)}ms avg`
                        : "no latency data"}
                    </p>
                  </div>
                  <Badge variant={toneFor(row.successRate)}>
                    {row.successRate.toFixed(1)}%
                  </Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}