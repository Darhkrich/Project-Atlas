/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentStorefrontCustomer } from "./use-current-storefront-customer";
import {
  getStorefrontUserState,
  isStorefrontUserStateLoaded,
  subscribeToStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
import { ensureStorefrontWallet } from "@/lib/domains/wallet/storefront-user-wallet-mutations";
import {
  getWalletConfig,
  isWalletConfigLoaded,
  subscribeToWalletConfig,
} from "@/lib/domains/wallet/config-store";
import {
  deriveRefundableSources,
  projectLedgerRows,
  projectPendingRefunds,
  projectRefundHistory,
  projectSummary,
  projectWalletView,
} from "@/lib/storefront-user/wallet/wallet-projection";
import type {
  StorefrontLedgerRow,
  StorefrontPendingRefundRow,
  StorefrontRefundableSource,
  StorefrontRefundHistoryEntry,
  StorefrontUserWalletSummary,
  StorefrontUserWalletView,
} from "@/lib/domains/wallet/storefront-user-types";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

export interface UseCurrentStorefrontWalletResult {
  wallet: StorefrontUserWalletView | null;
  ledgerRows: StorefrontLedgerRow[];
  pendingRefunds: StorefrontPendingRefundRow[];
  refundHistory: StorefrontRefundHistoryEntry[];
  refundableSources: StorefrontRefundableSource[];
  summary: StorefrontUserWalletSummary | null;
  config: WalletAutoApproveConfig | null;
  loading: boolean;
  error: Error | null;
}

export function useCurrentStorefrontWallet(): UseCurrentStorefrontWalletResult {
  const customer = useCurrentStorefrontCustomer();
  const [tick, setTick] = useState(0);
  const [configTick, setConfigTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Ensure the wallet exists for a signed-in storefront customer. Effect,
  // not memo, so React does not run a store write during render.
  useEffect(() => {
    if (!customer) return;
    ensureStorefrontWallet({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      storefrontId: customer.storefrontId,
      resellerSlug: customer.resellerSlug,
      storefrontName: "",
    });
  }, [customer]);

  useEffect(() => {
    setLoaded(isStorefrontUserStateLoaded() && isWalletConfigLoaded());
    const unsub = subscribeToStorefrontUserState(() => setTick((x) => x + 1));
    const unsubConfig = subscribeToWalletConfig(() =>
      setConfigTick((x) => x + 1)
    );
    return () => {
      unsub();
      unsubConfig();
    };
  }, []);

  const value = useMemo(() => {
    if (!customer) {
      return {
        wallet: null,
        ledgerRows: [] as StorefrontLedgerRow[],
        pendingRefunds: [] as StorefrontPendingRefundRow[],
        refundHistory: [] as StorefrontRefundHistoryEntry[],
        refundableSources: [] as StorefrontRefundableSource[],
        summary: null,
        config: null,
        error: null as Error | null,
      };
    }
    try {
      const state = getStorefrontUserState();
      const walletId =
        "SW-" + customer.storefrontId + "-" + customer.id;
      const walletRecord = state.wallets[walletId];
      if (!walletRecord) {
        // First render before the effect creates the wallet. Return an
        // empty view so the page can render its loading state.
        return {
          wallet: null,
          ledgerRows: [] as StorefrontLedgerRow[],
          pendingRefunds: [] as StorefrontPendingRefundRow[],
          refundHistory: [] as StorefrontRefundHistoryEntry[],
          refundableSources: [] as StorefrontRefundableSource[],
          summary: null,
          config: getWalletConfig(),
          error: null as Error | null,
        };
      }
      const pendingRows = projectPendingRefunds(state, walletId);
      return {
        wallet: projectWalletView(walletRecord, pendingRows.length > 0),
        ledgerRows: projectLedgerRows(state, walletId),
        pendingRefunds: pendingRows,
        refundHistory: projectRefundHistory(state, walletId),
        refundableSources: deriveRefundableSources(state, walletId),
        summary: projectSummary(state, walletId),
        config: getWalletConfig(),
        error: null as Error | null,
      };
    } catch (err) {
      return {
        wallet: null,
        ledgerRows: [] as StorefrontLedgerRow[],
        pendingRefunds: [] as StorefrontPendingRefundRow[],
        refundHistory: [] as StorefrontRefundHistoryEntry[],
        refundableSources: [] as StorefrontRefundableSource[],
        summary: null,
        config: null,
        error: err instanceof Error ? err : new Error("Failed to load wallet"),
      };
    }
  }, [tick, configTick, customer]);

  return {
    ...value,
    loading: !loaded,
  };
}