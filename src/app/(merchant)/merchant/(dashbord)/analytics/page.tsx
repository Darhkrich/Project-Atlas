"use client";

import { useMemo } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useAnalyticsRange } from "@/lib/merchant/analytics/use-analytics-range";
import { useMerchantAnalytics } from "@/lib/merchant/analytics/use-merchant-analytics";
import { RANGE_DESCRIPTIONS } from "@/lib/merchant/analytics/labels";
import { AnalyticsRangeSwitcher } from "@/components/merchant/analytics/analytics-range-switcher";
import { AnalyticsKpiStrip } from "@/components/merchant/analytics/analytics-kpi-strip";
import { AnalyticsRevenueChart } from "@/components/merchant/analytics/analytics-revenue-chart";
import { AnalyticsOrdersChart } from "@/components/merchant/analytics/analytics-orders-chart";
import { AnalyticsTopProducts } from "@/components/merchant/analytics/analytics-top-products";
import { AnalyticsStatusBreakdown } from "@/components/merchant/analytics/analytics-status-breakdown";
import { AnalyticsActionQueue } from "@/components/merchant/analytics/analytics-action-queue";
import { AnalyticsEmptyState } from "@/components/merchant/analytics/analytics-empty-state";

export default function MerchantAnalyticsPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { getOrdersForStore } = useOrders();
  const { getCustomersForStore } = useStoreCustomers();
  const { getProductsForStore } = useStoreProducts();

  const storeSlug = storefrontConfig.slug || "my-store";

  const orders = useMemo(
    () => getOrdersForStore(storeSlug),
    [getOrdersForStore, storeSlug]
  );

  const customers = useMemo(
    () => getCustomersForStore(storeSlug),
    [getCustomersForStore, storeSlug]
  );

  const products = useMemo(
    () => getProductsForStore(storeSlug),
    [getProductsForStore, storeSlug]
  );

  const rangeApi = useAnalyticsRange();

  const snapshot = useMerchantAnalytics(
    storeSlug,
    orders,
    customers,
    products,
    rangeApi.range
  );

  const showEmpty =
    !snapshot.hasOrdersAtAll || !snapshot.hasOrdersInRange;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {RANGE_DESCRIPTIONS[rangeApi.range]}
          </p>
        </div>
        <AnalyticsRangeSwitcher
          active={rangeApi.range}
          onChange={rangeApi.setRange}
        />
      </div>

      {showEmpty && (
        <AnalyticsEmptyState
          variant={
            snapshot.hasOrdersAtAll
              ? "no-orders-in-range"
              : "never-had-orders"
          }
          storeSlug={storeSlug}
          onSwitchToDefaultRange={
            snapshot.hasOrdersAtAll
              ? () => rangeApi.setRange("30d")
              : undefined
          }
        />
      )}

      {!showEmpty && (
        <>
          <AnalyticsKpiStrip kpis={snapshot.kpis} range={rangeApi.range} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsRevenueChart series={snapshot.series} />
            <AnalyticsOrdersChart series={snapshot.series} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsTopProducts products={snapshot.topProducts} />
            <AnalyticsStatusBreakdown rows={snapshot.statusBreakdown} />
          </div>
        </>
      )}

      <AnalyticsActionQueue items={snapshot.actionQueue} />
    </div>
  );
}