/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPromotions,
  subscribeToPromotionStore,
} from "@/lib/admin/mock/promotion-store";
import {
  getPromotions as getResellerBoosts,
  subscribeToPromotionStore as subscribeToResellerBoostStore,
} from "@/lib/admin/mock/reseller-promotion-store";
import {
  projectPromotionSummary,
  sortPromotions,
  type PromotionSummary,
} from "@/lib/admin/promotions/promotion-projection";
import type { Promotion } from "@/lib/admin/types/promotion";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";

export interface UsePromotionsResult {
  promotions: Promotion[];
  resellerBoosts: ResellerPromotion[];
  summary: PromotionSummary;
  loading: boolean;
}

export function usePromotions(): UsePromotionsResult {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    const unsubGeneral = subscribeToPromotionStore(() => setTick((x) => x + 1));
    const unsubReseller = subscribeToResellerBoostStore(() =>
      setTick((x) => x + 1)
    );
    return () => {
      window.clearTimeout(t);
      unsubGeneral();
      unsubReseller();
    };
  }, []);

  const value = useMemo(() => {
    const promotions = sortPromotions(getPromotions(), Date.now());
    const resellerBoosts = getResellerBoosts();
    return {
      promotions,
      resellerBoosts,
      summary: projectPromotionSummary(
        promotions,
        resellerBoosts.length,
        Date.now()
      ),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { ...value, loading };
}