/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPlans,
  isPlanStoreLoaded,
  subscribeToPlanStore,
} from "@/lib/domains/subscriptions";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";

export interface UseSubscriptionPlansResult {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: Error | null;
}

export function useSubscriptionPlans(): UseSubscriptionPlansResult {
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isPlanStoreLoaded());
    const unsub = subscribeToPlanStore(() => setTick((x) => x + 1));
    return () => unsub();
  }, []);

  const plans = useMemo(() => {
    void tick;
    return getPlans();
  }, [tick]);

  return { plans, loading: !loaded, error: null };
}