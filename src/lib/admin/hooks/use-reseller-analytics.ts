"use client";

import { useMemo } from "react";
import { useResellers } from "./use-resellers";
import {
  projectAnalyticsSummary,
  projectByVerification,
  projectRevenueByReseller,
  projectRevenueByTier,
} from "@/lib/admin/resellers/analytics-projection";

export function useResellerAnalytics(topN: number) {
  const { resellers, loading } = useResellers();

  const value = useMemo(
    () => ({
      summary: projectAnalyticsSummary(resellers),
      revenueByReseller: projectRevenueByReseller(resellers, topN),
      revenueByTier: projectRevenueByTier(resellers),
      byVerification: projectByVerification(resellers),
    }),
    [resellers, topN]
  );

  return { ...value, loading };
}