/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useResellers } from "./use-resellers";
import {
  getPromotions,
  subscribeToPromotionStore,
} from "@/lib/admin/mock/reseller-promotion-store";
import { getTiers } from "@/lib/admin/mock/reseller-tier-store";
import {
  projectPromotionSummary,
  sortPromotions,
  type PromotionSummary,
} from "@/lib/admin/resellers/promotion-projection";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import type { ResellerTier } from "@/lib/admin/types/commission";
import type { Reseller } from "@/lib/admin/types/reseller";

export interface UseResellerPromotionsResult {
  promotions: ResellerPromotion[];
  summary: PromotionSummary;
  tiers: ResellerTier[];
  resellers: Reseller[];
  loading: boolean;
}

export function useResellerPromotions(): UseResellerPromotionsResult {
  const { resellers, loading: resellersLoading } = useResellers();
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    const unsub = subscribeToPromotionStore(() => setTick((x) => x + 1));
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  const value = useMemo(() => {
    const promotions = sortPromotions(getPromotions(), Date.now());
    return {
      promotions,
      summary: projectPromotionSummary(promotions, Date.now()),
      tiers: getTiers(),
      resellers,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, resellers]);

  return { ...value, loading: loading || resellersLoading };
}