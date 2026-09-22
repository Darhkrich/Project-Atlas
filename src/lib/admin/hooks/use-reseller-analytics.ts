"use client";

import { useMemo } from "react";
import { useResellers } from "./use-resellers";
import { useCommissions } from "./use-commissions";
import { buildCommissionTotalsMap } from "@/lib/admin/resellers/helpers";
import {
  projectAnalyticsSummary,
  projectByVerification,
  projectRevenueByReseller,
  projectRevenueByTier,
} from "@/lib/admin/resellers/analytics-projection";

export function useResellerAnalytics(topN: number) {
  const { resellers, loading } = useResellers();
  const { commissions } = useCommissions();

  const commissionTotalsById = useMemo(
    () => buildCommissionTotalsMap(commissions),
    [commissions]
  );

  const value = useMemo(
    () => ({
      summary: projectAnalyticsSummary(resellers, commissionTotalsById),
      revenueByReseller: projectRevenueByReseller(
        resellers,
        topN,
        commissionTotalsById
      ),
      revenueByTier: projectRevenueByTier(resellers),
      byVerification: projectByVerification(resellers),
    }),
    [resellers, topN, commissionTotalsById]
  );

  return { ...value, loading };
}