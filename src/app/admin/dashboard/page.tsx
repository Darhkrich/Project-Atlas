"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TotalRevenueCard } from "@/components/admin/dashboard/total-revenue-card";
import { TodayRevenueCard } from "@/components/admin/dashboard/today-revenue-card";
import { ActiveUsersCard } from "@/components/admin/dashboard/active-users-card";
import { TotalUsersCard } from "@/components/admin/dashboard/total-users-card";
import { TransactionsCard } from "@/components/admin/dashboard/transactions-card";
import { CyberAttackCard } from "@/components/admin/dashboard/cyber-attack-card";
import { ServerHealthCard } from "@/components/admin/dashboard/server-health-card";
import { LiveStoresCard } from "@/components/admin/dashboard/live-stores-card";
import { PendingRefundsCard } from "@/components/admin/dashboard/pending-refunds-card";
import { SupportTicketsCard } from "@/components/admin/dashboard/support-tickets-card";
import { ServicePerformanceCard } from "@/components/admin/dashboard/service-performance-card";
import { WalletBalanceCard } from "@/components/admin/dashboard/wallet-balance-card";
import { QuickActionsCard } from "@/components/admin/dashboard/quick-actions-card";
import { RevenueByPaymentMethodCard } from "@/components/admin/dashboard/revenue-by-payment-method-card";
import { TopPerformersCard } from "@/components/admin/dashboard/top-performers-card";
import { RecentEventsCard } from "@/components/admin/dashboard/recent-events-card";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { OrderStatusChart } from "@/components/admin/dashboard/order-status-chart";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Dashboard" description="Operational overview" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div className="h-80 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Atlas operational overview"
        actions={
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <AtlasIcon name="trending-up" className="h-4 w-4 mr-1" /> Refresh
          </Button>
        }
      />

      {/* Row 1: Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <TotalRevenueCard />
        <TodayRevenueCard />
        <ActiveUsersCard />
        <TransactionsCard />
      </div>

      {/* Row 2: Operational health & system */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <CyberAttackCard />
        <ServerHealthCard />
        <TotalUsersCard />
        <LiveStoresCard />
      </div>

      {/* Row 3: Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <RevenueChart />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <OrderStatusChart />
        </div>
      </div>

      {/* Row 4: Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <PendingRefundsCard />
        <SupportTicketsCard />
        <ServicePerformanceCard />
        <WalletBalanceCard />
      </div>

      {/* Row 5: Quick Actions (full width) */}
      <QuickActionsCard />

      {/* Row 6: Analytics and events (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <RevenueByPaymentMethodCard />
        <TopPerformersCard />
        <RecentEventsCard />
      </div>
    </div>
  );
}