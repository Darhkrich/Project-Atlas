"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

export function PendingRefundsCard() {
  const data = mockDashboardData.refundBreakdown;
  const total = mockDashboardData.pendingRefunds.total;

  return (
    <DashboardCard
      title="Total Pending Refunds"
      value={total}
      icon="receipt"
      href="/admin/refunds"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
            >
              {data.map((_, index) => (
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
            label="E-commerce"
            value={mockDashboardData.pendingRefunds.breakdown.ecommerce}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: mockDashboardData.pendingRefunds.breakdown.ecommerce }]}>
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Resellers"
            value={mockDashboardData.pendingRefunds.breakdown.reseller}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: mockDashboardData.pendingRefunds.breakdown.reseller }]}>
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Digital Services"
            value={mockDashboardData.pendingRefunds.breakdown.digitalServices}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={[{ value: mockDashboardData.pendingRefunds.breakdown.digitalServices }]}>
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