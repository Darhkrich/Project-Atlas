"use client";

import { useSyncExternalStore } from "react";
import {
  getOrders,
  subscribeToOrdersStore,
} from "@/lib/domains/orders/orders-store";
import type { Order } from "@/lib/admin/types/orders";
import type { ResellerOrderRow } from "./reseller-order-types";

export type { ResellerOrderRow } from "./reseller-order-types";

function toRow(order: Order): ResellerOrderRow | null {
  if (order.audience === "direct") return null;
  return {
    id: order.id,
    audience: order.audience,
    serviceId: order.serviceId,
    providerId: order.providerId,
    networkId: order.networkId,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    amount: order.amount,
    commission: order.commission,
    status: order.status,
    createdAt: order.createdAt,
    paymentMethodId: order.paymentMethodId,
  };
}

export function useResellerOrders(resellerId: string): ResellerOrderRow[] {
  const orders = useSyncExternalStore(
    subscribeToOrdersStore,
    getOrders,
    getOrders
  );
  return orders
    .filter((o) => o.resellerId === resellerId)
    .map(toRow)
    .filter((r): r is ResellerOrderRow => r !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}