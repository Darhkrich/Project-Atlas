"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getStorefrontCustomerState,
  subscribeToStorefrontCustomerStore,
} from "./customer-store";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import type { ResellerOrderRow } from "@/lib/domains/orders/use-reseller-orders";

export interface ResellerCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  storefrontId?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
}

interface StorefrontCustomer {
  id: string;
  name: string;
  email: string; 
  phone: string;
  storefrontId?: string;
  createdAt: string;
}

export function useResellerCustomers(
  resellerId: string,
  orders: ResellerOrderRow[]
): ResellerCustomerRow[] {
  const state = useSyncExternalStore(
    subscribeToStorefrontCustomerStore,
    getStorefrontCustomerState,
    getStorefrontCustomerState
  );

  // Storefronts are static in the mock, so no subscription is needed.
  const storefrontIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const s of mockStorefronts) {
      if (s.type === "reseller" && s.ownerId === resellerId) {
        set.add(s.id);
      }
    }
    return set;
  }, [resellerId]);

  return useMemo(() => {
    const customers = (Object.values(state.customers) as StorefrontCustomer[]).filter(
      (c) => c.storefrontId !== undefined && storefrontIdSet.has(c.storefrontId)
    );

    return customers.map((c) => {
      // Phone-based join. The customer record and the order both carry the
      // phone number, which is unique per storefront user in the mock.
      const matching = orders.filter((o) => o.customerPhone === c.phone);
      const totalSpent = matching
        .filter((o) => o.status === "successful")
        .reduce((sum, o) => sum + o.amount, 0);
      const lastOrderAt = matching.length > 0 ? matching[0].createdAt : null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        storefrontId: c.storefrontId,
        orderCount: matching.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        lastOrderAt,
        createdAt: c.createdAt,
      };
    });
  }, [state, orders, storefrontIdSet]);
}