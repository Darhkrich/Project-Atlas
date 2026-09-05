"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";

export function LiveStoresCard() {
  const data = mockDashboardData.liveStoresData;
  const reseller = mockDashboardData.liveStores.resellerStorefronts;
  const merchant = mockDashboardData.liveStores.merchantStores;

  return (
    <DashboardCard
      title="Live Stores"
      value={`${reseller + merchant}`}
      icon="store"
      href="/admin/storefronts"
      mainChart={
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip />
            <Bar dataKey="value" fill="#166e59" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Reseller Storefronts"
            value={reseller}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="resellerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#resellerGrad)" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Merchant Stores"
            value={merchant}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="merchantGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#merchantGrad)" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}