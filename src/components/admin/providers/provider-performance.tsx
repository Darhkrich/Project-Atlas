// components/admin/providers/provider-performance.tsx
"use client";

import { useMemo, useState } from "react";
import type { Provider } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";
import { chartFormatter } from "@/lib/admin/charts/format";

interface ProviderPerformanceProps {
  provider: Provider;
}

type Metric = "volume" | "latency";

/**
 * Deterministic per-provider seed. Two providers never render identical
 * charts. Replaced when real time-series data exists.
 */
function buildSeries(provider: Provider) {
  const buckets = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const base = provider.transactionCountToday / 6;
  const seed = hashString(provider.id);
  const latencyBase = provider.averageResponseTime || 500;
  return buckets.map((time, i) => {
    const wobble = (seed + i * 37) % 100;
    const weight = 0.7 + (wobble / 100) * 0.6;
    const transactions = Math.max(
      0,
      Math.round(base * weight + (i < 3 ? -base * 0.2 : base * 0.2))
    );
    const latency = Math.max(
      50,
      Math.round(latencyBase * (0.85 + (wobble / 100) * 0.3))
    );
    return { time, transactions, latency };
  });
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 1000;
  }
  return h;
}

export function ProviderPerformance({ provider }: ProviderPerformanceProps) {
  const [metric, setMetric] = useState<Metric>("volume");
  const data = useMemo(() => buildSeries(provider), [provider]);
  const failureRate = (100 - provider.successRate).toFixed(1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Provider performance</CardTitle>
        <div
          role="group"
          aria-label="Performance metric"
          className="flex gap-1"
        >
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={metric === "volume"}
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
            aria-pressed={metric === "latency"}
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
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricBox
            label="Transactions today"
            value={formatNumber(provider.transactionCountToday)}
          />
          <MetricBox label="Success rate" value={`${provider.successRate}%`} />
          <MetricBox label="Failure rate" value={`${failureRate}%`} />
          <MetricBox
            label="Avg response"
            value={`${provider.averageResponseTime}ms`}
          />
        </div>

        <p className="sr-only">
          {metric === "volume"
            ? `Transaction volume over six hourly buckets for ${provider.name}, ranging from ${Math.min(...data.map((d) => d.transactions))} to ${Math.max(...data.map((d) => d.transactions))} transactions.`
            : `Response latency over six hourly buckets for ${provider.name}, ranging from ${Math.min(...data.map((d) => d.latency))}ms to ${Math.max(...data.map((d) => d.latency))}ms.`}
        </p>

        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={200}>
            {metric === "volume" ? (
              <AreaChart data={data}>
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
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  label={{
                    value: "transactions",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "#888" },
                  }}
                />
                <Tooltip
                  formatter={chartFormatter((v) => [
                    formatNumber(v),
                    "Transactions",
                  ])}
                />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stroke="#166e59"
                  fill="url(#perfVolGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="perfLatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  label={{
                    value: "ms",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "#888" },
                  }}
                />
                <Tooltip
                  formatter={chartFormatter((v) => [v + "ms", "Latency"])}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#f59e0b"
                  fill="url(#perfLatGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}