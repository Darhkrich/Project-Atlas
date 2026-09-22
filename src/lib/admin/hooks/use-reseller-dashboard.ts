"use client";

import { useMemo } from "react";
import { useResellers } from "./use-resellers";
import { useCommissions } from "./use-commissions";
import { buildCommissionTotalsMap } from "@/lib/admin/resellers/helpers";
import {
  projectCommissionsByTier,
  projectGrowth,
  projectRecentActivity,
  projectSummary,
  projectTopPendingCommissions,
  projectTopResellers,
} from "@/lib/admin/resellers/dashboard-projection";

export function useResellerDashboard() {
  const { resellers, loading } = useResellers();
  const { commissions } = useCommissions();

  const commissionTotalsById = useMemo(
    () => buildCommissionTotalsMap(commissions),
    [commissions]
  );

  const value = useMemo(
    () => ({
      summary: projectSummary(resellers, commissionTotalsById),
      growth: projectGrowth(resellers),
      topResellers: projectTopResellers(resellers, commissionTotalsById),
      commissionsByTier: projectCommissionsByTier(
        resellers,
        commissionTotalsById
      ),
      topPendingCommissions: projectTopPendingCommissions(
        resellers,
        commissionTotalsById
      ),
      recentActivity: projectRecentActivity(resellers),
    }),
    [resellers, commissionTotalsById]
  );

  return { ...value, loading };
}