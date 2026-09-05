/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  AreaChart, Area, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockOrderAnalytics } from "@/lib/admin/mock/order-analytics";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

const sparklineGradient = (
  <defs>
    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
      <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
    </linearGradient>
  </defs>
);

export function OrderAnalytics() {
  const [trendRange, setTrendRange] = useState<"today" | "7d" | "30d">("today");
  const [trendMetric, setTrendMetric] = useState<"orders" | "revenue">("orders");

  // Filter trend data based on range (mock: reuse today's data)
  const trendData = mockOrderAnalytics.trend.data;

  return (
    <div className="space-y-6">
      {/* KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-brand-100">Total Orders Today</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-bold">{mockOrderAnalytics.kpis.totalOrdersToday}</span>
              <span className="text-xs text-brand-200">+12% vs yesterday</span>
            </div>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  {sparklineGradient}
                  <Area type="monotone" dataKey="value" stroke="#fff" fill="url(#sparkGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-neutral-500">Avg Order Value</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-bold">{formatCurrency(mockOrderAnalytics.kpis.avgOrderValue)}</span>
              <span className="text-xs text-success-600">+3.2%</span>
            </div>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  {sparklineGradient}
                  <Area type="monotone" dataKey="value" stroke="#166e59" fill="url(#sparkGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-neutral-500">Success Rate</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-bold text-success-600">{mockOrderAnalytics.kpis.successRate}%</span>
              <span className="text-xs text-success-600">+1.5%</span>
            </div>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  {sparklineGradient}
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#sparkGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-danger-600 to-danger-700 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-danger-100">Failed Orders Today</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-bold">{mockOrderAnalytics.kpis.failedOrdersToday}</span>
              <span className="text-xs text-danger-200">-8% vs yesterday</span>
            </div>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  {sparklineGradient}
                  <Area type="monotone" dataKey="value" stroke="#fff" fill="url(#sparkGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Orders & Revenue Trend</CardTitle>
            <div className="flex gap-1">
              {(["today", "7d", "30d"] as const).map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  className={trendRange === range ? "bg-brand-50 text-brand-700" : ""}
                  onClick={() => setTrendRange(range)}
                >
                  {range === "today" ? "Today" : range.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => setTrendMetric("orders")}>Orders</Button>
              <Button variant="outline" size="sm" onClick={() => setTrendMetric("revenue")}>Revenue</Button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166e59" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="orders" fill="#166e59" radius={[4,4,0,0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={mockOrderAnalytics.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {mockOrderAnalytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance & Failure Reasons & Network Success */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockOrderAnalytics.servicePerformance.map((service) => (
                <li key={service.service}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{service.service}</span>
                    <span className="text-neutral-500">{service.orders} orders</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className={cn("h-2 rounded-full", service.successRate >= 95 ? "bg-success-500" : service.successRate >= 90 ? "bg-warning-500" : "bg-danger-500")}
                      style={{ width: `${service.successRate}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-neutral-500">
                    <span>Success: {service.successRate}%</span>
                    <span>Revenue: {formatCurrency(service.revenue)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failure Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mockOrderAnalytics.failureReasons} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" tickLine={false} axisLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0,4,4,0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Success Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mockOrderAnalytics.networkSuccess} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="network" type="category" tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#166e59" radius={[0,4,4,0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}