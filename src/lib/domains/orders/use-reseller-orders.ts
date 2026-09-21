"use client";

import { useSyncExternalStore } from "react";
import {
  getOrders,
  subscribeToOrdersStore,
} from "@/lib/admin/mock/orders-store";
import type { Order } from "@/lib/admin/types/orders";

export interface ResellerOrderRow {
  paymentMethodId: string;
  id: string;
  audience: "storefront_user" | "reseller";
  serviceId: string;
  providerId: string;
  networkId?: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  commission: number;
  status: Order["status"];
  createdAt: string;
}

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