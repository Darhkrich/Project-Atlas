"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

export function SupportTicketsCard() {
  const breakdown = mockDashboardData.supportTicketBreakdown;
  const totalOpen = mockDashboardData.supportTickets.totalOpen;

  return (
    <DashboardCard
      title="Total Support Tickets"
      value={totalOpen}
      icon="support"
      href="/admin/support"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={breakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill="#166e59" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Open"
            value={mockDashboardData.supportTickets.open}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={[{ value: mockDashboardData.supportTickets.open }]}>
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Pending"
            value={mockDashboardData.supportTickets.pending}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={[{ value: mockDashboardData.supportTickets.pending }]}>
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Urgent"
            value={mockDashboardData.supportTickets.urgent}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <AreaChart data={[{ value: mockDashboardData.supportTickets.urgent }]}>
                  <defs>
                    <linearGradient id="urgentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#urgentGrad)" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}