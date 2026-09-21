"use client";

import { useEffect, useMemo, useState } from "react";
import { useResellers } from "./use-resellers";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import {
  getStorefrontStatusSnapshot,
  subscribeToStorefrontStatus,
} from "@/lib/admin/mock/storefront-status-store";
import {
  projectResellerStorefronts,
  projectStorefrontSummary,
  type StorefrontRow,
  type StorefrontSummary,
} from "@/lib/admin/resellers/storefront-projection";

export interface UseResellerStorefrontsResult {
  rows: StorefrontRow[];
  summary: StorefrontSummary;
  loading: boolean;
}

export function useResellerStorefronts(): UseResellerStorefrontsResult {
  const { resellers, loading: resellersLoading } = useResellers();
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
    const rows = projectResellerStorefronts(
      mockStorefronts,
      resellers,
      snapshot
    );
    return {
      rows,
      summary: projectStorefrontSummary(rows, resellers.length),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, resellers]);

  return { ...value, loading: loading || resellersLoading };
}