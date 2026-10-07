/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentMerchant } from "./use-current-merchant";
import {
  getMerchantMoneyStoreVersion,
  getMerchantWalletState,
  isMerchantMoneyStoreLoaded,
  subscribeToMerchantMoneyStore,
} from "@/lib/domains/wallet/merchant-money/store";
import { ensureMerchantWallet } from "@/lib/domains/wallet/merchant-money/ensure";
import {
  projectWalletView,
  projectLedgerRows,
  projectAllLedgerRows,
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
  MerchantSavedPaymentMethod,
  MerchantWalletQuickStats,
  MerchantWalletView,
  MerchantWithdrawalHistoryEntry,
  RegisteredDestination,
} from "@/lib/domains/wallet/merchant-money/types";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

export interface UseCurrentMerchantWalletResult {
  wallet: MerchantWalletView | null;
  allRows: MerchantLedgerRow[];
  billingRows: MerchantLedgerRow[];
  mainRows: MerchantLedgerRow[];
  pendingWithdrawals: MerchantPendingWithdrawalRow[];
  withdrawalHistory: MerchantWithdrawalHistoryEntry[];
  quickStats: MerchantWalletQuickStats | null;
  billingSummary: MerchantBillingSummary | null;
  mainSummary: MerchantMainSummary | null;
  destination: RegisteredDestination | null;
  savedMethods: MerchantSavedPaymentMethod[];
  autoPay: MerchantAutoPayConfig | null;
  config: WalletAutoApproveConfig | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_RESULT: UseCurrentMerchantWalletResult = {
  wallet: null,
  allRows: [],
  billingRows: [],
  mainRows: [],
  pendingWithdrawals: [],
  withdrawalHistory: [],
  quickStats: null,
  billingSummary: null,
  mainSummary: null,
  destination: null,
  savedMethods: [],
  autoPay: null,
  config: null,
  loading: false,
  error: null,
};

function subscribe(onStoreChange: () => void): () => void {
  const a = subscribeToMerchantMoneyStore(onStoreChange);
  const b = subscribeToWalletConfig(onStoreChange);
  return () => {
    a();
    b();
  };
}

function snapshot(): number {
  const storeLoaded = isMerchantMoneyStoreLoaded();
  const configLoaded = isWalletConfigLoaded();
  if (!storeLoaded || !configLoaded) return -1;
  return getMerchantMoneyStoreVersion();
}

export function useCurrentMerchantWallet(): UseCurrentMerchantWalletResult {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();

  const version = useSyncExternalStore(subscribe, snapshot, () => -1);

  const value = useMemo(() => {
    if (!merchant) {
      return {
        ...EMPTY_RESULT,
        error: "No merchant session.",
      };
    }
    try {
      let state = getMerchantWalletState(merchant.id);
      if (!state) {
        state = ensureMerchantWallet(merchant.id, merchant.name);
      }
      const config = getWalletConfig();
      const effectiveNow = nowMs ?? Date.now();

      return {
        wallet: projectWalletView(state),
        allRows: projectAllLedgerRows(state),
        billingRows: projectLedgerRows(state, "billing"),
        mainRows: projectLedgerRows(state, "main"),
        pendingWithdrawals: projectPendingWithdrawals(state),
        withdrawalHistory: projectWithdrawalHistory(state),
        quickStats: projectQuickStats(state, effectiveNow),
        billingSummary: projectBillingSummary(
          state,
          state.autoPay.enabled,
          state.autoPay.source
        ),
        mainSummary: projectMainSummary(state),
        destination: state.destination,
        savedMethods: state.savedMethods,
        autoPay: state.autoPay,
        config,
        loading: false,
        error: null,
      };
    } catch (err) {
      return {
        ...EMPTY_RESULT,
        error: err instanceof Error ? err.message : "Failed to load wallet",
      };
    }
  }, [merchant, nowMs, version]);

  return {
    ...value,
    loading: !merchant || version < 0,
  };
}