/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { mockStreamTrend } from "@/lib/admin/mock/revenue";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

type Metric = "total" | "by_stream";

export function RevenueTrendChart() {
  const [metric, setMetric] = useState<Metric>("by_stream");
  const [range, setRange] = useState<"12m" | "6m" | "3m">("12m");

  const data =
    range === "12m"
      ? mockStreamTrend
      : range === "6m"
      ? mockStreamTrend.slice(-6)
      : mockStreamTrend.slice(-3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Trend</CardTitle>
        <div className="flex items-center gap-1">
          {(["12m", "6m", "3m"] as const).map((r) => (
            <Button
              key={r}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs",
                range === r &&
                  "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              )}
              onClick={() => setRange(r)}
            >
              {r.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex gap-1">
          <Button
            variant={metric === "total" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setMetric("total")}
          >
            Total
          </Button>
          <Button
            variant={metric === "by_stream" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setMetric("by_stream")}
          >
            By Stream
          </Button>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revTotalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revDigitalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revResellerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revEcomGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />
            {metric === "total" ? (
              <Area
                type="monotone"
                dataKey="digital_services"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#revDigitalGrad)"
                name="Digital Services"
              />
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="digital_services"
                  stroke="#3b82f6"
                  fill="url(#revDigitalGrad)"
                  name="Digital Services"
                />
                <Area
                  type="monotone"
                  dataKey="resellers"
                  stroke="#22c55e"
                  fill="url(#revResellerGrad)"
                  name="Resellers"
                />
                <Area
                  type="monotone"
                  dataKey="ecommerce"
                  stroke="#f59e0b"
                  fill="url(#revEcomGrad)"
                  name="E‑commerce"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}