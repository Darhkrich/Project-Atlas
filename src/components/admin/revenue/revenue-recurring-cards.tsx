"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  CHART_PALETTE,
  AXIS_STROKE_CLASS,
} from "@/lib/admin/charts/theme";
import {
  STREAM_LABEL,
  type RevenueStreamId,
} from "@/lib/admin/revenue/revenue-labels";
import type { RecurringMetrics } from "@/lib/admin/revenue/revenue-projection";

export function MRRARRCard({ metrics }: { metrics: RecurringMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly recurring revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(metrics.mrr)}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            From active merchant subscriptions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Annual recurring revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(metrics.arr)}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            MRR projected to twelve months
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ARPUByStreamCard({
  metrics,
}: {
  metrics: RecurringMetrics;
}) {
  const streams: RevenueStreamId[] = [
    "digital_services",
    "resellers",
    "ecommerce",
  ];
  const data = streams.map((stream) => ({
    stream: STREAM_LABEL[stream],
    arpu: metrics.arpuByStream[stream],
  }));

  const allZero = data.every((d) => d.arpu === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average revenue per user</CardTitle>
      </CardHeader>
      <CardContent>
        {allZero ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            No active users in this range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className={AXIS_STROKE_CLASS}
              />
              <XAxis dataKey="stream" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar
                dataKey="arpu"
                fill={CHART_PALETTE.brand}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}