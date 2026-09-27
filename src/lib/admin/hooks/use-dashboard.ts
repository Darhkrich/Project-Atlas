/* eslint-disable react-hooks/purity */
// lib/admin/hooks/use-dashboard.ts
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { mockCustomers } from "@/lib/admin/mock/customers";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import {
  getMerchantMoneyState as getMerchantMoneyOverlayState,
  subscribeToMerchantMoney as subscribeToMerchantMoneyOverlay,
} from "@/lib/admin/mock/merchant-money-store";
import {
  getMerchantMoneyStoreState,
  subscribeToMerchantMoneyStore,
} from "@/lib/domains/wallet/merchant-money/store";
import {
  getResellerWalletStore,
  subscribeToResellerWalletStore,
} from "@/lib/reseller/mock/wallet-store";
import {
  computeDashboardSnapshot,
  type DashboardSnapshot,
  type MerchantMoneyOverlayInput,
} from "@/lib/admin/dashboard/dashboard-projection";
import {
  buildDashboardSlices,
  type DashboardSlices,
} from "@/lib/admin/dashboard/dashboard-slices";
import { useOrders } from "./use-orders";
import { useRefunds } from "./use-refunds";
import { useCatalog } from "./use-catalog";
import { useProviders } from "./use-providers";
import { useAuditEntries } from "./use-audit-entries";
import { useNow } from "@/lib/shared/hooks/use-now";

export interface UseDashboardResult {
  snapshot: DashboardSnapshot;
  slices: DashboardSlices;
  loading: boolean;
  error: string | null;
}

export function useDashboard(): UseDashboardResult {
  const merchantMoneyStore = useSyncExternalStore(
    subscribeToMerchantMoneyStore,
    getMerchantMoneyStoreState,
    getMerchantMoneyStoreState
  );
  const merchantOverlayRaw = useSyncExternalStore(
    subscribeToMerchantMoneyOverlay,
    getMerchantMoneyOverlayState,
    getMerchantMoneyOverlayState
  );
  const resellerWalletState = useSyncExternalStore(
    subscribeToResellerWalletStore,
    getResellerWalletStore,
    getResellerWalletStore
  );
  const { orders, isLoading: ordersLoading } = useOrders();
  const { refunds, isLoading: refundsLoading, treasury } = useRefunds();
  const { categories: catalog, loading: catalogLoading } = useCatalog();
  const { providers, loading: providersLoading } = useProviders();
  const audit = useAuditEntries();
  const now = useNow();

  const loading =
    ordersLoading ||
    refundsLoading ||
    catalogLoading ||
    providersLoading ||
    now === null;

  const snapshot = useMemo(() => {
    const merchantOverlay: MerchantMoneyOverlayInput = {
      walletTransactions: merchantOverlayRaw.walletTransactions,
      disputes: merchantOverlayRaw.disputes,
      dunning: merchantOverlayRaw.dunning,
    };
    return computeDashboardSnapshot({
      customers: mockCustomers,
      resellers: mockResellers,
      merchants: mockMerchants,
      merchantMoneyStore,
      merchantOverlay,
      resellerWalletState,
      orders,
      refunds,
      supportTickets: [],
      providers,
      catalog,
      treasuryFreeCash: treasury?.balance ?? null,
      treasuryLiabilities: null,
      nowMs: now ?? 0,
    });
  }, [
    merchantMoneyStore,
    merchantOverlayRaw,
    resellerWalletState,
    orders,
    refunds,
    providers,
    catalog,
    treasury,
    now,
  ]);

  const slices = useMemo(() => {
    return buildDashboardSlices({
      orders,
      refunds,
      resellers: mockResellers,
      merchants: mockMerchants.map((m) => ({
        id: m.id,
        businessName: m.businessName,
      })),
      providers,
      catalog,
      audit,
      merchantMoneyStore,
      resellerWalletState,
      nowMs: now ?? 0,
    });
  }, [
    orders,
    refunds,
    providers,
    catalog,
    audit,
    merchantMoneyStore,
    resellerWalletState,
    now,
  ]);

  return {
    snapshot,
    slices,
    loading,
    error: null,
  };
}