"use client";

import { useMemo } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import { readNextTier, readTier } from "./tier-bridge";
import type { ResellerTierView } from "./types";

function startOfUtcMonth(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

export function useResellerTier(): ResellerTierView | null {
  const reseller = useCurrentReseller();
  const nowMs = useNow();
  const orders = useResellerOrders(reseller?.id ?? "");

  return useMemo(() => {
    if (!reseller || nowMs === null) return null;
    if (!reseller.tierId) return null;

    const tier = readTier(reseller.tierId);
    if (!tier) return null;

    const monthStart = startOfUtcMonth(nowMs);
    let monthToDateSales = 0;
    for (const o of orders) {
      if (o.status !== "successful") continue;
      const t = new Date(o.createdAt).getTime();
      if (Number.isNaN(t)) continue;
      if (t >= monthStart && t <= nowMs) monthToDateSales += o.amount;
    }
    monthToDateSales = Math.round(monthToDateSales * 100) / 100;

    const currentRate = tier.baseCommissionRates.airtime;
    const nextTier = readNextTier(reseller.tierId);

    if (!nextTier) {
      return {
        currentTierName: tier.name,
        currentTierRate: currentRate,
        currentExtraCutPercent: tier.extraCutPercent,
        nextTierName: null,
        nextTierRate: null,
        nextExtraCutPercent: null,
        nextTierPerks: [],
        metricLabel: "in sales",
        currentValue: monthToDateSales,
        thresholdValue: tier.minMonthlySales,
        progressPercent: 100,
      };
    }

    const span = nextTier.minMonthlySales - tier.minMonthlySales;
    const rawProgress =
      span <= 0
        ? 100
        : ((monthToDateSales - tier.minMonthlySales) / span) * 100;
    const progressPercent = Math.round(
      Math.min(100, Math.max(0, rawProgress))
    );

    return {
      currentTierName: tier.name,
      currentTierRate: currentRate,
      currentExtraCutPercent: tier.extraCutPercent,
      nextTierName: nextTier.name,
      nextTierRate: nextTier.baseCommissionRates.airtime,
      nextExtraCutPercent: nextTier.extraCutPercent,
      nextTierPerks: nextTier.perks,
      metricLabel: "in sales",
      currentValue: monthToDateSales,
      thresholdValue: nextTier.minMonthlySales,
      progressPercent,
    };
  }, [reseller, orders, nowMs]);
}