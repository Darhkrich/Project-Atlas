// components/admin/dashboard/support-tickets-card.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { supportTicketTrendSeries } from "@/lib/admin/mock/dashboard-series";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import {
  STREAM_COLORS,
  STATUS_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";

export function SupportTicketsCard() {
  const data = mockDashboardData.supportTicketBreakdown;
  const open = mockDashboardData.supportTickets.open;
  const pending = mockDashboardData.supportTickets.pending;
  const urgent = mockDashboardData.supportTickets.urgent;
  const totalOpen = mockDashboardData.supportTickets.totalOpen;

  return (
    <DashboardCard
      title="Support Tickets"
      value={totalOpen}
      icon="support"
      delta={dashboardTrends.supportTickets}
      deltaLabel="open vs last week"
      href="/admin/ecommerce/support"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} className={GRID_CLASS} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Open"
            value={open}
            status={open > 0 ? "warning" : "success"}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <LineChart data={supportTicketTrendSeries}>
                  <Line type="monotone" dataKey="open" stroke={STATUS_COLORS.pending} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Pending"
            value={pending}
            status="neutral"
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <LineChart data={supportTicketTrendSeries}>
                  <Line type="monotone" dataKey="pending" stroke={STREAM_COLORS.reseller} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Urgent"
            value={urgent}
            status={urgent > 0 ? "danger" : "success"}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <LineChart data={supportTicketTrendSeries}>
                  <Line type="monotone" dataKey="urgent" stroke={STATUS_COLORS.failed} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}