"use client";

import { useEffect, useState } from "react";
import {
  liveSubscriptionPlans,
  subscribeToPlanStore,
} from "@/lib/domains/subscriptions";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";

export interface UseOnboardingPlansResult {
  plans: SubscriptionPlan[];
  loading: boolean;
}

export function useOnboardingPlans(): UseOnboardingPlansResult {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setPlans([...liveSubscriptionPlans]);
      setLoading(false);
    };
    sync();
    const unsubscribe = subscribeToPlanStore(sync);
    return unsubscribe;
  }, []);

  return { plans, loading };
}