"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

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
      trend={5.6}
      trendLabel="vs last month"
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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