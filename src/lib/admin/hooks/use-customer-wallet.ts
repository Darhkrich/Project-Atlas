/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  getCustomerWalletStore,
  subscribeToCustomerWalletStore,
} from "@/lib/customer/mock/wallet-store";
import type { CustomerWalletRecord } from "@/lib/customer/types/wallet";

export interface UseCustomerWalletResult {
  wallet: CustomerWalletRecord | null;
  isLoading: boolean;
}

export function useCustomerWallet(
  customerId: string | null
): UseCustomerWalletResult {
  const [wallet, setWallet] = useState<CustomerWalletRecord | null>(() => {
    if (!customerId) return null;
    const store = getCustomerWalletStore();
    return store.wallets["WAL-" + customerId] ?? null;
  });
  const [isLoading, setIsLoading] = useState(customerId !== null);

  useEffect(() => {
    if (!customerId) {
      setWallet(null);
      setIsLoading(false);
      return;
    }
    const sync = () => {
      const store = getCustomerWalletStore();
      setWallet(store.wallets["WAL-" + customerId] ?? null);
      setIsLoading(false);
    };
    const unsubscribe = subscribeToCustomerWalletStore(sync);
    sync();
    return () => {
      unsubscribe();
    };
  }, [customerId]);

  return { wallet, isLoading };
}