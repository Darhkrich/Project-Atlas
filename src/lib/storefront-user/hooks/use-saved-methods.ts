/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentStorefrontCustomer } from "./use-current-storefront-customer";
import {
  getStorefrontSavedMethodsFor,
  isStorefrontSavedMethodsStoreLoaded,
  subscribeToStorefrontSavedMethodsStore,
} from "@/lib/storefront-user/mock/saved-methods-store";
import { walletIdFor } from "@/lib/storefront-user/types/wallet";
import type { StorefrontSavedPaymentMethod } from "@/lib/storefront-user/types/wallet";

export interface UseSavedMethodsResult {
  savedMethods: StorefrontSavedPaymentMethod[];
  loading: boolean;
}

export function useSavedMethods(): UseSavedMethodsResult {
  const customer = useCurrentStorefrontCustomer();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isStorefrontSavedMethodsStoreLoaded());
    const unsub = subscribeToStorefrontSavedMethodsStore(() =>
      setTick((x) => x + 1)
    );
    return unsub;
  }, []);

  const savedMethods = useMemo(() => {
    if (!customer) return [] as StorefrontSavedPaymentMethod[];
    void tick;
    const storefrontKey = customer.storefrontId || customer.resellerSlug;
    return getStorefrontSavedMethodsFor(
      walletIdFor(storefrontKey, customer.id)
    );
  }, [customer, tick]);

  return {
    savedMethods,
    loading: !loaded,
  };
}