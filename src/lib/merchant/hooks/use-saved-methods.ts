/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentMerchant } from "./use-current-merchant";
import {
  getMerchantSavedMethodsFor,
  isMerchantSavedMethodsStoreLoaded,
  subscribeToMerchantSavedMethodsStore,
} from "@/lib/merchant/mock/saved-methods-store";
import type { MerchantSavedPaymentMethod } from "@/lib/merchant/types/wallet";

export interface UseSavedMethodsResult {
  savedMethods: MerchantSavedPaymentMethod[];
  loading: boolean;
}

export function useSavedMethods(): UseSavedMethodsResult {
  const merchant = useCurrentMerchant();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isMerchantSavedMethodsStoreLoaded());
    const unsub = subscribeToMerchantSavedMethodsStore(() =>
      setTick((x) => x + 1)
    );
    return unsub;
  }, []);

  const savedMethods = useMemo(() => {
    if (!merchant) return [] as MerchantSavedPaymentMethod[];
    void tick;
    return getMerchantSavedMethodsFor(merchant.id);
  }, [merchant, tick]);

  return {
    savedMethods,
    loading: !loaded,
  };
}