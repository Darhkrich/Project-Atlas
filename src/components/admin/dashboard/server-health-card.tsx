"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

export function ServerHealthCard() {
  const overallUptime = mockDashboardData.serverHealth.overallUptime;
  const components = mockDashboardData.serverHealth.components;
  const gaugeData = [{ name: "Uptime", value: overallUptime }];

  return (
    <DashboardCard
      title="Server Health"
      value={`${overallUptime}%`}
      icon="shield"
      mainChart={
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              innerRadius="80%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="value" fill="#22c55e" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
            <p className="text-2xl font-bold">{overallUptime}%</p>
            <p className="text-xs text-neutral-500">overall uptime</p>
          </div>
        </div>
      }
      subCards={
        <>
          {components.map((comp) => (
            <SubCardWithChart
              key={comp.name}
              label={comp.name}
              value={`${comp.uptime}%`}
              chart={
                <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={
                      comp.status === "operational"
                        ? "h-1.5 rounded-full bg-success-500"
                        : comp.status === "degraded"
                        ? "h-1.5 rounded-full bg-warning-500"
                        : "h-1.5 rounded-full bg-danger-500"
                    }
                    style={{ width: `${comp.uptime}%` }}
                  />
                </div>
              }
            />
          ))}
        </>
      }
    />
  );
}