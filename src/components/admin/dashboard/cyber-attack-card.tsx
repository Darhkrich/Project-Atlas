"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

export function CyberAttackCard() {
  const data = mockDashboardData.cyber;
  const gaugeData = [
    {
      name: "Threat",
      value: data.attacks24h,
      fill: data.threatLevel === "critical" ? "#ef4444" : data.threatLevel === "warning" ? "#f59e0b" : "#22c55e",
    },
  ];

  return (
    <DashboardCard
      title="Cyber Attack Status"
      value={data.threatLevel}
      icon="shield"
      href="/admin/security"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <RadialBarChart innerRadius="80%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
            <RadialBar dataKey="value" />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Attacks (24h)"
            value={data.attacks24h}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={data.attackTrend.map((v, i) => ({ day: i, value: v }))}>
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="APIs Blocked (24h)"
            value={data.apisBlocked24h}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <BarChart data={data.attackTrend.map((v, i) => ({ day: i, value: v }))}>
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}