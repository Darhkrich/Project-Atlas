"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { PictorialChart } from "./pictorial-chart";
import { ResponsiveContainer, BarChart, Bar } from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

export function TotalUsersCard() {
  const total = mockDashboardData.totalUsers.total;
  const distribution = [
    { name: "Resellers", value: mockDashboardData.totalUsers.resellers, icon: "users" as const, color: "#3b82f6" },
    { name: "Customers", value: mockDashboardData.totalUsers.customers, icon: "user" as const, color: "#22c55e" },
    { name: "Merchants", value: mockDashboardData.totalUsers.merchants, icon: "store" as const, color: "#f59e0b" },
  ];

  return (
    <DashboardCard
      title="Total Users"
      value={total.toLocaleString()}
      icon="users"
      href="/admin/customers"
      mainChart={<PictorialChart data={distribution} className="mt-1" />}
      subCards={
        <>
          <SubCardWithChart
            label="Resellers"
            value={mockDashboardData.totalUsers.resellers}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: mockDashboardData.totalUsers.resellers }]}>
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Customers"
            value={mockDashboardData.totalUsers.customers}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: mockDashboardData.totalUsers.customers }]}>
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Merchants"
            value={mockDashboardData.totalUsers.merchants}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: mockDashboardData.totalUsers.merchants }]}>
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