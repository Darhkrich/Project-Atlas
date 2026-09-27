/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  getStorefrontUserState,
  subscribeToStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
import { walletIdFor } from "@/lib/domains/wallet/storefront-user-types";
import type { StorefrontUserWalletRecord } from "@/lib/domains/wallet/storefront-user-types";

export interface UseStorefrontUserWalletResult {
  wallet: StorefrontUserWalletRecord | null;
  isLoading: boolean;
}

export function useStorefrontUserWallet(
  storefrontId: string | null,
  ownerId: string | null
): UseStorefrontUserWalletResult {
  const [wallet, setWallet] = useState<StorefrontUserWalletRecord | null>(
    () => {
      if (!storefrontId || !ownerId) return null;
      const id = walletIdFor(storefrontId, ownerId);
      return getStorefrontUserState().wallets[id] ?? null;
    }
  );
  const [isLoading, setIsLoading] = useState(
    storefrontId !== null && ownerId !== null
  );

  useEffect(() => {
    if (!storefrontId || !ownerId) {
      setWallet(null);
      setIsLoading(false);
      return;
    }
    const id = walletIdFor(storefrontId, ownerId);
    const sync = () => {
      setWallet(getStorefrontUserState().wallets[id] ?? null);
      setIsLoading(false);
    };
    const unsubscribe = subscribeToStorefrontUserState(sync);
    sync();
    return () => {
      unsubscribe();
    };
  }, [storefrontId, ownerId]);

  return { wallet, isLoading };
}