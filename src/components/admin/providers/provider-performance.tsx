"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
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
  ComposedChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface ProviderPerformanceProps {
  provider: Provider;
}

const volumeData = [
  { time: "00:00", transactions: 120, latency: 380 },
  { time: "04:00", transactions: 250, latency: 410 },
  { time: "08:00", transactions: 400, latency: 450 },
  { time: "12:00", transactions: 600, latency: 480 },
  { time: "16:00", transactions: 800, latency: 520 },
  { time: "20:00", transactions: 1100, latency: 470 },
];

export function ProviderPerformance({ provider }: ProviderPerformanceProps) {
  const [metric, setMetric] = useState<"volume" | "latency">("volume");

  const failureRate = (100 - provider.successRate).toFixed(1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Provider Performance</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs",
              metric === "volume" &&
                "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            )}
            onClick={() => setMetric("volume")}
          >
            Volume
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs",
              metric === "latency" &&
                "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            )}
            onClick={() => setMetric("latency")}
          >
            Latency
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Metric strip */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">Transactions Today</p>
            <p className="mt-0.5 text-sm font-bold">
              {provider.transactionCountToday.toLocaleString()}
            </p>
          </div>
          <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">Success Rate</p>
            <p className="mt-0.5 text-sm font-bold text-success-600">
              {provider.successRate}%
            </p>
          </div>
          <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">Failure Rate</p>
            <p className="mt-0.5 text-sm font-bold text-danger-600">
              {failureRate}%
            </p>
          </div>
          <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">Avg Response</p>
            <p className="mt-0.5 text-sm font-bold">
              {provider.averageResponseTime}ms
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          {metric === "volume" ? (
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="perfVolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="#166e59"
                fill="url(#perfVolGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={volumeData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <XAxis dataKey="time" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Latency (ms)"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}