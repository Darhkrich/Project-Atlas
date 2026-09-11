/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { mockRevenueKpi } from "@/lib/admin/mock/revenue";
import { formatCurrency } from "@/lib/admin/formatters";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6"];

export function MRRARRCard() {
  const mrr = mockRevenueKpi.metrics.mrr;
  const arr = mockRevenueKpi.metrics.arr;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Recurring Revenue (MRR)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(mrr)}</p>
          <p className="text-sm text-neutral-500">From e‑commerce subscriptions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Annual Recurring Revenue (ARR)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(arr)}</p>
          <p className="text-sm text-neutral-500">Projected yearly</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ARPUByStreamCard() {
  const arpu = mockRevenueKpi.metrics.arpuByStream;
  const data = [
    { stream: "Digital Services", arpu: arpu.digital_services },
    { stream: "Resellers", arpu: arpu.resellers },
    { stream: "E‑commerce", arpu: arpu.ecommerce },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Revenue Per User (ARPU)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis dataKey="stream" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar dataKey="arpu" fill="#166e59" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RevenueForecastCard() {
  // Forecast with confidence band
  const base = mockRevenueKpi.metrics.forecast.map(
    (p: (typeof mockRevenueKpi.metrics.forecast)[number]) => ({
    month: p.month,
    actual: p.actual || null,
    forecast: p.forecast || null,
    lower: p.forecast ? p.forecast * 0.9 : null,
    upper: p.forecast ? p.forecast * 1.12 : null,
    }),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Forecast (Next 3 Months)</CardTitle>
        <Badge variant="info">Confidence: ±10–12%</Badge>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={base}>
            <defs>
              <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#forecastBandGrad)"
              name="Upper bound"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={0}
              name="Lower bound"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#166e59"
              strokeWidth={2}
              dot={false}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopCustomersCard() {
  const router = useRouter();
  const data = mockRevenueKpi.metrics.topCustomers;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Customers by Spending</CardTitle>
        <Link
          href="/admin/customers"
          className="text-xs text-brand-600 hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500">
              <th className="pb-2">Customer</th>
              <th className="pb-2">Stream</th>
              <th className="pb-2">Orders</th>
              <th className="pb-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c: { id: string; name: string; stream: string; orders: number; revenue: number }) => (
              <tr
                key={c.id}
                className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
                onClick={() => router.push(`/admin/customers/${c.id}`)}
              >
                <td className="py-2">{c.name}</td>
                <td className="capitalize">{c.stream.replace(/_/g, " ")}</td>
                <td>{c.orders}</td>
                <td className="font-medium">{formatCurrency(c.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function RefundImpactCard() {
  const impact = mockRevenueKpi.metrics.refundImpact;
  const netRate = 100 - impact.refundRate;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Refunds & Chargebacks Impact</CardTitle>
        <Link
          href="/admin/refunds"
          className="text-xs text-brand-600 hover:underline"
        >
          View refunds →
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Total Refunds</p>
            <p className="text-lg font-bold text-danger-600">
              {formatCurrency(impact.totalRefunds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Chargebacks</p>
            <p className="text-lg font-bold text-danger-600">
              {formatCurrency(impact.totalChargebacks)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Net Revenue</p>
            <p className="text-lg font-bold text-success-600">
              {formatCurrency(impact.netRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Refund Rate</p>
            <p className="text-lg font-bold">{impact.refundRate}%</p>
          </div>
        </div>

        {/* Net revenue vs refund bar */}
        <div>
          <p className="mb-1 text-xs font-medium text-neutral-500">Net vs Refunds</p>
          <div className="flex h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-3 bg-success-500"
              style={{ width: `${netRate}%` }}
            />
            <div
              className="h-3 bg-danger-500"
              style={{ width: `${impact.refundRate}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>Net: {netRate}%</span>
            <span>Refunded: {impact.refundRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RegionRevenueCard() {
  const data = mockRevenueKpi.metrics.regionRevenue;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Region</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="region"
              type="category"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar
              dataKey="revenue"
              fill="#166e59"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SourceRevenueCard() {
  const data = mockRevenueKpi.metrics.sourceRevenue;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Acquisition Source</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="source"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              stroke="none"
            >
              {data.map((_: unknown, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function WeekdayRevenueCard() {
  const data = mockRevenueKpi.metrics.revenueByWeekday;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Weekday</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ProfitMarginCard() {
  const margin = mockRevenueKpi.metrics.profitMarginEstimate;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated Profit Margin</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold text-success-600">{margin}%</p>
        <p className="text-sm text-neutral-500">Based on service costs (mock)</p>
        <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className="h-2 rounded-full bg-success-500"
            style={{ width: `${margin}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentSuccessRateCard() {
  const rate = mockRevenueKpi.metrics.paymentSuccessRate;
  const color = rate >= 97 ? "text-success-600" : rate >= 93 ? "text-warning-600" : "text-danger-600";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Success Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-4xl font-bold ${color}`}>{rate}%</p>
        <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={`h-2 rounded-full ${
              rate >= 97 ? "bg-success-500" : rate >= 93 ? "bg-warning-500" : "bg-danger-500"
            }`}
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Aligns with failed transactions to detect provider issues
        </p>
      </CardContent>
    </Card>
  );
}

export function LowMarginAlertsCard() {
  const alerts = [
    { service: "WAEC", margin: 6.4 },
    { service: "GOtv", margin: 8.1 },
  ];

  return (
    <Card className="border-l-4 border-l-warning-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low‑Margin Alerts</CardTitle>
        <Badge variant="warning">{alerts.length} services</Badge>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.service}
              className="flex items-center justify-between rounded-md bg-warning-50 p-2 text-sm dark:bg-warning-900/20"
            >
              <span className="font-medium">{a.service}</span>
              <span className="text-warning-700 dark:text-warning-300">
                Margin: {a.margin}%
              </span>
              <Link href="/admin/pricing">
                <Button variant="ghost" size="sm">
                  Review
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}