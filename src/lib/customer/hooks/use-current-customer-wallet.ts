/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentCustomer } from "./use-current-customer";
import {
  getCustomerWalletStore,
  isCustomerWalletStoreLoaded,
  subscribeToCustomerWalletStore,
} from "@/lib/customer/mock/wallet-store";
import {
  getWalletConfig,
  isWalletConfigLoaded,
  subscribeToWalletConfig,
} from "@/lib/domains/wallet/config-store";
import {
  deriveRefundableSources,
  projectFundingRows,
  projectPendingRefunds,
  projectSummary,
  projectWallet,
  projectWithdrawalHistory,
  type FundingRow,
  type PendingRefundRow,
  type WalletView,
} from "@/lib/customer/wallet/wallet-projection";
import type {
  CustomerWalletSummary,
  CustomerWithdrawalHistoryEntry,
  RefundableSource,
} from "@/lib/customer/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

export interface UseCurrentCustomerWalletResult {
  wallet: WalletView | null;
  fundingRows: FundingRow[];
  pendingRefunds: PendingRefundRow[];
  withdrawalHistory: CustomerWithdrawalHistoryEntry[];
  refundableSources: RefundableSource[];
  summary: CustomerWalletSummary | null;
  config: WalletAutoApproveConfig | null;
  loading: boolean;
  error: Error | null;
}

export function useCurrentCustomerWallet(): UseCurrentCustomerWalletResult {
  const customer = useCurrentCustomer();
  const [tick, setTick] = useState(0);
  const [configTick, setConfigTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isCustomerWalletStoreLoaded() && isWalletConfigLoaded());
    const unsub = subscribeToCustomerWalletStore(() => setTick((x) => x + 1));
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
        fundingRows: [] as FundingRow[],
        pendingRefunds: [] as PendingRefundRow[],
        withdrawalHistory: [] as CustomerWithdrawalHistoryEntry[],
        refundableSources: [] as RefundableSource[],
        summary: null,
        config: null,
        error: new Error("No customer session."),
      };
    }
    try {
      const state = getCustomerWalletStore();
      return {
        wallet: projectWallet(state, customer.id),
        fundingRows: projectFundingRows(state, customer.id),
        pendingRefunds: projectPendingRefunds(state, customer.id),
        withdrawalHistory: projectWithdrawalHistory(state, customer.id),
        refundableSources: deriveRefundableSources(state, customer.id),
        summary: projectSummary(state, customer.id),
        config: getWalletConfig(),
        error: null as Error | null,
      };
    } catch (err) {
      return {
        wallet: null,
        fundingRows: [] as FundingRow[],
        pendingRefunds: [] as PendingRefundRow[],
        withdrawalHistory: [] as CustomerWithdrawalHistoryEntry[],
        refundableSources: [] as RefundableSource[],
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