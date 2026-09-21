"use client";

import { useMemo } from "react";
import { useOrders, type CustomerOrder } from "@/contexts/orders-context";
import { useCurrentMerchant } from "./use-current-merchant";

export interface UseMerchantOrdersResult {
  orders: CustomerOrder[];
  loading: boolean;
}

/**
 * Merchant-scoped read of storefront orders. Filters the shared orders
 * context by the current merchant's storefront slug. Replaces the earlier
 * pattern of reading all customer orders and filtering inline.
 */
export function useMerchantOrders(): UseMerchantOrdersResult {
  const merchant = useCurrentMerchant();
  const { orders: allOrders } = useOrders();

  const orders = useMemo(() => {
    if (!merchant) return [] as CustomerOrder[];
    return allOrders
      .filter((o) => o.storeSlug === merchant.storeSlug)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [allOrders, merchant]);

  return {
    orders,
    loading: false,
  };
}