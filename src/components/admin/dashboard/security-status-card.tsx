// components/admin/dashboard/security-status-card.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { useSecurityFeed } from "@/lib/admin/hooks/use-security-feed";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import { SECURITY_COVERAGE_COLORS } from "@/lib/admin/dashboard/chart-palette";
import { formatNumber } from "@/lib/shared/format";

export function SecurityStatusCard() {
  const { summary } = useSecurityFeed();

  const coverage = [
    { name: "2FA on", value: summary.twoFactorEnabled },
    { name: "2FA off", value: summary.twoFactorMissing },
  ];
  const totalAdmins = summary.twoFactorEnabled + summary.twoFactorMissing;
  const coveragePct =
    totalAdmins === 0 ? 0 : Math.round((summary.twoFactorEnabled / totalAdmins) * 100);

  return (
    <DashboardCard
      title="Security Status"
      value={summary.status.toUpperCase()}
      icon="shield"
      delta={dashboardTrends.failedLogins}
      deltaLabel="failed logins vs prev"
      href="/admin/security"
      mainChart={
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={coverage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {coverage.map((_, index) => (
                  <Cell
                    key={"cov-" + index}
                    fill={SECURITY_COVERAGE_COLORS[index % SECURITY_COVERAGE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold tabular-nums">
              {coveragePct}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              2FA coverage
            </p>
          </div>
        </div>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Failed logins"
            value={formatNumber(summary.failedLogins24h)}
            status={summary.failedLogins24h > 0 ? "warning" : "success"}
          />
          <SubCardWithChart
            label="Blocked IPs"
            value={formatNumber(summary.blockedIPs)}
            status={summary.blockedIPs > 0 ? "warning" : "neutral"}
          />
          <SubCardWithChart
            label="Locked"
            value={formatNumber(summary.lockedAccounts)}
            status={summary.lockedAccounts > 0 ? "danger" : "success"}
          />
        </>
      }
    />
  );
}