// components/admin/dashboard/revenue-by-payment-method-card.tsx
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
import { paymentMethodSeries } from "@/lib/admin/mock/dashboard-series";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import {
  CHART_COLORS,
  STREAM_COLORS,
  ACCOUNT_COLORS,
} from "@/lib/admin/dashboard/chart-palette";

const METHOD_COLORS: Record<string, string> = {
  "Mobile Money": STREAM_COLORS.digitalServices,
  Wallet: STREAM_COLORS.reseller,
  Card: STREAM_COLORS.ecommerce,
  Bank: ACCOUNT_COLORS.resellers,
};

export function RevenueByPaymentMethodCard() {
  const data = mockDashboardData.paymentMethodDistribution;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardCard
      title="Revenue by Payment Method"
      value={total + "%"}
      icon="credit-card"
      delta={dashboardTrends.totalRevenue}
      deltaLabel="vs last month"
      href="/admin/payments"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell
                  key={"cell-" + index}
                  fill={METHOD_COLORS[item.method] ?? CHART_COLORS.neutral}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value + "%"} />
          </PieChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Mobile Money"
            value={
              (data.find((d) => d.method === "Mobile Money")?.value ?? 0) + "%"
            }
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={paymentMethodSeries}>
                  <defs>
                    <linearGradient id="pmMomo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={METHOD_COLORS["Mobile Money"]} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={METHOD_COLORS["Mobile Money"]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="mobileMoney" stroke={METHOD_COLORS["Mobile Money"]} fill="url(#pmMomo)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Wallet"
            value={(data.find((d) => d.method === "Wallet")?.value ?? 0) + "%"}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={paymentMethodSeries}>
                  <defs>
                    <linearGradient id="pmWallet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={METHOD_COLORS.Wallet} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={METHOD_COLORS.Wallet} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="wallet" stroke={METHOD_COLORS.Wallet} fill="url(#pmWallet)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Card + Bank"
            value={
              ((data.find((d) => d.method === "Card")?.value ?? 0) +
                (data.find((d) => d.method === "Bank")?.value ?? 0)) + "%"
            }
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={paymentMethodSeries}>
                  <defs>
                    <linearGradient id="pmCard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={METHOD_COLORS.Card} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={METHOD_COLORS.Card} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="card" stroke={METHOD_COLORS.Card} fill="url(#pmCard)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}