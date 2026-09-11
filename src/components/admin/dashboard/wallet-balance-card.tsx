"use client";

import { DashboardCard } from "./dashboard-card";
import { SubCardWithChart } from "./sub-card-with-chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

export function WalletBalanceCard() {
  const walletBalance = mockDashboardData.walletBalance as {
    series: Array<{
      month: string;
      total: number;
      reseller: number;
      customer: number;
      merchant: number;
    }>;
    total: number;
    resellerWallets: number;
    customerWallets: number;
    merchantWallets: number;
  };
  const data = walletBalance.series;
  const total = walletBalance.total;

  return (
    <DashboardCard
      title="Wallet Balance"
      value={formatCurrency(total)}
      icon="wallet"
      mainChart={
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="walletTotalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={10} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area type="monotone" dataKey="total" stroke="#166e59" fill="url(#walletTotalGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      }
      subCards={
        <>
          <SubCardWithChart
            label="Reseller Wallets"
            value={formatCurrency(walletBalance.resellerWallets)}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={data}>
                  <Line type="monotone" dataKey="reseller" stroke="#3b82f6" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Customer Wallets"
            value={formatCurrency(walletBalance.customerWallets)}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={data}>
                  <Line type="monotone" dataKey="customer" stroke="#22c55e" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
          <SubCardWithChart
            label="Merchant Wallets"
            value={formatCurrency(walletBalance.merchantWallets)}
            chart={
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={data}>
                  <Line type="monotone" dataKey="merchant" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </>
      }
    />
  );
}