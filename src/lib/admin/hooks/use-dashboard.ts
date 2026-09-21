/* eslint-disable react-hooks/purity */
// lib/admin/hooks/use-dashboard.ts
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { mockCustomers } from "@/lib/admin/mock/customers";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import {
  getMerchantMoneyState,
  subscribeToMerchantMoney,
} from "@/lib/admin/mock/merchant-money-store";
import {
  getResellerWalletStore,
  subscribeToResellerWalletStore,
} from "@/lib/reseller/mock/wallet-store";
import {
  computeDashboardSnapshot,
  type DashboardSnapshot,
} from "@/lib/admin/dashboard/dashboard-projection";
import { useNow } from "@/lib/shared/hooks/use-now";

export interface UseDashboardResult {
  snapshot: DashboardSnapshot;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const merchantMoney = useSyncExternalStore(
    subscribeToMerchantMoney,
    getMerchantMoneyState,
    getMerchantMoneyState
  );
  const resellerWalletState = useSyncExternalStore(
    subscribeToResellerWalletStore,
    getResellerWalletStore,
    getResellerWalletStore
  );
  const now = useNow();

  const snapshot = useMemo(
    () =>
      computeDashboardSnapshot({
        customers: mockCustomers,
        resellers: mockResellers,
        merchants: mockMerchants,
        merchantMoney,
        resellerWalletState,
        nowMs: now ?? Date.now(),
      }),
    [merchantMoney, resellerWalletState, now]
  );

  return {
    snapshot,
    loading: false,
    error: null,
    refetch: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("atlas-dashboard-refetch"));
      }
    },
  };
}