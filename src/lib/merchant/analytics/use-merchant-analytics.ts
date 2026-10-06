/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import type { CustomerOrder } from "@/contexts/orders-context";
import type { StoreCustomer } from "@/contexts/store-customers-context";
import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import type { CustomerReport } from "@/lib/merchant/customers/types";
import {
  getReportsForStore,
  subscribeToReports,
  isReportsStoreLoaded,
} from "@/lib/merchant/customers/report-store";
import { projectMerchantAnalytics } from "./projection";
import type { AnalyticsRange, AnalyticsSnapshot } from "./types";

export function useMerchantAnalytics(
  storeSlug: string,
  orders: CustomerOrder[],
  customers: StoreCustomer[],
  products: MerchantStorefrontProduct[],
  range: AnalyticsRange
): AnalyticsSnapshot {
  const nowMsRaw = useNow();
  const nowMs = nowMsRaw ?? Date.now();

  const reportsVersion = useSyncExternalStore(
    subscribeToReports,
    () => (isReportsStoreLoaded() ? 1 : 0),
    () => 0
  );

  const activeReports: CustomerReport[] = useMemo(() => {
    void reportsVersion;
    return getReportsForStore(storeSlug).filter(
      (r) => r.status === "submitted"
    );
  }, [storeSlug, reportsVersion]);

  return useMemo(
    () =>
      projectMerchantAnalytics({
        orders,
        customers,
        products,
        activeReports,
        range,
        nowMs,
      }),
    [orders, customers, products, activeReports, range, nowMs]
  );
}