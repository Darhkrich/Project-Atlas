"use client";

import { useMerchantDashboard } from "@/lib/merchant/dashboard/use-merchant-dashboard";
import { storefrontUrlFor } from "@/lib/merchant/storefront-url";
import { GreetingRibbon } from "@/components/merchant/dashboard/greeting-ribbon";
import { TodayStrip } from "@/components/merchant/dashboard/today-strip";
import { ActionQueue } from "@/components/merchant/dashboard/action-queue";
import { WalletRow } from "@/components/merchant/dashboard/wallet-row";
import { StorefrontHealthStrip } from "@/components/merchant/dashboard/storefront-health-strip";
import { RecentOrdersCard } from "@/components/merchant/dashboard/recent-orders-card";

export default function MerchantDashboardPage() {
  const dashboard = useMerchantDashboard();
  const storeUrl = storefrontUrlFor(dashboard.store);
  const storeIsLive = dashboard.store.status === "live";

  return (
    <div className="space-y-6">
      <GreetingRibbon
        store={dashboard.store}
        storeUrl={storeUrl}
        canSeed={dashboard.hasNoOrders}
      />

      <TodayStrip
        orderCount={dashboard.today.orderCount}
        salesTotal={dashboard.today.salesTotal}
        actions={dashboard.actions}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <ActionQueue
            actions={dashboard.actions}
            isOnboarding={dashboard.isEmpty}
          />
        </div>

        <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1">
          <WalletRow
            wallet={dashboard.wallet}
            storeIsLive={storeIsLive}
          />
        </div>

        <div className="lg:col-span-1 lg:col-start-3 lg:row-start-2">
          <StorefrontHealthStrip storefront={dashboard.storefront} />
        </div>

        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <RecentOrdersCard
            orders={dashboard.recentOrders}
            isDraft={dashboard.store.status === "draft"}
          />
        </div>
      </div>
    </div>
  );
}