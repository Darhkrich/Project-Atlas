"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { PictorialChart } from "./pictorial-chart";
import { ResponsiveContainer, BarChart, Bar } from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

export function ActiveUsersCard() {
  const distribution = mockDashboardData.activeUsersDistribution.map((item) => ({
    ...item,
    icon: item.name === "Resellers" ? ("users" as const) : item.name === "Customers" ? ("user" as const) : ("store" as const),
    color: item.name === "Resellers" ? "#3b82f6" : item.name === "Customers" ? "#22c55e" : "#f59e0b",
  }));
  const resellers = mockDashboardData.activeUsers.resellers;
  const customers = mockDashboardData.activeUsers.customers;
  const merchants = mockDashboardData.activeUsers.merchants;

  return (
    <DashboardCard
      title="Active Users"
      value={mockDashboardData.activeUsers.total.toLocaleString()}
      icon="users"
      trend={5.6}
      trendLabel="vs last month"
      href="/admin/customers"
      mainChart={<PictorialChart data={distribution} className="mt-1" />}
      subCards={
        <>
          <SubCardWithChart
            label="Resellers"
            value={resellers}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: resellers }]}>
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Customers"
            value={customers}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: customers }]}>
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Merchants"
            value={merchants}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: merchants }]}>
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}