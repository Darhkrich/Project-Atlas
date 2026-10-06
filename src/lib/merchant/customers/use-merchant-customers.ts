/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import type { CustomerOrder } from "@/contexts/orders-context";
import type { StoreCustomer } from "@/contexts/store-customers-context";
import {
  getReportsForStore,
  subscribeToReports,
  isReportsStoreLoaded,
} from "./report-store";
import { projectCustomers } from "./projection";
import type {
  CustomerFilterState,
  CustomerReport,
  CustomerSummarySnapshot,
  MerchantCustomerView,
} from "./types";

export interface UseMerchantCustomersResult {
  rows: MerchantCustomerView[];
  summary: CustomerSummarySnapshot;
  appliedFiltersActive: boolean;
  nowMs: number;
}

export function useMerchantCustomers(
  storeSlug: string,
  customers: StoreCustomer[],
  orders: CustomerOrder[],
  filters: CustomerFilterState
): UseMerchantCustomersResult {
  const nowMsRaw = useNow();
  const nowMs = nowMsRaw ?? Date.now();

  const reportsVersion = useSyncExternalStore(
    subscribeToReports,
    () => (isReportsStoreLoaded() ? 1 : 0),
    () => 0
  );

  const reports: CustomerReport[] = useMemo(() => {
    void reportsVersion;
    return getReportsForStore(storeSlug);
  }, [storeSlug, reportsVersion]);

  const projectableCustomers = useMemo(
    () =>
      customers.map((c) => ({
        id: c.id,
        storeSlug: c.storeSlug,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        region: c.region,
        status: c.status,
        createdAt: c.createdAt,
      })),
    [customers]
  );

  return useMemo(() => {
    const projected = projectCustomers({
      customers: projectableCustomers,
      orders,
      reports,
      filters,
      nowMs,
    });
    return {
      rows: projected.rows,
      summary: projected.summary,
      appliedFiltersActive: projected.appliedFiltersActive,
      nowMs,
    };
  }, [projectableCustomers, orders, reports, filters, nowMs]);
}