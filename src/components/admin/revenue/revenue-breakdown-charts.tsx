/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  BarChart,
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
import {
  mockStreamTrend,
  mockServiceRevenue,
  mockPaymentMethodRevenue,
  mockNetworkRevenue,
  mockTopPerformers,
} from "@/lib/admin/mock/revenue";
import { formatCurrency } from "@/lib/admin/formatters";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

export function RevenueStreamBreakdown() {
  const router = useRouter();
  const data = mockStreamTrend.slice(-3);

  const handleStreamClick = (stream: string) => {
    router.push(`/admin/transactions?source=${stream}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue by Stream</CardTitle>
        <Link
          href="/admin/transactions"
          className="text-xs text-brand-600 hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend />
            <Bar
              dataKey="digital_services"
              stackId="a"
              fill="#3b82f6"
              name="Digital Services"
              onClick={() => handleStreamClick("digital_services")}
              style={{ cursor: "pointer" }}
            />
            <Bar
              dataKey="resellers"
              stackId="a"
              fill="#22c55e"
              name="Resellers"
              onClick={() => handleStreamClick("resellers")}
              style={{ cursor: "pointer" }}
            />
            <Bar
              dataKey="ecommerce"
              stackId="a"
              fill="#f59e0b"
              name="E‑commerce"
              onClick={() => handleStreamClick("ecommerce")}
              style={{ cursor: "pointer" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopServicesRevenue() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Services by Revenue</CardTitle>
        <Link href="/admin/services" className="text-xs text-brand-600 hover:underline">
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockServiceRevenue} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="service"
              type="category"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar
              dataKey="revenue"
              fill="#166e59"
              radius={[0, 4, 4, 0]}
              barSize={20}
              onClick={(entry: any) =>
                router.push(`/admin/orders?service=${entry.service}`)
              }
              style={{ cursor: "pointer" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PaymentMethodRevenueChart() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue by Payment Method</CardTitle>
        <Link
          href="/admin/transactions?view=method"
          className="text-xs text-brand-600 hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={mockPaymentMethodRevenue}
              dataKey="revenue"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              stroke="none"
              onClick={(entry: any) =>
                router.push(
                  `/admin/transactions?method=${entry.method.toLowerCase().replace(/\s/g, "_")}`
                )
              }
              style={{ cursor: "pointer" }}
            >
              {mockPaymentMethodRevenue.map((_, index) => (
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

export function NetworkRevenueChart() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue by Network</CardTitle>
        <Link
          href="/admin/orders?view=network"
          className="text-xs text-brand-600 hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockNetworkRevenue}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <XAxis dataKey="network" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar
              dataKey="revenue"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              onClick={(entry: any) =>
                router.push(`/admin/orders?network=${entry.network}`)
              }
              style={{ cursor: "pointer" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopPerformersTable() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Performers</CardTitle>
        <Link
          href="/admin/resellers"
          className="text-xs text-brand-600 hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500">
              <th className="pb-2">Name</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Revenue</th>
              <th className="pb-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {mockTopPerformers.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
                onClick={() =>
                  router.push(
                    p.type === "reseller"
                      ? `/admin/resellers`
                      : `/admin/ecommerce/merchants`
                  )
                }
              >
                <td className="py-2">{p.name}</td>
                <td className="capitalize">{p.type}</td>
                <td>{formatCurrency(p.revenue)}</td>
                <td
                  className={
                    p.trend >= 0 ? "text-success-600" : "text-danger-600"
                  }
                >
                  {p.trend > 0 ? "+" : ""}
                  {p.trend}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}