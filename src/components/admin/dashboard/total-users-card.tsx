// components/admin/dashboard/total-users-card.tsx
"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { PictorialChart } from "./pictorial-chart";
import {
  mockDashboardData,
} from "@/lib/admin/mock/dashboard";
import { userGrowthSeries } from "@/lib/admin/mock/dashboard-series";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import { ACCOUNT_COLORS } from "@/lib/admin/dashboard/chart-palette";

export function TotalUsersCard() {
  const total = mockDashboardData.totalUsers.total;
  const resellers = mockDashboardData.totalUsers.resellers;
  const customers = mockDashboardData.totalUsers.customers;
  const merchants = mockDashboardData.totalUsers.merchants;

  const distribution = [
    { name: "Resellers", value: resellers, icon: "users" as const, color: "info" as const },
    { name: "Customers", value: customers, icon: "user" as const, color: "success" as const },
    { name: "Merchants", value: merchants, icon: "store" as const, color: "warning" as const },
  ];

  return (
    <DashboardCard
      title="Total Users"
      value={total.toLocaleString()}
      icon="users"
      delta={dashboardTrends.totalUsers}
      deltaLabel="vs last month"
      href="/admin/customers"
      mainChart={<PictorialChart data={distribution} className="mt-1" />}
      subCards={
        <>
          <SubCardWithChart
            label="Resellers"
            value={resellers}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={userGrowthSeries}>
                  <defs>
                    <linearGradient id="tuRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCOUNT_COLORS.resellers} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={ACCOUNT_COLORS.resellers} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="resellers" stroke={ACCOUNT_COLORS.resellers} fill="url(#tuRes)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Customers"
            value={customers}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={userGrowthSeries}>
                  <defs>
                    <linearGradient id="tuCust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCOUNT_COLORS.customers} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={ACCOUNT_COLORS.customers} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="customers" stroke={ACCOUNT_COLORS.customers} fill="url(#tuCust)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Merchants"
            value={merchants}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={userGrowthSeries}>
                  <defs>
                    <linearGradient id="tuMer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCOUNT_COLORS.merchants} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={ACCOUNT_COLORS.merchants} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="merchants" stroke={ACCOUNT_COLORS.merchants} fill="url(#tuMer)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}