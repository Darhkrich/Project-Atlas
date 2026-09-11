/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { mockOrderAnalytics } from "@/lib/admin/mock/order-analytics";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

const COLORS = ["#166e59", "#3b82f6", "#f59e0b", "#22c55e", "#8b5cf6"];

export function OrderAnalytics() {
  const [trendMetric, setTrendMetric] = useState<"orders" | "revenue">("orders");

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-brand-100">Total Orders Today</p>
            <p className="mt-2 text-3xl font-bold">{mockOrderAnalytics.kpis.totalOrdersToday}</p>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  <defs>
                    <linearGradient id="analyticsKpiGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#fff" fill="url(#analyticsKpiGrad1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-neutral-500">Avg Order Value</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(mockOrderAnalytics.kpis.avgOrderValue)}</p>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  <defs>
                    <linearGradient id="analyticsKpiGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#166e59" fill="url(#analyticsKpiGrad2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-neutral-500">Success Rate</p>
            <p className="mt-2 text-3xl font-bold text-success-600">{mockOrderAnalytics.kpis.successRate}%</p>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  <defs>
                    <linearGradient id="analyticsKpiGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#analyticsKpiGrad3)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-danger-600 to-danger-700 text-white border-0">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-danger-100">Failed Today</p>
            <p className="mt-2 text-3xl font-bold">{mockOrderAnalytics.kpis.failedOrdersToday}</p>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOrderAnalytics.kpis.sparklineData}>
                  <defs>
                    <linearGradient id="analyticsKpiGrad4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#fff" fill="url(#analyticsKpiGrad4)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Orders & Revenue Trend</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setTrendMetric("orders")}>
                Orders
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTrendMetric("revenue")}>
                Revenue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={mockOrderAnalytics.trend.data}>
                <defs>
                  <linearGradient id="analyticsTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166e59" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: any) => trendMetric === "revenue" ? formatCurrency(Number(value)) : value} />
                {trendMetric === "orders" ? (
                  <Bar dataKey="orders" fill="#166e59" radius={[4, 4, 0, 0]} />
                ) : (
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
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
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {mockOrderAnalytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance and Failures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Service Performance</CardTitle></CardHeader>
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
                      className={cn(
                        "h-2 rounded-full",
                        service.successRate >= 95
                          ? "bg-success-500"
                          : service.successRate >= 90
                          ? "bg-warning-500"
                          : "bg-danger-500"
                      )}
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
          <CardHeader><CardTitle>Failure Reasons</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={mockOrderAnalytics.failureReasons} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" tickLine={false} axisLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={18} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Network Success Rates</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={mockOrderAnalytics.networkSuccess} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="network" type="category" tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#166e59" radius={[0, 4, 4, 0]} barSize={18} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}