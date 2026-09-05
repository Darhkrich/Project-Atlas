/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { REFUND_REASONS } from "@/lib/admin/types/refund";

const reasonData = [
  { name: "Service not delivered", value: 35, color: "#f59e0b" },
  { name: "Provider failure", value: 25, color: "#ef4444" },
  { name: "Duplicate charge", value: 20, color: "#3b82f6" },
  { name: "Customer request", value: 15, color: "#22c55e" },
  { name: "Fraud suspected", value: 5, color: "#8b5cf6" },
];

const trendData = [
  { day: "Mon", refunds: 5, amount: 250 },
  { day: "Tue", refunds: 8, amount: 400 },
  { day: "Wed", refunds: 12, amount: 600 },
  { day: "Thu", refunds: 10, amount: 520 },
  { day: "Fri", refunds: 15, amount: 800 },
  { day: "Sat", refunds: 18, amount: 950 },
  { day: "Sun", refunds: 14, amount: 700 },
];

export function RefundAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Refund Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={reasonData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {reasonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="refundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="refunds" stroke="#f59e0b" fill="url(#refundGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}