"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
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
      href="/admin/providers"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar dataKey="value" fill="#22c55e" />
            <Legend />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          {components.map((comp) => (
            <SubCardWithChart
              key={comp.name}
              label={comp.name}
              value={`${comp.uptime}%`}
              chart={
                <ResponsiveContainer width="100%" height={30}>
                  <BarChart data={[{ value: comp.uptime }]}>
                    <Bar dataKey="value" fill={comp.status === "operational" ? "#22c55e" : comp.status === "degraded" ? "#f59e0b" : "#ef4444"} />
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