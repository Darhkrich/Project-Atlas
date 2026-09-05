/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";
import { Badge } from "@/components/admin/ui/badge";

export function ServicePerformanceCard() {
  const data = mockDashboardData.servicePerformance;

  return (
    <DashboardCard
      title="Service Performance"
      value={data.length}
      icon="grid"
      href="/admin/services"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="service" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
            <Bar dataKey="revenue" fill="#166e59" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {data.slice(0, 3).map((service: typeof data[number]) => (
            <SubCardWithChart
              key={service.service}
              label={service.service}
              value={`${service.successRate}%`}
              breakdown={`Orders: ${service.orders}`}
              chart={
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart data={[{ value: service.successRate }]}>
                    <Bar dataKey="value" fill={service.status === "operational" ? "#22c55e" : "#f59e0b"} />
                  </BarChart>
                </ResponsiveContainer>
              }
            />
          ))}
        </>
      }
    />
  );
}