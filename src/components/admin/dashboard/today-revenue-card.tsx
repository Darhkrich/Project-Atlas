"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

export function TodayRevenueCard() {
  const data = mockDashboardData.todayHourlyRevenue;
  const total = mockDashboardData.todayRevenue.total;
  const breakdown = mockDashboardData.todayRevenue.breakdown;

  return (
    <DashboardCard
      title="Today's Revenue"
      value={formatCurrency(total)}
      icon="trending-up"
      trend={mockDashboardData.todayRevenue.trend}
      trendLabel="vs yesterday"
      href="/admin/analytics" // or /admin/revenue
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#166e59" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#subTodayEcom)" strokeWidth={1} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={1} dot={false} />
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
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#subTodayRes)" strokeWidth={1} />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={1} dot={false} />
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
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#subTodayDig)" strokeWidth={1} />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}