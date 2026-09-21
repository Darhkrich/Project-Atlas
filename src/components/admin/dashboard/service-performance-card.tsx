// components/admin/dashboard/service-performance-card.tsx
"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { useProviders } from "@/lib/admin/hooks/use-providers";
import { providerSLAStatus } from "@/lib/admin/providers/state";

export function ServicePerformanceCard() {
  const { providers, loading } = useProviders();

  const rows = providers.map((p) => ({
    provider: p,
    sla: providerSLAStatus(p),
  }));

  const breaches = rows.filter(
    (r) => !r.sla.successRate.met || !r.sla.latency.met
  ).length;

  const avgSuccess =
    providers.length === 0
      ? 0
      : providers.reduce((sum, p) => sum + p.successRate, 0) /
        providers.length;

  const hero = loading
    ? "\u2014"
    : providers.length === 0
    ? "No providers"
    : avgSuccess.toFixed(1) + "% avg";

  return (
    <DashboardCard
      title="Service Performance"
      value={hero}
      icon="grid"
      href="/admin/providers"
      mainChart={
        <ul role="list" className="space-y-2 pt-1">
          {rows.slice(0, 5).map(({ provider, sla }) => {
            const ok = sla.successRate.met;
            return (
              <li
                key={provider.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={
                      "h-2 w-2 shrink-0 rounded-full " +
                      (ok ? "bg-success-500" : "bg-danger-500")
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate text-neutral-700 dark:text-neutral-200">
                    {provider.name}
                  </span>
                </div>
                <span className="shrink-0 tabular-nums text-neutral-500 dark:text-neutral-400">
                  {provider.successRate.toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Providers"
            value={providers.length}
            status="neutral"
          />
          <SubCardWithChart
            label="SLA met"
            value={rows.length - breaches}
            status={breaches === 0 ? "success" : "warning"}
          />
          <SubCardWithChart
            label="Breaches"
            value={breaches}
            status={breaches > 0 ? "danger" : "success"}
          />
        </>
      }
    />
  );
}