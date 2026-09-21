// components/admin/dashboard/revenue-chart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/admin/ui/button";
import {
  revenueSeries,
  type RevenueRange,
} from "@/lib/admin/mock/dashboard";
import { formatCurrency, formatCurrencyCompact } from "@/lib/shared/format";
import {
  STREAM_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";
import { useState } from "react";
import { cn } from "@/lib/utils";

const RANGES: { key: RevenueRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "12m", label: "12M" },
];

export function RevenueChart() {
  const [range, setRange] = useState<RevenueRange>("30d");
  const data = revenueSeries[range];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Revenue Overview
        </h2>
        <div
          role="tablist"
          aria-label="Revenue range"
          className="flex gap-1"
        >
          {RANGES.map((r) => (
            <Button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs",
                range === r.key &&
                  "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              )}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0.35} />
                <stop offset="95%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_STROKE}
              className={GRID_CLASS}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value: number) => formatCurrencyCompact(value)}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="ecommerce"
              stroke={STREAM_COLORS.ecommerce}
              strokeWidth={2}
              fill="url(#revenueChartGrad)"
            />
            <Area
              type="monotone"
              dataKey="reseller"
              stroke={STREAM_COLORS.reseller}
              strokeWidth={2}
              fill="none"
            />
            <Area
              type="monotone"
              dataKey="digitalServices"
              stroke={STREAM_COLORS.digitalServices}
              strokeWidth={2}
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}