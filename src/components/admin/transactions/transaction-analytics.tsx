"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { allPaymentMethods } from "@/lib/payment-methods";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

const trendData = [
  { time: "00:00", count: 10, amount: 200 },
  { time: "04:00", count: 25, amount: 450 },
  { time: "08:00", count: 40, amount: 800 },
  { time: "12:00", count: 55, amount: 1200 },
  { time: "16:00", count: 70, amount: 1500 },
  { time: "20:00", count: 90, amount: 2000 },
];

const paymentMethodData = [
  { id: "wallet", value: 30, color: "#166e59" },
  { id: "momo", value: 45, color: "#f59e0b" },
  { id: "card", value: 15, color: "#3b82f6" },
  { id: "bank", value: 5, color: "#22c55e" },
  { id: "ussd", value: 3, color: "#8b5cf6" },
  { id: "atlas_points", value: 2, color: "#f43f5e" },
];

export function TransactionAnalytics() {
  const [trendMetric, setTrendMetric] = useState<"count" | "amount">("count");
  const [trendRange, setTrendRange] = useState("Today");

  const totalValue = paymentMethodData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Trend Chart */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction Flow</CardTitle>
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
            <Button variant="outline" size="sm" onClick={() => setTrendMetric("count")}>Count</Button>
            <Button variant="outline" size="sm" onClick={() => setTrendMetric("amount")}>Amount</Button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="txnFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(value: number) => trendMetric === "amount" ? formatCurrency(value) : value} />
              <Area
                type="monotone"
                dataKey={trendMetric}
                stroke="#166e59"
                fill="url(#txnFlowGradient)"
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
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                dataKey="value"
                nameKey="id"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {paymentMethodData.map((entry, index) => (
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
            <p className="text-3xl font-bold">{totalValue}%</p>
            <p className="text-sm text-neutral-500">Total share</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}