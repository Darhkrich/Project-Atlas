/* eslint-disable react-hooks/purity */
"use client";

import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentReseller } from "./use-current-reseller";
import { useCurrentResellerWallet } from "./use-current-reseller-wallet";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import { useResellerOrdersSummary } from "@/lib/domains/orders/use-reseller-orders-summary";
import { useResellerCustomers } from "@/lib/domains/storefront/use-reseller-customers";

export function useResellerOverview() {
  const reseller = useCurrentReseller();
  const nowMs = useNow();
  const wallet = useCurrentResellerWallet();
  const orders = useResellerOrders(reseller?.id ?? "");
  const customers = useResellerCustomers(reseller?.id ?? "", orders);

  const effectiveNowMs = nowMs ?? Date.now();
  const ordersSummary = useResellerOrdersSummary(orders, effectiveNowMs);

  return {
    reseller,
    orders,
    ordersSummary,
    customers,
    wallet,
    nowMs,
    loading: wallet.loading || reseller === null,
  };
}