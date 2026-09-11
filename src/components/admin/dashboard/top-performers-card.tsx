/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

export function TopPerformersCard() {
  const topPerformers = mockDashboardData.topPerformers as {
    resellers: Array<{ name: string; revenue: number; trend: number }>;
    merchants: Array<{ name: string; revenue: number; trend: number }>;
  };
  const resellers = topPerformers.resellers;
  const merchants = topPerformers.merchants;
  const combined = [...resellers, ...merchants]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <DashboardCard
      title="Top Performers"
      value="Top 5"
      icon="trending-up"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={combined} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={10} width={90} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" fill="#166e59" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {combined.slice(0, 3).map((performer) => (
            <SubCardWithChart
              key={performer.name}
              label={performer.name}
              value={formatCurrency(performer.revenue)}
              chart={
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart data={[{ value: performer.trend }]}>
                    <Bar
                      dataKey="value"
                      fill={performer.trend >= 0 ? "#22c55e" : "#ef4444"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              }
            />
          ))}
        </>
      }
    />
  );
}