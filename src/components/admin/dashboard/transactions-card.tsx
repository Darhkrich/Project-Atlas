// components/admin/dashboard/transactions-card.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  mockDashboardData,
  dashboardTrends,
} from "@/lib/admin/mock/dashboard";
import {
  STREAM_COLORS,
  TRANSACTION_STATUS_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";

export function TransactionsCard() {
  const pendingTotal = mockDashboardData.transactions.pending.total;
  const failedTotal = mockDashboardData.transactions.failed.total;
  const total = pendingTotal + failedTotal;
  const statusData = mockDashboardData.transactionStatusData;
  const pendingBreakdown = mockDashboardData.transactions.pending.breakdown;
  const failedBreakdown = mockDashboardData.transactions.failed.breakdown;

  const pendingPie = [
    { name: "E-commerce", value: pendingBreakdown.ecommerce },
    { name: "Resellers", value: pendingBreakdown.reseller },
    { name: "Digital Services", value: pendingBreakdown.digitalServices },
  ];

  const failedPie = [
    { name: "E-commerce", value: failedBreakdown.ecommerce },
    { name: "Resellers", value: failedBreakdown.reseller },
    { name: "Digital Services", value: failedBreakdown.digitalServices },
  ];

  return (
    <DashboardCard
      title="Transactions"
      value={total}
      icon="transactions"
      delta={dashboardTrends.transactions}
      deltaLabel="vs last 30 days"
      href="/admin/payments"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} className={GRID_CLASS} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="ecommerce" stackId="a" fill={STREAM_COLORS.ecommerce} name="E-commerce" />
            <Bar dataKey="reseller" stackId="a" fill={STREAM_COLORS.reseller} name="Resellers" />
            <Bar dataKey="digitalServices" stackId="a" fill={STREAM_COLORS.digitalServices} name="Digital Services" />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Pending"
            value={pendingTotal}
            status={pendingTotal > 0 ? "warning" : "neutral"}
            chart={
              <ResponsiveContainer width="100%" height={50}>
                <PieChart>
                  <Pie
                    data={pendingPie}
                    dataKey="value"
                    innerRadius={15}
                    outerRadius={25}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pendingPie.map((_, index) => (
                      <Cell
                        key={"pending-" + index}
                        fill={TRANSACTION_STATUS_COLORS.pending[index % TRANSACTION_STATUS_COLORS.pending.length]}
                      />
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
            status={failedTotal > 0 ? "danger" : "neutral"}
            chart={
              <ResponsiveContainer width="100%" height={50}>
                <PieChart>
                  <Pie
                    data={failedPie}
                    dataKey="value"
                    innerRadius={15}
                    outerRadius={25}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {failedPie.map((_, index) => (
                      <Cell
                        key={"failed-" + index}
                        fill={TRANSACTION_STATUS_COLORS.failed[index % TRANSACTION_STATUS_COLORS.failed.length]}
                      />
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