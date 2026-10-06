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
import { chartFormatter } from "@/lib/shared/charts/format";
import {
  AXIS_STROKE_CLASS,
  CHART_PALETTE,
} from "@/lib/shared/charts/theme";
import {
  CHART_HEIGHT_DESKTOP,
  CHART_HEIGHT_MOBILE,
} from "@/lib/merchant/analytics/constants";
import { CHART_ORDERS_TITLE, CHART_EMPTY } from "@/lib/merchant/analytics/labels";
import type { SeriesPoint } from "@/lib/merchant/analytics/types";

interface AnalyticsOrdersChartProps {
  series: SeriesPoint[];
}

export function AnalyticsOrdersChart({ series }: AnalyticsOrdersChartProps) {
  const hasData = series.some((p) => p.orders > 0);

  return (
    <section
      aria-labelledby="analytics-orders-heading"
      className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <h2
        id="analytics-orders-heading"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        {CHART_ORDERS_TITLE}
      </h2>

      {!hasData ? (
        <p className="mt-4 flex h-40 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
          {CHART_EMPTY}
        </p>
      ) : (
        <>
          <div className="mt-4 hidden sm:block" style={{ height: CHART_HEIGHT_DESKTOP }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
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
                  allowDecimals={false}
                  width={32}
                />
                <Tooltip
                  formatter={chartFormatter((value) => [
                    String(value),
                    "Orders",
                  ])}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill={CHART_PALETTE.info}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 block sm:hidden" style={{ height: CHART_HEIGHT_MOBILE }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
              >
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
                  allowDecimals={false}
                  width={24}
                />
                <Tooltip
                  formatter={chartFormatter((value) => [
                    String(value),
                    "Orders",
                  ])}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e5e5",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill={CHART_PALETTE.info}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}