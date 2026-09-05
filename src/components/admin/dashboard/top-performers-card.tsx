"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

export function TopPerformersCard() {
  const resellers = mockDashboardData.topPerformers.resellers;
  const merchants = mockDashboardData.topPerformers.merchants;
  const combined = [...resellers, ...merchants].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <DashboardCard
      title="Top Performers"
      value="Top 5"
      icon="trending-up"
      href="/admin/resellers"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
            <Bar dataKey="revenue" fill="#166e59" radius={[2,2,0,0]} />
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
              breakdown={`Trend: ${performer.trend > 0 ? "+" : ""}${performer.trend}%`}
              chart={
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart data={[{ value: performer.trend }]}>
                    <Bar dataKey="value" fill={performer.trend >= 0 ? "#22c55e" : "#ef4444"} />
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