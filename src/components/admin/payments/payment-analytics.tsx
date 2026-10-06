"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { allPaymentMethods } from "@/lib/payment-methods";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

const trendData = [
  { time: "00:00", payments: 12, volume: 240 },
  { time: "04:00", payments: 18, volume: 430 },
  { time: "08:00", payments: 30, volume: 720 },
  { time: "12:00", payments: 45, volume: 1100 },
  { time: "16:00", payments: 60, volume: 1450 },
  { time: "20:00", payments: 75, volume: 1800 },
];

const methodData = [
  { id: "wallet", value: 30, color: "#166e59" },
  { id: "momo", value: 45, color: "#f59e0b" },
  { id: "card", value: 15, color: "#3b82f6" },
  { id: "bank", value: 5, color: "#22c55e" },
  { id: "ussd", value: 3, color: "#8b5cf6" },
  { id: "atlas_points", value: 2, color: "#f43f5e" },
];

const successFailureData = [
  { name: "Successful", count: 96 },
  { name: "Failed", count: 4 },
];

export function PaymentAnalytics() {
  const [trendMetric, setTrendMetric] = useState<"payments" | "volume">("payments");
  const [trendRange, setTrendRange] = useState("Today");

  const totalMethodValue = methodData.reduce((sum, item) => sum + item.value, 0);

  const formatTrendTooltipValue = (
    value: number | string | readonly (number | string)[] | undefined,
  ) => {
    const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
    return trendMetric === "volume" ? formatCurrency(numericValue) : numericValue;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Trend Chart */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Activity</CardTitle>
          <div className="flex gap-1">
            {["Today", "7d", "30d"].map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                className={cn("text-xs", trendRange === range && "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300")}
                onClick={() => setTrendRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => setTrendMetric("payments")}>Payments</Button>
            <Button variant="outline" size="sm" onClick={() => setTrendMetric("volume")}>Volume</Button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="paymentTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                formatter={(value) =>
                  formatTrendTooltipValue(value)
                }
              />
              <Area
                type="monotone"
                dataKey={trendMetric}
                stroke="#166e59"
                fill="url(#paymentTrendGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Method Donut */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={methodData}
                dataKey="value"
                nameKey="id"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                formatter={(value) => {
                  const method = allPaymentMethods.find((m) => m.id === value);
                  return method?.name ?? value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center">
            <p className="text-3xl font-bold">{totalMethodValue}%</p>
            <p className="text-sm text-neutral-500">Total share</p>
          </div>
        </CardContent>
      </Card>

      {/* Success vs Failure */}
      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>Payment Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={successFailureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#166e59" radius={[4,4,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}