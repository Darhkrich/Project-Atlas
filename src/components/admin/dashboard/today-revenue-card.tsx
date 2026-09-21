// components/admin/dashboard/today-revenue-card.tsx
"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { Button } from "@/components/admin/ui/button";
import {
  mockDashboardData,
  todayRevenueSeries,
  dashboardTrends,
  type TodayRevenueRange,
} from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/shared/format";
import {
  STREAM_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";
import { cn } from "@/lib/utils";

const RANGES: { key: TodayRevenueRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
];

export function TodayRevenueCard() {
  const [range, setRange] = useState<TodayRevenueRange>("today");
  const data = todayRevenueSeries[range];
  const breakdown = mockDashboardData.todayRevenue.breakdown;

  return (
    <DashboardCard
      title="Today's Revenue"
      value={formatCurrency(mockDashboardData.todayRevenue.total)}
      icon="trending-up"
      delta={dashboardTrends.todayRevenue}
      deltaLabel="vs yesterday"
      href="/admin/revenue"
      mainChart={
        <>
          <div className="mb-2 flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.key}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs",
                  range === r.key &&
                    "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                )}
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
              >
                {r.label}
              </Button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="todayRevEcom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="todayRevRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STREAM_COLORS.reseller} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={STREAM_COLORS.reseller} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="todayRevDig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STREAM_COLORS.digitalServices} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={STREAM_COLORS.digitalServices} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} className={GRID_CLASS} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="ecommerce" stackId="1" stroke={STREAM_COLORS.ecommerce} fill="url(#todayRevEcom)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="reseller" stackId="1" stroke={STREAM_COLORS.reseller} fill="url(#todayRevRes)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="digitalServices" stackId="1" stroke={STREAM_COLORS.digitalServices} fill="url(#todayRevDig)" strokeWidth={1.5} />
              <Line type="monotone" dataKey="ecommerce" stroke={STREAM_COLORS.ecommerce} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="reseller" stroke={STREAM_COLORS.reseller} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="digitalServices" stroke={STREAM_COLORS.digitalServices} strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      }
      subCards={
        <>
          <SubCardWithChart
            label="E-commerce"
            value={formatCurrency(breakdown.ecommerce)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="subTodayEcom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="ecommerce" stroke={STREAM_COLORS.ecommerce} fill="url(#subTodayEcom)" strokeWidth={1} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Resellers"
            value={formatCurrency(breakdown.reseller)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="subTodayRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STREAM_COLORS.reseller} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={STREAM_COLORS.reseller} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="reseller" stroke={STREAM_COLORS.reseller} fill="url(#subTodayRes)" strokeWidth={1} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Digital Services"
            value={formatCurrency(breakdown.digitalServices)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="subTodayDig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STREAM_COLORS.digitalServices} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={STREAM_COLORS.digitalServices} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="digitalServices" stroke={STREAM_COLORS.digitalServices} fill="url(#subTodayDig)" strokeWidth={1} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}