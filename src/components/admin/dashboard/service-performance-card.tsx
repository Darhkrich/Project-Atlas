"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

export function ServicePerformanceCard() {
  const data = mockDashboardData.servicePerformance as Array<{
    service: string;
    revenue: number;
    successRate: number;
    failureRate: number;
  }>;

  return (
    <DashboardCard
      title="Service Performance"
      value={data.length}
      icon="grid"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="service" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#166e59" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {data.slice(0, 3).map((service) => (
            <SubCardWithChart
              key={service.service}
              label={service.service}
              value={`${service.successRate}% success`}
              chart={
                <div className="mt-1 space-y-1">
                  {/* Success bar */}
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className="h-1.5 rounded-full bg-success-500"
                      style={{ width: `${service.successRate}%` }}
                    />
                  </div>
                  {/* Failure bar */}
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className="h-1.5 rounded-full bg-danger-500"
                      style={{ width: `${service.failureRate}%` }}
                    />
                  </div>
                </div>
              }
            />
          ))}
        </>
      }
    />
  );
}