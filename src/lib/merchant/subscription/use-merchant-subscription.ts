/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import {
  getSubscriptionStoreVersion,
  getSubscriptionForMerchant,
  isSubscriptionStoreLoaded,
  subscribeToSubscriptionStore,
  ensureMerchantSubscription,
} from "@/lib/merchant/subscription/store";
import {
  getPlanByCode,
  subscribeToPlanStore,
  isPlanStoreLoaded,
} from "@/lib/domains/subscriptions";
import {
  projectSubscriptionDisplayView,
  projectRenewalStatus,
  projectLifecycleSummary,
} from "@/lib/merchant/subscription/projection";
import type {
  MerchantSubscriptionState,
  RenewalStatusView,
  SubscriptionDisplayView,
} from "@/lib/merchant/subscription/types";

export interface UseMerchantSubscriptionResult {
  subscription: MerchantSubscriptionState | null;
  display: SubscriptionDisplayView | null;
  renewal: RenewalStatusView | null;
  lifecycleSummary: string;
  loading: boolean;
  error: string | null;
}

function subscribe(onChange: () => void): () => void {
  const a = subscribeToSubscriptionStore(onChange);
  const b = subscribeToPlanStore(onChange);
  return () => {
    a();
    b();
  };
}

function snapshot(): number {
  const storeLoaded = isSubscriptionStoreLoaded();
  const planLoaded = isPlanStoreLoaded();
  if (!storeLoaded || !planLoaded) return -1;
  return getSubscriptionStoreVersion();
}

export function useMerchantSubscription(): UseMerchantSubscriptionResult {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();

  const version = useSyncExternalStore(subscribe, snapshot, () => -1);

  const value = useMemo(() => {
    if (!merchant) {
      return {
        subscription: null,
        display: null,
        renewal: null,
        lifecycleSummary: "",
        loading: false,
        error: "No merchant session.",
      };
    }
    try {
      let subscription = getSubscriptionForMerchant(merchant.id);
      if (!subscription) {
        subscription = ensureMerchantSubscription(merchant.id);
      }
      const plan = getPlanByCode(subscription.planCode);
      const effectiveNow = nowMs ?? Date.now();

      return {
        subscription,
        display: projectSubscriptionDisplayView(subscription, plan),
        renewal: projectRenewalStatus(
          subscription,
          plan,
          effectiveNow
        ),
        lifecycleSummary: projectLifecycleSummary(
          subscription,
          effectiveNow
        ),
        loading: false,
        error: null,
      };
    } catch (err) {
      return {
        subscription: null,
        display: null,
        renewal: null,
        lifecycleSummary: "",
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to load subscription.",
      };
    }
  }, [merchant, nowMs, version]);

  return {
    ...value,
    loading: !merchant || version < 0,
  };
}