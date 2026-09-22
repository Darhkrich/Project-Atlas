/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentMerchant } from "./use-current-merchant";
import {
  getMerchantWalletState,
  isMerchantMoneyStoreLoaded,
  subscribeToMerchantMoneyStore,
} from "@/lib/domains/wallet/merchant-money/store";
import {
  projectWalletView,
  projectLedgerRows,
  projectPendingWithdrawals,
  projectWithdrawalHistory,
  projectQuickStats,
  projectBillingSummary,
  projectMainSummary,
} from "@/lib/domains/wallet/merchant-money/projection";
import {
  getWalletConfig,
  isWalletConfigLoaded,
  subscribeToWalletConfig,
} from "@/lib/domains/wallet/config-store";
import type {
  MerchantAutoPayConfig,
  MerchantBillingSummary,
  MerchantLedgerRow,
  MerchantMainSummary,
  MerchantPendingWithdrawalRow,
  MerchantWalletQuickStats,
  MerchantWalletView,
  MerchantWithdrawalHistoryEntry,
  RegisteredDestination,
} from "@/lib/domains/wallet/merchant-money/types";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

export interface UseCurrentMerchantWalletResult {
  wallet: MerchantWalletView | null;
  billingRows: MerchantLedgerRow[];
  mainRows: MerchantLedgerRow[];
  pendingWithdrawals: MerchantPendingWithdrawalRow[];
  withdrawalHistory: MerchantWithdrawalHistoryEntry[];
  quickStats: MerchantWalletQuickStats | null;
  billingSummary: MerchantBillingSummary | null;
  mainSummary: MerchantMainSummary | null;
  destination: RegisteredDestination | null;
  autoPay: MerchantAutoPayConfig | null;
  config: WalletAutoApproveConfig | null;
  loading: boolean;
  error: string | null;
}

function subscribe(onStoreChange: () => void): () => void {
  const a = subscribeToMerchantMoneyStore(onStoreChange);
  const b = subscribeToWalletConfig(onStoreChange);
  return () => {
    a();
    b();
  };
}

export function useCurrentMerchantWallet(): UseCurrentMerchantWalletResult {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const [, forceTick] = useState(0);

  useEffect(() => {
    forceTick(0);
  }, [merchant?.id]);

  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const storeLoaded = isMerchantMoneyStoreLoaded();
      const configLoaded = isWalletConfigLoaded();
      return storeLoaded && configLoaded ? 1 : 0;
    },
    () => 0
  );

  const value = useMemo(() => {
    if (!merchant) {
      return {
        wallet: null,
        billingRows: [] as MerchantLedgerRow[],
        mainRows: [] as MerchantLedgerRow[],
        pendingWithdrawals: [] as MerchantPendingWithdrawalRow[],
        withdrawalHistory: [] as MerchantWithdrawalHistoryEntry[],
        quickStats: null,
        billingSummary: null,
        mainSummary: null,
        destination: null,
        autoPay: null,
        config: null,
        error: "No merchant session.",
      };
    }
    try {
      const state = getMerchantWalletState(merchant.id);
      if (!state) {
        return {
          wallet: null,
          billingRows: [] as MerchantLedgerRow[],
          mainRows: [] as MerchantLedgerRow[],
          pendingWithdrawals: [] as MerchantPendingWithdrawalRow[],
          withdrawalHistory: [] as MerchantWithdrawalHistoryEntry[],
          quickStats: null,
          billingSummary: null,
          mainSummary: null,
          destination: null,
          autoPay: null,
          config: null,
          error: "Merchant wallet not found.",
        };
      }
      const config = getWalletConfig();
      const effectiveNow = nowMs ?? Date.now();

      const wallet = projectWalletView(state);
      const billingRows = projectLedgerRows(state, "billing");
      const mainRows = projectLedgerRows(state, "main");

      return {
        wallet,
        billingRows,
        mainRows,
        pendingWithdrawals: projectPendingWithdrawals(state),
        withdrawalHistory: projectWithdrawalHistory(state),
        quickStats: projectQuickStats(state, effectiveNow),
        billingSummary: projectBillingSummary(
          state,
          state.autoPay.enabled,
          state.autoPay.source,
          null,
          null
        ),
        mainSummary: projectMainSummary(state),
        destination: state.destination,
        autoPay: state.autoPay,
        config,
        error: null as string | null,
      };
    } catch (err) {
      return {
        wallet: null,
        billingRows: [] as MerchantLedgerRow[],
        mainRows: [] as MerchantLedgerRow[],
        pendingWithdrawals: [] as MerchantPendingWithdrawalRow[],
        withdrawalHistory: [] as MerchantWithdrawalHistoryEntry[],
        quickStats: null,
        billingSummary: null,
        mainSummary: null,
        destination: null,
        autoPay: null,
        config: null,
        error:
          err instanceof Error ? err.message : "Failed to load wallet",
      };
    }
  }, [merchant, nowMs, snapshot]);

  return {
    ...value,
    loading: !merchant || snapshot === 0,
  };
}