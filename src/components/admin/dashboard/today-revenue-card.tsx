"use client";

import { useState } from "react";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

const hourlyData = [
  { date: "00:00", ecommerce: 200, reseller: 150, digitalServices: 80 },
  { date: "04:00", ecommerce: 450, reseller: 300, digitalServices: 150 },
  { date: "08:00", ecommerce: 900, reseller: 600, digitalServices: 250 },
  { date: "12:00", ecommerce: 1600, reseller: 1000, digitalServices: 400 },
  { date: "16:00", ecommerce: 2200, reseller: 1400, digitalServices: 550 },
  { date: "20:00", ecommerce: 2800, reseller: 1800, digitalServices: 700 },
];

export function TodayRevenueCard() {
  const [range, setRange] = useState<"today" | "7d" | "30d">("today");
  const data = hourlyData; // for other ranges we could use different data; mock is same for brevity
  const total = mockDashboardData.todayRevenue.total;
  const breakdown = mockDashboardData.todayRevenue.breakdown;

  return (
    <DashboardCard
      title="Today's Revenue"
      value={formatCurrency(total)}
      icon="trending-up"
      trend={mockDashboardData.todayRevenue.trend}
      trendLabel="vs yesterday"
      mainChart={
        <>
          <div className="flex gap-1 mb-2">
            {(["today", "7d", "30d"] as const).map((r) => (
              <Button
                key={r}
                variant="ghost"
                size="sm"
                className={cn("text-xs", range === r && "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300")}
                onClick={() => setRange(r)}
              >
                {r === "today" ? "Today" : r.toUpperCase()}
              </Button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="todayRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="ecommerce" stackId="1" stroke="#3b82f6" fill="url(#todayRevGrad)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="reseller" stackId="1" stroke="#22c55e" fill="url(#todayRevGrad)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="digitalServices" stackId="1" stroke="#f59e0b" fill="url(#todayRevGrad)" strokeWidth={1.5} />
              <Line type="monotone" dataKey="ecommerce" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="reseller" stroke="#22c55e" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="digitalServices" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      }
      subCards={
        <>
          <SubCardWithChart
            label="E-commerce"
            value={formatCurrency(breakdown.ecommerce)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <ComposedChart data={data}>
                  <Area type="monotone" dataKey="ecommerce" stroke="#3b82f6" fill="url(#todayRevGrad)" strokeWidth={1} />
                  <Line type="monotone" dataKey="ecommerce" stroke="#3b82f6" strokeWidth={1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Resellers"
            value={formatCurrency(breakdown.reseller)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <ComposedChart data={data}>
                  <Area type="monotone" dataKey="reseller" stroke="#22c55e" fill="url(#todayRevGrad)" strokeWidth={1} />
                  <Line type="monotone" dataKey="reseller" stroke="#22c55e" strokeWidth={1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Digital Services"
            value={formatCurrency(breakdown.digitalServices)}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <ComposedChart data={data}>
                  <Area type="monotone" dataKey="digitalServices" stroke="#f59e0b" fill="url(#todayRevGrad)" strokeWidth={1} />
                  <Line type="monotone" dataKey="digitalServices" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}