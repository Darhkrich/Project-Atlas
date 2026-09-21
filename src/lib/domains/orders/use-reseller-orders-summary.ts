"use client";

import { useMemo } from "react";
import type { ResellerOrderRow } from "./use-reseller-orders";

export interface ResellerOrdersSummary {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  successfulCount: number;
  failedCount: number;
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function useResellerOrdersSummary(
  orders: ResellerOrderRow[],
  nowMs: number
): ResellerOrdersSummary {
  return useMemo(() => {
    const dayStart = startOfUtcDay(nowMs);
    const dayEnd = dayStart + 86_400_000;

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    let successfulCount = 0;
    let failedCount = 0;

    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (t >= dayStart && t < dayEnd) todayOrders += 1;
      if (o.status === "successful") {
        totalRevenue += o.amount;
        successfulCount += 1;
        if (t >= dayStart && t < dayEnd) todayRevenue += o.amount;
      } else if (o.status === "failed") {
        failedCount += 1;
      }
    }

    return {
      totalOrders: orders.length,
      todayOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      successfulCount,
      failedCount,
    };
  }, [orders, nowMs]);
}