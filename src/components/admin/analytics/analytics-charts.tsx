// components/admin/analytics/analytics-charts.tsx
"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/admin/ui/button";
import { ChartCard } from "./chart-card";
import {
  AnalyticsTooltip,
  CHART_COLORS,
  chartAxisProps,
  chartGridProps,
  chartMargins,
} from "@/lib/admin/analytics/chart-theme";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import type {
  FunnelStage,
  HeatmapData,
  OrderVolumePoint,
  RevenueTrendPoint,
  ServiceDistribution,
  UserGrowthPoint,
} from "@/lib/admin/types/analytics";

interface AnalyticsChartsProps {
  loading: boolean;
  revenue: RevenueTrendPoint[];
  orders: OrderVolumePoint[];
  users: UserGrowthPoint[];
  services: ServiceDistribution[];
  funnel: FunnelStage[];
  heatmap: HeatmapData[];
  onExportSection: (section: string) => void;
}

function seriesToCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) return "";
  const header = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    header,
    ...rows.map((r) => header.map((k) => (r as Record<string, unknown>)[k])),
  ]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}

export function AnalyticsCharts({
  loading,
  revenue,
  orders,
  users,
  services,
  funnel,
  heatmap,
}: AnalyticsChartsProps) {
  const downloadSeries = <T extends object>(filename: string, rows: T[]) => {
    const csv = seriesToCsv(rows);
    downloadCsv(`atlas-${filename}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const serviceTotal = services.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div id="revenue-trend">
        <ChartCard
          title="Revenue over time"
          subtitle="Gross revenue recognised in the selected range."
          loading={loading}
          empty={revenue.length === 0}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadSeries("revenue", revenue)}
            >
              CSV
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue} margin={chartMargins}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...chartGridProps} />
              <XAxis dataKey="date" {...chartAxisProps} />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                content={
                  <AnalyticsTooltip
                    valueFormatter={(v) => formatCurrency(v)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div id="order-volume">
        <ChartCard
          title="Order volume"
          subtitle="Completed and in-flight orders."
          loading={loading}
          empty={orders.length === 0}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadSeries("orders", orders)}
            >
              CSV
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orders} margin={chartMargins}>
              <CartesianGrid {...chartGridProps} />
              <XAxis dataKey="date" {...chartAxisProps} />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                content={
                  <AnalyticsTooltip
                    valueFormatter={(v) => formatNumber(v)}
                  />
                }
              />
              <Bar
                dataKey="orders"
                name="Orders"
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div id="user-growth">
        <ChartCard
          title="User growth"
          subtitle="Cumulative registered users by month."
          loading={loading}
          empty={users.length === 0}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadSeries("users", users)}
            >
              CSV
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={users} margin={chartMargins}>
              <CartesianGrid {...chartGridProps} />
              <XAxis dataKey="month" {...chartAxisProps} />
              <YAxis
                {...chartAxisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                content={
                  <AnalyticsTooltip
                    valueFormatter={(v) => formatNumber(v)}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="users"
                name="Users"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Service distribution"
        subtitle={
          serviceTotal > 0
            ? `${formatNumber(serviceTotal)} orders by service category.`
            : "Orders by service category."
        }
        loading={loading}
        empty={services.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={services}
              dataKey="count"
              nameKey="service"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {services.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <AnalyticsTooltip valueFormatter={(v) => formatNumber(v)} />
              }
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Conversion funnel"
        subtitle="Order progression from placement to delivery."
        loading={loading}
        empty={funnel.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Funnel dataKey="value" data={funnel} isAnimationActive>
              <LabelList
                position="right"
                fill="currentColor"
                stroke="none"
                dataKey="stage"
                className="text-neutral-700 dark:text-neutral-300"
              />
            </Funnel>
            <Tooltip
              content={
                <AnalyticsTooltip valueFormatter={(v) => formatNumber(v)} />
              }
            />
          </FunnelChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Order heatmap"
        subtitle="Order density by hour of day and day of week."
        loading={loading}
        empty={heatmap.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 12, right: 20, bottom: 8, left: 8 }}
          >
            <CartesianGrid {...chartGridProps} vertical />
            <XAxis
              dataKey="hour"
              type="category"
              name="Hour"
              {...chartAxisProps}
            />
            <YAxis
              dataKey="day"
              type="category"
              name="Day"
              {...chartAxisProps}
            />
            <ZAxis
              dataKey="value"
              range={[60, 520]}
              name="Orders"
            />
            <Scatter
              data={heatmap}
              fill={CHART_COLORS[0]}
              fillOpacity={0.75}
            />
            <Tooltip
              content={
                <AnalyticsTooltip valueFormatter={(v) => formatNumber(v)} />
              }
              cursor={{ strokeDasharray: "3 3" }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}