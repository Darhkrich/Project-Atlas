/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { CHART_PALETTE, AXIS_STROKE_CLASS } from "@/lib/admin/charts/theme";

export interface TrendSeries {
  key: string;
  label: string;
  color: string;
}

export interface TrendPanelProps {
  data: Array<Record<string, string | number>>;
  series: TrendSeries[];
  xKey: string;
  valueFormatter?: "currency" | "number";
}

export function TrendPanel({
  data,
  series,
  xKey,
  valueFormatter = "number",
}: TrendPanelProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        No data in this range.
      </p>
    );
  }

  const formatter =
    valueFormatter === "currency"
      ? (value: any) => formatCurrency(Number(value))
      : (value: any) => String(value);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={"trend-" + s.key}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={s.color} stopOpacity={0.5} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className={AXIS_STROKE_CLASS}
        />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip formatter={formatter} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            fill={"url(#trend-" + s.key + ")"}
            strokeWidth={2}
            name={s.label}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const DEFAULT_TREND_PALETTE = {
  revenue: CHART_PALETTE.brand,
  digital_services: CHART_PALETTE.info,
  resellers: CHART_PALETTE.success,
  ecommerce: CHART_PALETTE.warning,
} as const;