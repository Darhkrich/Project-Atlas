/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { CHART_PALETTE, AXIS_STROKE_CLASS } from "@/lib/admin/charts/theme";
import type { TrendPoint } from "@/lib/admin/revenue/revenue-projection";

type Metric = "total" | "by_stream";

export function RevenueTrendChart({ trend }: { trend: TrendPoint[] }) {
  const [metric, setMetric] = useState<Metric>("by_stream");

  const empty = trend.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue trend</CardTitle>
        <div
          role="group"
          aria-label="Trend view"
          className="flex items-center gap-1"
        >
          {(["total", "by_stream"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metric === m}
              onClick={() => setMetric(m)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium",
                metric === m
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              {m === "total" ? "Total" : "By stream"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            No revenue in this range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="revBrand" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_PALETTE.brand}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_PALETTE.brand}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="revInfo" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_PALETTE.info}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_PALETTE.info}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="revSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_PALETTE.success}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_PALETTE.success}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className={AXIS_STROKE_CLASS}
              />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend />
              {metric === "total" ? (
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={CHART_PALETTE.brand}
                  fill="url(#revBrand)"
                  name="Total"
                />
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="digital_services"
                    stroke={CHART_PALETTE.info}
                    fill="url(#revInfo)"
                    name="Digital services"
                  />
                  <Area
                    type="monotone"
                    dataKey="resellers"
                    stroke={CHART_PALETTE.success}
                    fill="url(#revSuccess)"
                    name="Resellers"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}