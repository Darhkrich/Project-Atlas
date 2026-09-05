"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const ranges = ["Today", "7d", "30d", "12m"] as const;
type Range = (typeof ranges)[number];

const mockData: Record<Range, { date: string; revenue: number }[]> = {
  Today: [
    { date: "00:00", revenue: 1200 },
    { date: "04:00", revenue: 2400 },
    { date: "08:00", revenue: 5100 },
    { date: "12:00", revenue: 8300 },
    { date: "16:00", revenue: 10400 },
    { date: "20:00", revenue: 13200 },
    { date: "Now", revenue: 15000 },
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

export function RevenueChart() {
  const [range, setRange] = useState<Range>("30d");
  const data = mockData[range];

  return (
    <div>
      <div className="flex gap-1">
        {ranges.map((r) => (
          <Button
            key={r}
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs",
              range === r ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : ""
            )}
            onClick={() => setRange(r)}
          >
            {r}
          </Button>
        ))}
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#166e59" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <Tooltip
              formatter={(value) => [`GH₵ ${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#166e59"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}