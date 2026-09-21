// components/admin/dashboard/pending-refunds-card.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { refundTrendSeries } from "@/lib/admin/mock/dashboard-series";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import {
  STREAM_COLORS,
  ACTIVE_USERS_DONUT_COLORS,
} from "@/lib/admin/dashboard/chart-palette";
import { formatCurrency } from "@/lib/shared/format";

export function PendingRefundsCard() {
  const total = mockDashboardData.pendingRefunds.total;
  const breakdown = mockDashboardData.pendingRefunds.breakdown;
  const distribution = mockDashboardData.refundBreakdown;

  return (
    <DashboardCard
      title="Pending Refunds"
      value={total}
      icon="receipt"
      delta={dashboardTrends.pendingRefunds}
      deltaLabel="vs last month"
      href="/admin/payments"
      mainChart={
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {distribution.map((_, index) => (
                  <Cell
                    key={"ref-" + index}
                    fill={ACTIVE_USERS_DONUT_COLORS[index % ACTIVE_USERS_DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold tabular-nums">{total}</p>
            <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              pending
            </p>
          </div>
        </div>
      }
      subCards={
        <>
          <SubCardWithChart
            label="E-commerce"
            value={formatCurrency(breakdown.ecommerce)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={refundTrendSeries}>
                  <defs>
                    <linearGradient id="prEcom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={STREAM_COLORS.ecommerce} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="ecommerce" stroke={STREAM_COLORS.ecommerce} fill="url(#prEcom)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Resellers"
            value={formatCurrency(breakdown.reseller)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={refundTrendSeries}>
                  <defs>
                    <linearGradient id="prRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STREAM_COLORS.reseller} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={STREAM_COLORS.reseller} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="reseller" stroke={STREAM_COLORS.reseller} fill="url(#prRes)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Digital Services"
            value={formatCurrency(breakdown.digitalServices)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={refundTrendSeries}>
                  <defs>
                    <linearGradient id="prDig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STREAM_COLORS.digitalServices} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={STREAM_COLORS.digitalServices} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="digitalServices" stroke={STREAM_COLORS.digitalServices} fill="url(#prDig)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}