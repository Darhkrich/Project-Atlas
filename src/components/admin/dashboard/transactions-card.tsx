"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

const COLORS_PENDING = ["#3b82f6", "#22c55e", "#f59e0b"];
const COLORS_FAILED = ["#f59e0b", "#ef4444", "#8b5cf6"];

export function TransactionsCard() {
  const pendingTotal = mockDashboardData.transactions.pending.total;
  const failedTotal = mockDashboardData.transactions.failed.total;
  const total = pendingTotal + failedTotal;
  const statusData = mockDashboardData.transactionStatusData;

  return (
    <DashboardCard
      title="Transactions"
      value={total}
      icon="transactions"
      href="/admin/transactions"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="ecommerce" stackId="a" fill="#3b82f6" />
            <Bar dataKey="reseller" stackId="a" fill="#22c55e" />
            <Bar dataKey="digitalServices" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Pending"
            value={pendingTotal}
            breakdown={`Ecom ${mockDashboardData.transactions.pending.breakdown.ecommerce} · Reseller ${mockDashboardData.transactions.pending.breakdown.reseller} · Services ${mockDashboardData.transactions.pending.breakdown.digitalServices}`}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Ecom", value: mockDashboardData.transactions.pending.breakdown.ecommerce },
                      { name: "Reseller", value: mockDashboardData.transactions.pending.breakdown.reseller },
                      { name: "Services", value: mockDashboardData.transactions.pending.breakdown.digitalServices },
                    ]}
                    dataKey="value"
                    innerRadius={10}
                    outerRadius={15}
                    paddingAngle={2}
                  >
                    {COLORS_PENDING.map((color, index) => (
                      <Cell key={`pending-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Failed"
            value={failedTotal}
            breakdown={`Ecom ${mockDashboardData.transactions.failed.breakdown.ecommerce} · Reseller ${mockDashboardData.transactions.failed.breakdown.reseller} · Services ${mockDashboardData.transactions.failed.breakdown.digitalServices}`}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Ecom", value: mockDashboardData.transactions.failed.breakdown.ecommerce },
                      { name: "Reseller", value: mockDashboardData.transactions.failed.breakdown.reseller },
                      { name: "Services", value: mockDashboardData.transactions.failed.breakdown.digitalServices },
                    ]}
                    dataKey="value"
                    innerRadius={10}
                    outerRadius={15}
                    paddingAngle={2}
                  >
                    {COLORS_FAILED.map((color, index) => (
                      <Cell key={`failed-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}