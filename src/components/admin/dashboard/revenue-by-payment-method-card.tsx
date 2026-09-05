"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

export function RevenueByPaymentMethodCard() {
  const data = mockDashboardData.paymentMethodDistribution;

  return (
    <DashboardCard
      title="Revenue by Payment Method"
      value="Distribution"
      icon="credit-card"
      href="/admin/payments"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              label={(entry) => entry.method}
            >
              {data.map((_: { method: string; value: number }, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {data.slice(0, 3).map((method: { method: string; value: number }) => (
            <SubCardWithChart
              key={method.method}
              label={method.method}
              value={`${method.value}%`}
              chart={
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart data={[{ value: method.value }]}>
                    <Bar dataKey="value" fill={COLORS[data.indexOf(method)]} />
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