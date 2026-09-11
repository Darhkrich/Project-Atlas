"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import Link from "next/link";

export function CyberAttackCard() {
  const data = mockDashboardData.cyber;
  const gaugeColor =
    data.threatLevel === "critical"
      ? "#ef4444"
      : data.threatLevel === "warning"
      ? "#f59e0b"
      : "#22c55e";
  const gaugeData = [{ name: "Threat", value: data.attacks24h, fill: gaugeColor }];

  return (
    <DashboardCard
      title="Cyber Attack Status"
      value={data.threatLevel.toUpperCase()}
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
              <RadialBar dataKey="value" fill={gaugeColor} cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
            <p className="text-2xl font-bold">{data.attacks24h}</p>
            <p className="text-xs text-neutral-500">attacks (24h)</p>
          </div>
          <div className="mt-1 text-center">
            <Link
              href="/admin/security"
              className="text-xs text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
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