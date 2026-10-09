"use client";

import { useState } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { useStorefront } from "@/contexts/storefront-context";
import { useResellerOverviewData } from "@/lib/reseller/overview/use-reseller-overview-data";
import { useResellerTier } from "@/lib/reseller/overview/use-reseller-tier";
import { OVERVIEW_COPY } from "@/lib/reseller/overview/labels";
import { StorefrontPurchaseFlow } from "@/components/reseller/storefront/storefront-purchase-flow";
import { GreetingRibbon } from "@/components/reseller/overview/greeting-ribbon";
import { TierBanner } from "@/components/reseller/overview/tier-banner";
import { WalletRow } from "@/components/reseller/overview/wallet-row";
import { TodayStorefrontCard } from "@/components/reseller/overview/today-storefront-card";
import { ActionQueue } from "@/components/reseller/overview/action-queue";
import { RecentOrdersCard } from "@/components/reseller/overview/recent-orders-card";
import { QuickSellStrip } from "@/components/reseller/overview/quick-sell-strip";
import { TopServicesCard } from "@/components/reseller/overview/top-services-card";
import { OverviewEmptyState } from "@/components/reseller/overview/overview-empty-state";

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <AtlasSkeleton className="h-16 w-1/2" />
      <div className="grid gap-6 lg:grid-cols-3">
        <AtlasSkeleton className="h-48 w-full lg:col-span-2" />
        <AtlasSkeleton className="h-48 w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <AtlasSkeleton className="h-56 w-full" />
        <AtlasSkeleton className="h-56 w-full" />
        <AtlasSkeleton className="h-56 w-full" />
      </div>
      <AtlasSkeleton className="h-40 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <AtlasSkeleton className="h-64 w-full lg:col-span-2" />
        <AtlasSkeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function OverviewError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-950/30">
      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
        We could not load your dashboard
      </p>
      <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
        {message}
      </p>
    </div>
  );
}

export function ResellerOverview() {
  const { data, loading, error } = useResellerOverviewData();
  const { config } = useStorefront();
  const tier = useResellerTier();
  const [quickSellService, setQuickSellService] = useState<string | null>(null);

  if (loading) return <OverviewSkeleton />;
  if (error) return <OverviewError message={error.message} />;
  if (!data) return null;

  const subtitle =
    data.actionQueue.length > 0
      ? OVERVIEW_COPY.subtitleWithWork
      : OVERVIEW_COPY.subtitleQuiet;

  const pendingWithdrawalsCount = data.actionQueue.filter(
    (i) => i.kind === "pending_withdrawals"
  ).length;

  const hasTierOrActions = tier !== null || data.actionQueue.length > 0;

  return (
    <div className="space-y-6">
      <GreetingRibbon reseller={data.reseller} subtitle={subtitle} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WalletRow
            balance={data.today.walletBalance}
            revenueToday={data.today.revenueToday}
            ordersToday={data.today.ordersToday}
            commissionsThisMonth={data.today.commissionsThisMonth}
            pendingWithdrawalsCount={pendingWithdrawalsCount}
          />
        </div>
        <TodayStorefrontCard
          ordersToday={data.today.ordersToday}
          health={data.storefrontHealth}
        />
      </div>

      {hasTierOrActions ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <TierBanner tier={tier} />
          <ActionQueue items={data.actionQueue} />
        </div>
      ) : null}

      {!data.hasOrders ? (
        <>
          <OverviewEmptyState />
          <QuickSellStrip onSelect={setQuickSellService} />
        </>
      ) : (
        <>
          <QuickSellStrip onSelect={setQuickSellService} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentOrdersCard orders={data.recentOrders} />
            </div>
            <div>
              <TopServicesCard services={data.topServices} />
            </div>
          </div>
        </>
      )}

      {quickSellService ? (
        <StorefrontPurchaseFlow
          serviceId={quickSellService}
          config={config}
          resellerMode
          onClose={() => setQuickSellService(null)}
          onComplete={() => setQuickSellService(null)}
        />
      ) : null}
    </div>
  );
}