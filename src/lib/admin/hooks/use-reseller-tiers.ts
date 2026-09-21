"use client";

import { useEffect, useMemo, useState } from "react";
import { useResellers } from "./use-resellers";
import {
  getTiers,
  subscribeToTierStore,
} from "@/lib/admin/mock/reseller-tier-store";
import {
  projectTierCounts,
  projectTierSummary,
} from "@/lib/admin/resellers/tier-projection";
import type { ResellerTier } from "@/lib/admin/types/commission";

export interface UseResellerTiersResult {
  tiers: ResellerTier[];
  counts: Record<string, number>;
  summary: ReturnType<typeof projectTierSummary>;
  loading: boolean;
}

export function useResellerTiers(): UseResellerTiersResult {
  const { resellers, loading: resellersLoading } = useResellers();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeToTierStore(() => setTick((x) => x + 1));
    return () => unsub();
  }, []);

  const value = useMemo(() => {
    const tiers = getTiers();
    return {
      tiers,
      counts: projectTierCounts(tiers, resellers),
      summary: projectTierSummary(tiers, resellers),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, resellers]);

  return { ...value, loading: resellersLoading };
}