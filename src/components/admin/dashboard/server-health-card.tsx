// components/admin/dashboard/server-health-card.tsx
"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

type ComponentStatus = "operational" | "degraded" | "down";

function componentStatus(raw: string): ComponentStatus {
  if (raw === "operational") return "operational";
  if (raw === "degraded") return "degraded";
  return "down";
}

export function ServerHealthCard() {
  const health = mockDashboardData.serverHealth;
  const components = health.components;

  const degradedCount = components.filter(
    (c) => componentStatus(c.status) !== "operational"
  ).length;

  return (
    <DashboardCard
      title="Server Health"
      value={health.overallUptime + "%"}
      icon="activity"
      href="/admin/providers"
      mainChart={
        <div className="space-y-2 pt-1">
          {components.map((c) => {
            const status = componentStatus(c.status);
            const barTone =
              status === "operational"
                ? "bg-success-500"
                : status === "degraded"
                ? "bg-warning-500"
                : "bg-danger-500";
            return (
              <div key={c.name}>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                  <span className="truncate">{c.name}</span>
                  <span className="tabular-nums">{c.uptime}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={"h-1.5 rounded-full " + barTone}
                    style={{ width: c.uptime + "%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Uptime"
            value={health.overallUptime + "%"}
            status="success"
          />
          <SubCardWithChart
            label="Components"
            value={components.length}
            status="neutral"
          />
          <SubCardWithChart
            label="Degraded"
            value={degradedCount}
            status={degradedCount > 0 ? "warning" : "success"}
          />
        </>
      }
    />
  );
}