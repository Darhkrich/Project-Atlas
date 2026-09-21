/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentReseller } from "./use-current-reseller";
import {
  getResellerSavedMethodsFor,
  isResellerSavedMethodsStoreLoaded,
  subscribeToResellerSavedMethodsStore,
} from "@/lib/reseller/mock/saved-methods-store";
import type { ResellerSavedPaymentMethod } from "@/lib/reseller/types/wallet";

export interface UseSavedMethodsResult {
  savedMethods: ResellerSavedPaymentMethod[];
  loading: boolean;
}

export function useSavedMethods(): UseSavedMethodsResult {
  const reseller = useCurrentReseller();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isResellerSavedMethodsStoreLoaded());
    const unsub = subscribeToResellerSavedMethodsStore(() =>
      setTick((x) => x + 1)
    );
    return unsub;
  }, []);

  const savedMethods = useMemo(() => {
    if (!reseller) return [] as ResellerSavedPaymentMethod[];
    void tick;
    return getResellerSavedMethodsFor(reseller.id);
  }, [reseller, tick]);

  return {
    savedMethods,
    loading: !loaded,
  };
}