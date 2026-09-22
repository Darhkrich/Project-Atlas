/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useResellers } from "./use-resellers";
import { useCommissions } from "./use-commissions";
import { useNow } from "./use-now";
import { buildCommissionTotalsMap } from "@/lib/admin/resellers/helpers";
import {
  getResellerWalletStore,
  isResellerWalletStoreLoaded,
  subscribeToResellerWalletStore,
} from "@/lib/reseller/mock/wallet-store";
import {
  getWalletConfig,
  isWalletConfigLoaded,
  subscribeToWalletConfig,
} from "@/lib/domains/wallet/config-store";
import {
  projectWalletsWithReasons,
  walletSummary,
} from "@/lib/admin/resellers/wallet-projection";
import type {
  ResellerCommissionConfig,
  ResellerCommissionWallet,
  WalletSummary,
} from "@/lib/admin/types/reseller-commission-wallet";

export interface UseResellerWalletsResult {
  wallets: ResellerCommissionWallet[];
  summary: WalletSummary;
  threshold: ResellerCommissionConfig;
  resellerCount: number;
  walletCount: number;
  loading: boolean;
  error: Error | null;
}

const EMPTY_SUMMARY: WalletSummary = {
  totalPending: 0,
  awaitingApproval: 0,
  overdrawnCount: 0,
  walletCount: 0,
  resellerCount: 0,
  feeRevenueTotal: 0,
  feeRevenueWithdrawalCount: 0,
  currency: "GHS",
};

const EMPTY_THRESHOLD: ResellerCommissionConfig = {
  withdrawalApprovalThreshold: 5000,
  withdrawalFeePercent: 0.5,
  updatedAt: new Date(0).toISOString(),
  updatedBy: "",
};

export function useResellerWallets(): UseResellerWalletsResult {
  const { resellers, loading: resellersLoading } = useResellers();
  const { commissions } = useCommissions();
  const nowMs = useNow();
  const [tick, setTick] = useState(0);
  const [configTick, setConfigTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    setLoaded(isResellerWalletStoreLoaded() && isWalletConfigLoaded());
    const unsubWallets = subscribeToResellerWalletStore(() =>
      setTick((x) => x + 1)
    );
    const unsubConfig = subscribeToWalletConfig(() =>
      setConfigTick((x) => x + 1)
    );
    return () => {
      unsubWallets();
      unsubConfig();
    };
  }, []);

  const commissionTotalsById = useMemo(
    () => buildCommissionTotalsMap(commissions),
    [commissions]
  );

  const value = useMemo(() => {
    const state = getResellerWalletStore();
    const walletConfig = getWalletConfig();
    const config: ResellerCommissionConfig = {
      withdrawalApprovalThreshold: walletConfig.thresholdGHS,
      withdrawalFeePercent: walletConfig.feeRatePercent,
      updatedAt: walletConfig.updatedAt,
      updatedBy: walletConfig.updatedBy,
    };

    const wallets = projectWalletsWithReasons(
      resellers,
      state,
      config,
      commissionTotalsById
    );

    return {
      wallets,
      summary: walletSummary(wallets, resellers.length),
      threshold: config,
      resellerCount: resellers.length,
      walletCount: wallets.length,
    };
  }, [tick, configTick, resellers, commissionTotalsById]);

  return {
    ...value,
    loading: !loaded || resellersLoading,
    error,
  };
}