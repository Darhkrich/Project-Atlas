/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentMerchant } from "./use-current-merchant";
import {
  getMerchantWalletStore,
  isMerchantWalletStoreLoaded,
  subscribeToMerchantWalletStore,
} from "@/lib/merchant/mock/wallet-store";
import {
  getMerchantDestinationStore,
  isMerchantDestinationStoreLoaded,
  subscribeToMerchantDestinationStore,
} from "@/lib/merchant/mock/destination-store";
import {
  getMerchantAutoPayStore,
  isMerchantAutoPayStoreLoaded,
  subscribeToMerchantAutoPayStore,
} from "@/lib/merchant/mock/auto-pay-store";
import {
  projectBillingSummary,
  projectLedgerRows,
  projectMainSummary,
  projectPendingWithdrawals,
  projectQuickStats,
  projectWalletView,
  projectWithdrawalHistory,
} from "@/lib/merchant/wallet/wallet-projection";
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
} from "@/lib/merchant/types/wallet";
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

export function useCurrentMerchantWallet(): UseCurrentMerchantWalletResult {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const [walletTick, setWalletTick] = useState(0);
  const [destinationTick, setDestinationTick] = useState(0);
  const [autoPayTick, setAutoPayTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const walletLoaded = isMerchantWalletStoreLoaded();
    const destinationLoaded = isMerchantDestinationStoreLoaded();
    const autoPayLoaded = isMerchantAutoPayStoreLoaded();
    setLoaded(walletLoaded && destinationLoaded && autoPayLoaded);

    const unsubWallet = subscribeToMerchantWalletStore(() =>
      setWalletTick((x) => x + 1)
    );
    const unsubDestination = subscribeToMerchantDestinationStore(() =>
      setDestinationTick((x) => x + 1)
    );
    const unsubAutoPay = subscribeToMerchantAutoPayStore(() =>
      setAutoPayTick((x) => x + 1)
    );
    return () => {
      unsubWallet();
      unsubDestination();
      unsubAutoPay();
    };
  }, []);

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
      const state = getMerchantWalletStore();
      const destination = getMerchantDestinationStore().destination;
      const autoPay = getMerchantAutoPayStore().config;
      const effectiveNow = nowMs ?? Date.now();

      return {
        wallet: projectWalletView(state),
        billingRows: projectLedgerRows(state, "billing"),
        mainRows: projectLedgerRows(state, "main"),
        pendingWithdrawals: projectPendingWithdrawals(state, effectiveNow),
        withdrawalHistory: projectWithdrawalHistory(state),
        quickStats: projectQuickStats(state, effectiveNow),
        billingSummary: projectBillingSummary(
          state,
          autoPay.enabled,
          autoPay.source
        ),
        mainSummary: projectMainSummary(state),
        destination,
        autoPay,
        config: state.config,
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
  }, [walletTick, destinationTick, autoPayTick, merchant, nowMs]);

  return {
    ...value,
    loading: !loaded,
  };
}