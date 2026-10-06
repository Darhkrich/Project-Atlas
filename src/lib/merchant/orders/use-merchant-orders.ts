/* eslint-disable react-hooks/purity */
"use client";

import { useMemo } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { projectOrders } from "./projection";
import type { ProjectableOrder } from "./projection";
import type {
  OrderFilterState,
  OrderRow,
  OrderSummarySnapshot,
} from "./types";

export interface UseMerchantOrdersResult {
  rows: OrderRow[];
  summary: OrderSummarySnapshot;
  appliedFiltersActive: boolean;
  nowMs: number;
}

export function useMerchantOrders(
  orders: ProjectableOrder[],
  filters: OrderFilterState
): UseMerchantOrdersResult {
  const nowMsRaw = useNow();
  const nowMs = nowMsRaw ?? Date.now();

  return useMemo(() => {
    const projected = projectOrders({ orders, filters, nowMs });
    return {
      rows: projected.rows,
      summary: projected.summary,
      appliedFiltersActive: projected.appliedFiltersActive,
      nowMs,
    };
  }, [orders, filters, nowMs]);
}