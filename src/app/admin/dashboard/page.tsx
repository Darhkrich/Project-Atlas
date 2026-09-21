// app/admin/dashboard/page.tsx
"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TotalRevenueCard } from "@/components/admin/dashboard/total-revenue-card";
import { TodayRevenueCard } from "@/components/admin/dashboard/today-revenue-card";
import { ActiveUsersCard } from "@/components/admin/dashboard/active-users-card";
import { TotalUsersCard } from "@/components/admin/dashboard/total-users-card";
import { TransactionsCard } from "@/components/admin/dashboard/transactions-card";
import { SecurityStatusCard } from "@/components/admin/dashboard/security-status-card";
import { ProviderHealthCard } from "@/components/admin/dashboard/provider-health-card";
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
import { AttentionStrip } from "@/components/admin/dashboard/attention-strip";
import { useDashboard } from "@/lib/admin/hooks/use-dashboard";

export default function DashboardPage() {
  const { snapshot } = useDashboard();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Atlas operational overview"
      />

      <AttentionStrip items={snapshot.attention} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TotalRevenueCard />
        <TodayRevenueCard />
        <ActiveUsersCard />
        <TransactionsCard />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SecurityStatusCard />
        <ProviderHealthCard />
        <TotalUsersCard />
        <LiveStoresCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <RevenueChart />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <OrderStatusChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PendingRefundsCard />
        <SupportTicketsCard />
        <ServicePerformanceCard />
        <WalletBalanceCard />
      </div>

      <QuickActionsCard />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RevenueByPaymentMethodCard />
        <TopPerformersCard />
        <RecentEventsCard />
      </div>
    </div>
  );
}