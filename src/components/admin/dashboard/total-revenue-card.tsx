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

type Range = "today" | "7d" | "30d" | "12m";

const rangeData: Record<Range, { date: string; ecommerce: number; reseller: number; digitalServices: number }[]> = {
  today: [
    { date: "00:00", ecommerce: 1200, reseller: 900, digitalServices: 500 },
    { date: "04:00", ecommerce: 2400, reseller: 1800, digitalServices: 1100 },
    { date: "08:00", ecommerce: 5100, reseller: 3400, digitalServices: 2100 },
    { date: "12:00", ecommerce: 8300, reseller: 5600, digitalServices: 3200 },
    { date: "16:00", ecommerce: 10400, reseller: 7200, digitalServices: 4100 },
    { date: "20:00", ecommerce: 13200, reseller: 8900, digitalServices: 5000 },
  ],
  "7d": [
    { date: "Mon", ecommerce: 18000, reseller: 15000, digitalServices: 8000 },
    { date: "Tue", ecommerce: 22000, reseller: 17000, digitalServices: 9500 },
    { date: "Wed", ecommerce: 25000, reseller: 19000, digitalServices: 10200 },
    { date: "Thu", ecommerce: 23000, reseller: 18000, digitalServices: 9800 },
    { date: "Fri", ecommerce: 28000, reseller: 20000, digitalServices: 12000 },
    { date: "Sat", ecommerce: 30000, reseller: 21000, digitalServices: 13000 },
    { date: "Sun", ecommerce: 32000, reseller: 23000, digitalServices: 14000 },
  ],
  "30d": [
    { date: "Week 1", ecommerce: 120000, reseller: 105000, digitalServices: 60000 },
    { date: "Week 2", ecommerce: 140000, reseller: 115000, digitalServices: 68000 },
    { date: "Week 3", ecommerce: 150000, reseller: 125000, digitalServices: 73000 },
    { date: "Week 4", ecommerce: 168000, reseller: 135000, digitalServices: 80000 },
  ],
  "12m": [
    { date: "Jan", ecommerce: 40000, reseller: 50000, digitalServices: 30000 },
    { date: "Feb", ecommerce: 45000, reseller: 52000, digitalServices: 32000 },
    { date: "Mar", ecommerce: 48000, reseller: 55000, digitalServices: 34000 },
    { date: "Apr", ecommerce: 50000, reseller: 58000, digitalServices: 36000 },
    { date: "May", ecommerce: 52000, reseller: 60000, digitalServices: 38000 },
    { date: "Jun", ecommerce: 55000, reseller: 62000, digitalServices: 40000 },
    { date: "Jul", ecommerce: 58000, reseller: 65000, digitalServices: 42000 },
    { date: "Aug", ecommerce: 60000, reseller: 68000, digitalServices: 44000 },
    { date: "Sep", ecommerce: 62000, reseller: 70000, digitalServices: 46000 },
    { date: "Oct", ecommerce: 65000, reseller: 72000, digitalServices: 48000 },
    { date: "Nov", ecommerce: 68000, reseller: 75000, digitalServices: 50000 },
    { date: "Dec", ecommerce: 70000, reseller: 78000, digitalServices: 52000 },
  ],
};

export function TotalRevenueCard() {
  const [range, setRange] = useState<Range>("12m");
  const data = rangeData[range];
  const total = mockDashboardData.totalRevenue.total;
  const breakdown = mockDashboardData.totalRevenue.breakdown;

  return (
    <DashboardCard
      title="Total Revenue"
      value={formatCurrency(total)}
      icon="sales"
      trend={mockDashboardData.totalRevenue.trend}
      trendLabel="vs last 30 days"
      mainChart={
        <>
          <div className="flex gap-1 mb-2">
            {(["today", "7d", "30d", "12m"] as const).map((r) => (
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
                <linearGradient id="totalRevEcom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="totalRevRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="totalRevDig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="ecommerce" stackId="1" stroke="#3b82f6" fill="url(#totalRevEcom)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="reseller" stackId="1" stroke="#22c55e" fill="url(#totalRevRes)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="digitalServices" stackId="1" stroke="#f59e0b" fill="url(#totalRevDig)" strokeWidth={1.5} />
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
                  <defs>
                    <linearGradient id="subTotalEcom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="ecommerce" stroke="#3b82f6" fill="url(#subTotalEcom)" strokeWidth={1} />
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
                  <defs>
                    <linearGradient id="subTotalRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="reseller" stroke="#22c55e" fill="url(#subTotalRes)" strokeWidth={1} />
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
                  <defs>
                    <linearGradient id="subTotalDig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="digitalServices" stroke="#f59e0b" fill="url(#subTotalDig)" strokeWidth={1} />
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