/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStorefrontUserState,
  isStorefrontUserStateLoaded,
  subscribeToStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
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
  projectMergedWithdrawalCounts,
  projectMergedWithdrawalQueue,
} from "@/lib/admin/wallets/merged-withdrawal-projection";
import {
  projectWalletSummary,
  projectWalletFundingLedger,
} from "@/lib/admin/wallets/wallet-projection";
import { useNow } from "@/lib/shared/hooks/use-now";
import type {
  WalletAutoApproveConfig,
  WalletFundingLedgerRow,
  WalletSummary,
  WalletWithdrawalQueueRow,
} from "@/lib/admin/types/customer-wallet";
import type { StorefrontUserWalletRecord } from "@/lib/domains/wallet/storefront-user-types";

export interface UseWalletsResult {
  wallets: StorefrontUserWalletRecord[];
  config: WalletAutoApproveConfig | null;
  summary: WalletSummary;
  queueRows: WalletWithdrawalQueueRow[];
  ledgerRows: WalletFundingLedgerRow[];
  loading: boolean;
  error: Error | null;
}

const EMPTY_SUMMARY: WalletSummary = {
  walletCount: 0,
  atlasCustomerWalletCount: 0,
  resellerStorefrontWalletCount: 0,
  totalBalance: 0,
  balanceDelta: { current: 0, previous: 0, changePct: null, direction: "flat" },
  pendingWithdrawalsTotal: 0,
  pendingWithdrawalsCount: 0,
  pendingWithdrawalsDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  awaitingApprovalCount: 0,
  awaitingApprovalDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  overdueApprovalCount: 0,
  exceedingThresholdCount: 0,
  detailChangeCount: 0,
  storefrontUserAwaitingCount: 0,
  feeRevenueTotal: 0,
  feeRevenueWithdrawalCount: 0,
  feeRevenueDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  currency: "GHS",
};

export function useWallets(): UseWalletsResult {
  const nowMs = useNow();
  const [customerTick, setCustomerTick] = useState(0);
  const [storefrontTick, setStorefrontTick] = useState(0);
  const [configTick, setConfigTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    setLoaded(
      isCustomerWalletStoreLoaded() &&
        isStorefrontUserStateLoaded() &&
        isWalletConfigLoaded()
    );
    const unsubCustomer = subscribeToCustomerWalletStore(() =>
      setCustomerTick((x) => x + 1)
    );
    const unsubStorefront = subscribeToStorefrontUserState(() =>
      setStorefrontTick((x) => x + 1)
    );
    const unsubConfig = subscribeToWalletConfig(() =>
      setConfigTick((x) => x + 1)
    );
    return () => {
      unsubCustomer();
      unsubStorefront();
      unsubConfig();
    };
  }, []);

  const value = useMemo(() => {
    if (!loaded) {
      return {
        wallets: [] as StorefrontUserWalletRecord[],
        config: null as WalletAutoApproveConfig | null,
        summary: EMPTY_SUMMARY,
        queueRows: [] as WalletWithdrawalQueueRow[],
        ledgerRows: [] as WalletFundingLedgerRow[],
      };
    }

    const customerState = getCustomerWalletStore();
    const storefrontState = getStorefrontUserState();
    const config = getWalletConfig();
    const effectiveNowMs = nowMs ?? Date.now();

    const customerWallets = Object.values(customerState.wallets);
    const storefrontWallets = Object.values(storefrontState.wallets);

    const baseSummary = projectWalletSummary(
      customerWallets,
      customerState.fundingTransactions,
      storefrontWallets,
      storefrontState.fundingLedger,
      storefrontState.refundHistory,
      effectiveNowMs
    );

    const counts = projectMergedWithdrawalCounts(
      customerState,
      storefrontState,
      effectiveNowMs
    );

    const mergedSummary: WalletSummary = {
      ...baseSummary,
      awaitingApprovalCount: counts.awaitingApproval,
      storefrontUserAwaitingCount: counts.storefrontUserAwaiting,
      overdueApprovalCount: counts.overdueApproval,
      exceedingThresholdCount: counts.exceedingThreshold,
    };

    const queueRows = projectMergedWithdrawalQueue(
      customerState,
      storefrontState
    );

    const ledgerRows = projectWalletFundingLedger(
      storefrontWallets,
      storefrontState.fundingLedger,
      storefrontState.refundHistory
    );

    return {
      wallets: storefrontWallets,
      config,
      summary: mergedSummary,
      queueRows,
      ledgerRows,
    };
  }, [customerTick, storefrontTick, configTick, loaded, nowMs]);

  return {
    ...value,
    loading: !loaded,
    error,
  };
}