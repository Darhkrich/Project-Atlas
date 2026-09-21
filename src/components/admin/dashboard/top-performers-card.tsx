// components/admin/dashboard/top-performers-card.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { topPerformerTrendSeries } from "@/lib/admin/mock/dashboard-series";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import {
  CHART_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";
import { formatCurrency } from "@/lib/shared/format";

const RESELLER_COLOR = CHART_COLORS.brand;
const MERCHANT_COLOR = CHART_COLORS.info;

export function TopPerformersCard() {
  const performers = mockDashboardData.topPerformers;
  const combined = [
    ...performers.resellers.map((r) => ({ ...r, kind: "reseller" as const })),
    ...performers.merchants.map((m) => ({ ...m, kind: "merchant" as const })),
  ]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topThree = combined.slice(0, 3);

  return (
    <DashboardCard
      title="Top Performers"
      value={formatCurrency(
        combined.reduce((sum, p) => sum + p.revenue, 0)
      )}
      icon="trending-up"
      delta={dashboardTrends.totalRevenue}
      deltaLabel="vs last month"
      href="/admin/analytics"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={combined}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_STROKE}
              className={GRID_CLASS}
              horizontal={false}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickFormatter={(value: number) =>
                "GH\u20B5" + Math.round(value / 1000) + "k"
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              width={100}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {combined.map((performer, index) => (
                <Cell
                  key={"tp-" + index}
                  fill={performer.kind === "reseller" ? RESELLER_COLOR : MERCHANT_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {topThree.map((performer) => {
            const trend = topPerformerTrendSeries[performer.name] ?? [];
            const color =
              performer.kind === "reseller" ? RESELLER_COLOR : MERCHANT_COLOR;
            const gradientId =
              "tp" + performer.name.replace(/[^a-zA-Z0-9]/g, "");
            return (
              <SubCardWithChart
                key={performer.name}
                label={performer.name}
                value={formatCurrency(performer.revenue)}
                chart={
                  <ResponsiveContainer width="100%" height={35}>
                    <LineChart data={trend}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                }
              />
            );
          })}
        </>
      }
    />
  );
}