"use client";

import { useMemo } from "react";
import { useResellers } from "./use-resellers";
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

  const value = useMemo(
    () => ({
      summary: projectSummary(resellers),
      growth: projectGrowth(resellers),
      topResellers: projectTopResellers(resellers),
      commissionsByTier: projectCommissionsByTier(resellers),
      topPendingCommissions: projectTopPendingCommissions(resellers),
      recentActivity: projectRecentActivity(resellers),
    }),
    [resellers]
  );

  return { ...value, loading };
}