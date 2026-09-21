// components/admin/dashboard/live-stores-card.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { storeGrowthSeries } from "@/lib/admin/mock/dashboard-series";
import { dashboardTrends } from "@/lib/admin/mock/dashboard-trends";
import {
  ACCOUNT_COLORS,
  GRID_STROKE,
  GRID_CLASS,
} from "@/lib/admin/dashboard/chart-palette";

export function LiveStoresCard() {
  const reseller = mockDashboardData.liveStores.resellerStorefronts;
  const merchant = mockDashboardData.liveStores.merchantStores;
  const total = reseller + merchant;

  return (
    <DashboardCard
      title="Live Stores"
      value={total.toLocaleString()}
      icon="store"
      delta={dashboardTrends.liveStores}
      deltaLabel="vs last month"
      href="/admin/ecommerce/storefronts"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={storeGrowthSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} className={GRID_CLASS} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="resellerStorefronts" fill={ACCOUNT_COLORS.resellers} name="Reseller storefronts" radius={[2, 2, 0, 0]} />
            <Bar dataKey="merchantStores" fill={ACCOUNT_COLORS.merchants} name="Merchant stores" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Reseller"
            value={reseller}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={storeGrowthSeries}>
                  <defs>
                    <linearGradient id="lsRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCOUNT_COLORS.resellers} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={ACCOUNT_COLORS.resellers} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="resellerStorefronts" stroke={ACCOUNT_COLORS.resellers} fill="url(#lsRes)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Merchant"
            value={merchant}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={storeGrowthSeries}>
                  <defs>
                    <linearGradient id="lsMer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCOUNT_COLORS.merchants} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={ACCOUNT_COLORS.merchants} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="merchantStores" stroke={ACCOUNT_COLORS.merchants} fill="url(#lsMer)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Total"
            value={total}
            chart={
              <ResponsiveContainer width="100%" height={35}>
                <AreaChart data={storeGrowthSeries}>
                  <defs>
                    <linearGradient id="lsTot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-600, #166e59)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-brand-600, #166e59)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={(d: { resellerStorefronts: number; merchantStores: number }) =>
                      d.resellerStorefronts + d.merchantStores
                    }
                    stroke="var(--color-brand-600, #166e59)"
                    fill="url(#lsTot)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}