/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { subscriptionPlans } from "@/config/subscription-plans";
import {
  projectAnalyticsSummary,
  projectCohorts,
  projectRevenueVelocity,
  projectSubscriptionHealth,
  projectVerification,
  type CohortPoint,
  type EcommerceAnalyticsSummary,
  type SubscriptionHealthRow,
  type VelocityRow,
  type VerificationRow,
} from "@/lib/admin/ecommerce/analytics-projection";

export interface UseEcommerceAnalyticsResult {
  summary: EcommerceAnalyticsSummary;
  cohorts: CohortPoint[];
  subscriptionHealth: SubscriptionHealthRow[];
  verification: VerificationRow[];
  velocity: VelocityRow[];
  loading: boolean;
}

export function useEcommerceAnalytics(): UseEcommerceAnalyticsResult {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(t);
  }, []);

  const value = useMemo(() => {
    const now = Date.now();
    return {
      summary: projectAnalyticsSummary(mockMerchants, now),
      cohorts: projectCohorts(mockMerchants),
      subscriptionHealth: projectSubscriptionHealth(
        mockMerchants,
        subscriptionPlans
      ),
      verification: projectVerification(mockMerchants),
      velocity: projectRevenueVelocity(mockMerchants, mockStorefronts, now),
    };
  }, []);

  return { ...value, loading };
}