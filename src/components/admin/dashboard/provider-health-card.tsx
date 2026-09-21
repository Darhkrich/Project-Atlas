// components/admin/dashboard/provider-health-card.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { useProviders } from "@/lib/admin/hooks/use-providers";
import { providerOperationalState } from "@/lib/admin/providers/state";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import {
  PROVIDER_STATUS_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";

export function ProviderHealthCard() {
  const { providers, loading } = useProviders();

  const rows = providers.map((p) => {
    const op = providerOperationalState(p);
    return {
      name: p.name,
      successRate: p.successRate,
      slaTarget: p.sla.targetSuccessRate,
      kind: op.kind,
      color: PROVIDER_STATUS_COLORS[op.kind],
    };
  });

  const live = rows.filter((r) => r.kind === "live").length;
  const impaired = rows.filter((r) => r.kind === "impaired").length;
  const down = rows.filter((r) => r.kind === "down").length;
  const paused = rows.filter(
    (r) => r.kind === "disabled" || r.kind === "maintenance"
  ).length;

  const heroValue = loading
    ? "\u2014"
    : rows.length === 0
    ? "No providers"
    : live + "/" + rows.length + " healthy";

  return (
    <DashboardCard
      title="Provider Health"
      value={heroValue}
      icon="server"
      delta={dashboardTrends.providerHealth}
      deltaLabel="success rate vs prev"
      href="/admin/providers"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_STROKE}
              className={GRID_CLASS}
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickFormatter={(value: number) => value + "%"}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              width={80}
            />
            <Tooltip
              formatter={(value: number, _name, payload: { payload?: { slaTarget?: number } }) => {
                const target = payload?.payload?.slaTarget;
                const suffix =
                  typeof target === "number"
                    ? " (target " + target + "%)"
                    : "";
                return [value.toFixed(1) + "%" + suffix, "Success rate"];
              }}
            />
            <Bar dataKey="successRate" radius={[0, 4, 4, 0]}>
              {rows.map((row, index) => (
                <Cell key={"bar-" + index} fill={row.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Healthy"
            value={live}
            status={live > 0 ? "success" : "neutral"}
          />
          <SubCardWithChart
            label="Impaired"
            value={impaired}
            status={impaired > 0 ? "warning" : "success"}
          />
          <SubCardWithChart
            label="Down / paused"
            value={down + paused}
            status={down > 0 ? "danger" : paused > 0 ? "warning" : "success"}
          />
        </>
      }
    />
  );
}