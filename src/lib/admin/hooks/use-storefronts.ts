"use client";

import { useEffect, useMemo, useState } from "react";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import {
  getStorefrontStatusSnapshot,
  subscribeToStorefrontStatus,
} from "@/lib/admin/mock/storefront-status-store";
import {
  projectAllStorefronts,
  projectStorefrontSummary,
  type StorefrontSummary,
} from "@/lib/admin/storefronts/storefront-projection";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";

export interface UseStorefrontsResult {
  storefronts: UnifiedStorefront[];
  summary: StorefrontSummary;
  loading: boolean;
}

export function useStorefronts(): UseStorefrontsResult {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    const unsub = subscribeToStorefrontStatus(() => setTick((x) => x + 1));
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  const value = useMemo(() => {
    const snapshot = getStorefrontStatusSnapshot();
    const storefronts = projectAllStorefronts(mockStorefronts, snapshot);
    return {
      storefronts,
      summary: projectStorefrontSummary(storefronts),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { ...value, loading };
}