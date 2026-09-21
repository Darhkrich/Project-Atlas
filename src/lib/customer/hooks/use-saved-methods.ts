/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentCustomer } from "./use-current-customer";
import {
  getSavedMethodsFor,
  isSavedMethodsStoreLoaded,
  subscribeToSavedMethodsStore,
} from "@/lib/customer/mock/saved-methods-store";
import type { CustomerSavedPaymentMethod } from "@/lib/customer/types/wallet";

export interface UseSavedMethodsResult {
  savedMethods: CustomerSavedPaymentMethod[];
  loading: boolean;
}

export function useSavedMethods(): UseSavedMethodsResult {
  const customer = useCurrentCustomer();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isSavedMethodsStoreLoaded());
    const unsub = subscribeToSavedMethodsStore(() => setTick((x) => x + 1));
    return unsub;
  }, []);

  const savedMethods = useMemo(() => {
    if (!customer) return [] as CustomerSavedPaymentMethod[];
    void tick;
    return getSavedMethodsFor(customer.id);
  }, [customer, tick]);

  return {
    savedMethods,
    loading: !loaded,
  };
}