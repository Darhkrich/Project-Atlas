// components/admin/dashboard/active-users-card.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  mockDashboardData,
  dashboardTrends,
} from "@/lib/admin/mock/dashboard";
import { ACCOUNT_COLORS, ACTIVE_USERS_DONUT_COLORS } from "@/lib/admin/dashboard/chart-palette";

export function ActiveUsersCard() {
  const distribution = mockDashboardData.activeUsersDistribution;
  const resellers = mockDashboardData.activeUsers.resellers;
  const customers = mockDashboardData.activeUsers.customers;
  const merchants = mockDashboardData.activeUsers.merchants;

  return (
    <DashboardCard
      title="Active Users"
      value={mockDashboardData.activeUsers.total.toLocaleString()}
      icon="users"
      delta={dashboardTrends.activeUsers}
      deltaLabel="vs last month"
      href="/admin/customers"
      mainChart={
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
                  key={"cell-" + index}
                  fill={ACTIVE_USERS_DONUT_COLORS[index % ACTIVE_USERS_DONUT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Resellers"
            value={resellers}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: resellers }]}>
                  <Bar dataKey="value" fill={ACCOUNT_COLORS.resellers} />
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
                  <Bar dataKey="value" fill={ACCOUNT_COLORS.customers} />
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
                  <Bar dataKey="value" fill={ACCOUNT_COLORS.merchants} />
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}