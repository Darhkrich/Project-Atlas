/* eslint-disable @typescript-eslint/no-explicit-any */
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

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

export function RevenueByPaymentMethodCard() {
  const data = mockDashboardData.paymentMethodDistribution as Array<{
    method: string;
    value: number;
  }>;

  return (
    <DashboardCard
      title="Revenue by Payment Method"
      value="Distribution"
      icon="credit-card"
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
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any, name: any) => [`${value}%`, name]} />
          </PieChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {data.slice(0, 3).map((method) => (
            <SubCardWithChart
              key={method.method}
              label={method.method}
              value={`${method.value}%`}
              chart={
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart data={[{ value: method.value }]}>
                    <Bar dataKey="value" fill={COLORS[data.indexOf(method) % COLORS.length]} />
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