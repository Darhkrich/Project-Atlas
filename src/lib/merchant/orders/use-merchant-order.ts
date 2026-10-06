"use client";

import { useMemo } from "react";
import type { CustomerOrder } from "@/contexts/orders-context";
import { projectOrderRow, timelineFromOrder } from "./projection";
import type { OrderRow, OrderTimelineItem } from "./types";

export interface UseMerchantOrderResult {
  order: CustomerOrder | null;
  row: OrderRow | null;
  timeline: OrderTimelineItem[];
}

export function useMerchantOrder(
  orders: CustomerOrder[],
  orderId: string | null | undefined
): UseMerchantOrderResult {
  return useMemo(() => {
    if (!orderId) {
      return { order: null, row: null, timeline: [] };
    }
    const found = orders.find((o) => o.id === orderId) ?? null;
    if (!found) {
      return { order: null, row: null, timeline: [] };
    }
    return {
      order: found,
      row: projectOrderRow(found),
      timeline: timelineFromOrder(found),
    };
  }, [orders, orderId]);
}