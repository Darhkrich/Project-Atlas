"use client";

import { useEffect, useMemo, useState } from "react";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import { subscriptionPlans } from "@/config/subscription-plans";
import {
  projectEcommerceSummary,
  projectPlanDistribution,
  projectRecentActivity,
  projectRevenueByTemplate,
  projectTopMerchants,
  type EcommerceSummary,
  type PlanDistributionPoint,
  type RecentActivityItem,
  type TemplateRevenuePoint,
  type TopMerchantRow,
} from "@/lib/admin/ecommerce/dashboard-projection";

export interface UseEcommerceDashboardResult {
  summary: EcommerceSummary;
  planDistribution: PlanDistributionPoint[];
  topMerchants: TopMerchantRow[];
  revenueByTemplate: TemplateRevenuePoint[];
  recentActivity: RecentActivityItem[];
  loading: boolean;
}

export function useEcommerceDashboard(): UseEcommerceDashboardResult {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(t);
  }, []);

  const value = useMemo(
    () => ({
      summary: projectEcommerceSummary(mockMerchants, subscriptionPlans),
      planDistribution: projectPlanDistribution(
        mockMerchants,
        subscriptionPlans
      ),
      topMerchants: projectTopMerchants(
        mockMerchants,
        subscriptionPlans,
        5
      ),
      revenueByTemplate: projectRevenueByTemplate(mockMerchants),
      recentActivity: projectRecentActivity(mockMerchants, 10),
    }),
    []
  );

  return { ...value, loading };
}