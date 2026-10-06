"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartFormatter } from "@/lib/shared/charts/format";
import {
  AXIS_STROKE_CLASS,
  CHART_PALETTE,
} from "@/lib/shared/charts/theme";
import {
  CHART_HEIGHT_DESKTOP,
  CHART_HEIGHT_MOBILE,
} from "@/lib/merchant/analytics/constants";
import { CHART_REVENUE_TITLE, CHART_EMPTY } from "@/lib/merchant/analytics/labels";
import type { SeriesPoint } from "@/lib/merchant/analytics/types";

interface AnalyticsRevenueChartProps {
  series: SeriesPoint[];
}

function formatAxisValue(value: number): string {
  if (value === 0) return "0";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "k";
  return String(Math.round(value));
}

export function AnalyticsRevenueChart({
  series,
}: AnalyticsRevenueChartProps) {
  const hasData = series.some((p) => p.revenue > 0);

  return (
    <section
      aria-labelledby="analytics-revenue-heading"
      className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <h2
        id="analytics-revenue-heading"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        {CHART_REVENUE_TITLE}
      </h2>

      {!hasData ? (
        <p className="mt-4 flex h-40 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
          {CHART_EMPTY}
        </p>
      ) : (
        <>
          <div className="mt-4 hidden sm:block" style={{ height: CHART_HEIGHT_DESKTOP }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_PALETTE.brand}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_PALETTE.brand}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className={AXIS_STROKE_CLASS}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke={CHART_PALETTE.neutral}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke={CHART_PALETTE.neutral}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxisValue}
                  width={48}
                />
                <Tooltip
                  formatter={chartFormatter((value) => [
                    "GH\u20B5 " + value.toFixed(2),
                    "Revenue",
                  ])}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_PALETTE.brand}
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 block sm:hidden" style={{ height: CHART_HEIGHT_MOBILE }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFillMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_PALETTE.brand}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_PALETTE.brand}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className={AXIS_STROKE_CLASS}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  stroke={CHART_PALETTE.neutral}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke={CHART_PALETTE.neutral}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxisValue}
                  width={36}
                />
                <Tooltip
                  formatter={chartFormatter((value) => [
                    "GH\u20B5 " + value.toFixed(2),
                    "Revenue",
                  ])}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_PALETTE.brand}
                  strokeWidth={2}
                  fill="url(#revenueFillMobile)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}