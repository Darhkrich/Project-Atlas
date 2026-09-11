"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";

type Range = "today" | "7d" | "30d" | "12m";

const rangeData: Record<Range, { date: string; revenue: number }[]> = {
  today: [
    { date: "00:00", revenue: 1200 },
    { date: "04:00", revenue: 2400 },
    { date: "08:00", revenue: 5100 },
    { date: "12:00", revenue: 8300 },
    { date: "16:00", revenue: 10400 },
    { date: "20:00", revenue: 13200 },
  ],
  "7d": [
    { date: "Mon", revenue: 22000 },
    { date: "Tue", revenue: 28000 },
    { date: "Wed", revenue: 31000 },
    { date: "Thu", revenue: 29000 },
    { date: "Fri", revenue: 35000 },
    { date: "Sat", revenue: 38000 },
    { date: "Sun", revenue: 40000 },
  ],
  "30d": [
    { date: "Week 1", revenue: 150000 },
    { date: "Week 2", revenue: 175000 },
    { date: "Week 3", revenue: 190000 },
    { date: "Week 4", revenue: 210000 },
  ],
  "12m": [
    { date: "Jan", revenue: 120000 },
    { date: "Feb", revenue: 130000 },
    { date: "Mar", revenue: 155000 },
    { date: "Apr", revenue: 170000 },
    { date: "May", revenue: 185000 },
    { date: "Jun", revenue: 200000 },
    { date: "Jul", revenue: 220000 },
    { date: "Aug", revenue: 210000 },
    { date: "Sep", revenue: 230000 },
    { date: "Oct", revenue: 240000 },
    { date: "Nov", revenue: 250000 },
    { date: "Dec", revenue: 260000 },
  ],
};

const ranges: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "12m", label: "12m" },
];

export function RevenueChart() {
  const [activeRange, setActiveRange] = useState<Range>("30d");
  const data = rangeData[activeRange];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Revenue Overview
        </h3>
        <div className="flex gap-1">
          {ranges.map(range => (
            <Button
              key={range.key}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs",
                activeRange === range.key
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
              onClick={() => setActiveRange(range.key)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="dashRevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#166e59" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value: number) => `GH₵${value.toLocaleString()}`}
            />
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#166e59"
              strokeWidth={2}
              fill="url(#dashRevGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}