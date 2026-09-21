/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentReseller } from "./use-current-reseller";
import {
  getResellerWalletStore,
  internalEnsureResellerWallet,
  isResellerWalletStoreLoaded,
  subscribeToResellerWalletStore,
} from "@/lib/reseller/mock/wallet-store";
import {
  getDestinationFor,
  isDestinationStoreLoaded,
  subscribeToDestinationStore,
} from "@/lib/reseller/mock/wallet-destination-store";
import {
  deriveRefundableSources,
  projectCommissionsSummary,
  projectLedger,
  projectPendingWithdrawals,
  projectSummary,
  projectWallet,
  projectWithdrawalHistory,
  type ResellerLedgerRow,
  type ResellerPendingWithdrawalRow,
  type ResellerWalletView,
} from "@/lib/reseller/wallet/wallet-projection";
import type {
  RegisteredDestination,
  ResellerCommissionsSummary,
  ResellerRefundableSource,
  ResellerWalletSummary,
  ResellerWithdrawalHistoryEntry,
} from "@/lib/reseller/types/wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import {
  getWalletConfig,
  isWalletConfigLoaded,
  subscribeToWalletConfig,
} from "@/lib/domains/wallet/config-store";

export interface UseCurrentResellerWalletResult {
  wallet: ResellerWalletView | null;
  ledgerRows: ResellerLedgerRow[];
  fundingRows: ResellerLedgerRow[];
  commissionRows: ResellerLedgerRow[];
  pendingWithdrawals: ResellerPendingWithdrawalRow[];
  withdrawalHistory: ResellerWithdrawalHistoryEntry[];
  refundableSources: ResellerRefundableSource[];
  commissionsSummary: ResellerCommissionsSummary | null;
  summary: ResellerWalletSummary | null;
  destination: RegisteredDestination | null;
  config: WalletAutoApproveConfig | null;
  loading: boolean;
  error: Error | null;
}

const EMPTY: Omit<
  UseCurrentResellerWalletResult,
  "loading" | "error" | "config" | "destination"
> = {
  wallet: null,
  ledgerRows: [],
  fundingRows: [],
  commissionRows: [],
  pendingWithdrawals: [],
  withdrawalHistory: [],
  refundableSources: [],
  commissionsSummary: null,
  summary: null,
};

export function useCurrentResellerWallet(): UseCurrentResellerWalletResult {
  const reseller = useCurrentReseller();
  const nowMs = useNow();
  const [walletTick, setWalletTick] = useState(0);
  const [destinationTick, setDestinationTick] = useState(0);
  const [configTick, setConfigTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Ensure a wallet exists for the signed-in reseller. Effect, not memo, so
  // React does not run a store write during render.
  useEffect(() => {
    if (!reseller) return;
    internalEnsureResellerWallet(reseller.id, reseller.name);
  }, [reseller]);

  useEffect(() => {
    setLoaded(
      isResellerWalletStoreLoaded() &&
        isDestinationStoreLoaded() &&
        isWalletConfigLoaded()
    );
    const unsubWallet = subscribeToResellerWalletStore(() =>
      setWalletTick((x) => x + 1)
    );
    const unsubDest = subscribeToDestinationStore(() =>
      setDestinationTick((x) => x + 1)
    );
    const unsubConfig = subscribeToWalletConfig(() =>
      setConfigTick((x) => x + 1)
    );
    return () => {
      unsubWallet();
      unsubDest();
      unsubConfig();
    };
  }, []);

  const value = useMemo(() => {
    if (!reseller) {
      return {
        ...EMPTY,
        destination: null,
        config: null,
        error: new Error("No reseller session."),
      };
    }
    try {
      const state = getResellerWalletStore();
      const destination = getDestinationFor(reseller.id);
      const config = getWalletConfig();
      const effectiveNow = nowMs ?? Date.now();

      const wallet = projectWallet(state, reseller.id);
      const ledgerRows = projectLedger(state, reseller.id, destination);

      return {
        wallet,
        ledgerRows,
        fundingRows: ledgerRows.filter((r) => r.kind === "funding"),
        commissionRows: ledgerRows.filter((r) => r.kind === "commission"),
        pendingWithdrawals: projectPendingWithdrawals(
          state,
          reseller.id,
          destination
        ),
        withdrawalHistory: projectWithdrawalHistory(state, reseller.id),
        refundableSources: deriveRefundableSources(state, reseller.id),
        commissionsSummary: projectCommissionsSummary(
          state,
          reseller.id,
          effectiveNow
        ),
        summary: projectSummary(state, reseller.id, effectiveNow),
        destination,
        config,
        error: null as Error | null,
      };
    } catch (err) {
      return {
        ...EMPTY,
        destination: null,
        config: null,
        error: err instanceof Error ? err : new Error("Failed to load wallet"),
      };
    }
  }, [walletTick, destinationTick, configTick, reseller, nowMs]);

  return {
    ...value,
    loading: !loaded,
  };
}