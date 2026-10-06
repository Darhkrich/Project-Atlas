"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CustomerOrder } from "@/contexts/orders-context";
import type { StoreCustomer } from "@/contexts/store-customers-context";
import {
  getActiveReportForCustomer,
  getReportsForStore,
  subscribeToReports,
  isReportsStoreLoaded,
} from "./report-store";
import { projectCustomerView } from "./projection";
import type { CustomerReport, MerchantCustomerView } from "./types";

export interface UseMerchantCustomerResult {
  customer: StoreCustomer | null;
  view: MerchantCustomerView | null;
  activeReport: CustomerReport | null;
  reports: CustomerReport[];
}

export function useMerchantCustomer(
  storeSlug: string,
  customers: StoreCustomer[],
  orders: CustomerOrder[],
  customerId: string | null | undefined
): UseMerchantCustomerResult {
  const reportsVersion = useSyncExternalStore(
    subscribeToReports,
    () => (isReportsStoreLoaded() ? 1 : 0),
    () => 0
  );

  return useMemo(() => {
    void reportsVersion;
    if (!customerId) {
      return { customer: null, view: null, activeReport: null, reports: [] };
    }

    const customer =
      customers.find((c) => c.id === customerId) ?? null;

    if (!customer) {
      const fallback = orders.find(
        (o) =>
          o.customerEmail === customerId ||
          o.customerEmail.toLowerCase() === customerId.toLowerCase()
      );
      if (!fallback) {
        return {
          customer: null,
          view: null,
          activeReport: null,
          reports: [],
        };
      }
      const synthetic: StoreCustomer = {
          id: "order-derived-" + fallback.customerEmail,
          storeSlug: fallback.storeSlug,
          name: fallback.customerName || fallback.customerEmail,
          email: fallback.customerEmail,
          phone: fallback.customerPhone || "",
          address: fallback.shippingAddress?.address,
          city: fallback.shippingAddress?.city,
          region: fallback.shippingAddress?.region,
          status: "Active",
          createdAt: fallback.createdAt,
          updatedAt: 0
      };
      const activeReport = getActiveReportForCustomer(
        storeSlug,
        synthetic.id,
        synthetic.email
      );
      return {
        customer: synthetic,
        view: projectCustomerView(synthetic, orders, activeReport),
        activeReport,
        reports: getReportsForStore(storeSlug),
      };
    }

    const activeReport = getActiveReportForCustomer(
      storeSlug,
      customer.id,
      customer.email
    );

    return {
      customer,
      view: projectCustomerView(customer, orders, activeReport),
      activeReport,
      reports: getReportsForStore(storeSlug),
    };
  }, [storeSlug, customers, orders, customerId, reportsVersion]);
}