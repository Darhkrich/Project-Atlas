// components/admin/analytics/failure-analysis.tsx
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
import { SECTION_FILTER_LABEL } from "@/lib/admin/analytics/contants";
import {
  AnalyticsTooltip,
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
} from "@/lib/admin/analytics/chart-theme";
import type { FailureReasonRow } from "@/lib/admin/types/analytics";

interface FailureAnalysisProps {
  rows: FailureReasonRow[];
}

export function FailureAnalysis({ rows }: FailureAnalysisProps) {
  const chartData = rows.map((r) => ({
    reason:
      r.reason.length > 22 ? `${r.reason.slice(0, 20)}...` : r.reason,
    fullReason: r.reason,
    count: r.count,
  }));

  const total = rows.reduce((acc, r) => acc + r.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failure analysis</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {total > 0
            ? `${formatNumber(total)} failed attempts across all sources in the current range.`
            : "No failures in the current range."}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No failure data for the current filters.
          </p>
        ) : (
          <>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 16, bottom: 40, left: -8 }}
                >
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    dataKey="reason"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={70}
                    {...chartAxisProps}
                  />
                  <YAxis {...chartAxisProps} />
                  <Tooltip
                    content={
                      <AnalyticsTooltip
                        valueFormatter={(v) => `${formatNumber(v)} failed`}
                      />
                    }
                  />
                  <Bar
                    dataKey="count"
                    name="Failed attempts"
                    fill={CHART_COLORS[4]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.reason}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {row.reason}
                    </p>
                    <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                      {SECTION_FILTER_LABEL[row.section]}
                    </p>
                  </div>
                  <Badge variant="danger">
                    {formatNumber(row.count)}
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