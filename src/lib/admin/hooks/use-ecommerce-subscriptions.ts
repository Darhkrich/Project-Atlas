/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useMerchants } from "./use-merchants";
import {
  getInvoicesForSubscription,
  subscribeToInvoiceStore,
} from "@/lib/admin/mock/invoice-store";
import {
  subscribeToPlanStore,
  liveSubscriptionPlans,
} from "@/lib/domains/subscriptions";
import {
  projectSubscriptionSummary,
  projectSubscriptions,
  sortSubscriptions,
  type SubscriptionSummary,
} from "@/lib/admin/ecommerce/subscription-projection";
import type {
  Invoice,
  MerchantSubscription,
} from "@/lib/admin/types/ecommerce";

export interface UseEcommerceSubscriptionsResult {
  subscriptions: MerchantSubscription[];
  summary: SubscriptionSummary;
  invoicesFor: (subscriptionId: string) => Invoice[];
  loading: boolean;
}

export function useEcommerceSubscriptions(): UseEcommerceSubscriptionsResult {
  const { merchants, loading: merchantsLoading } = useMerchants();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubInvoice = subscribeToInvoiceStore(() => setTick((x) => x + 1));
    const unsubPlans = subscribeToPlanStore(() => setTick((x) => x + 1));
    return () => {
      unsubInvoice();
      unsubPlans();
    };
  }, []);

  const value = useMemo(() => {
    const plans = liveSubscriptionPlans.slice();
    const projected = projectSubscriptions(merchants, plans);
    const subscriptions = sortSubscriptions(projected);
    return {
      subscriptions,
      summary: projectSubscriptionSummary(subscriptions, plans),
      invoicesFor: (subscriptionId: string) =>
        getInvoicesForSubscription(subscriptionId),
    };
  }, [merchants, tick]);

  return { ...value, loading: merchantsLoading };
}