/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStorefrontUserState,
  isStorefrontUserStateLoaded,
  subscribeToStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
import {
  getWalletConfig,
  isWalletConfigLoaded,
  subscribeToWalletConfig,
} from "@/lib/domains/wallet/config-store";
import type {
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
} from "@/lib/domains/wallet/storefront-user-types";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

export interface UseStorefrontUserRefundsResult {
  refundRequests: StorefrontRefundRequest[];
  refundHistory: StorefrontRefundHistoryEntry[];
  config: WalletAutoApproveConfig | null;
  loading: boolean;
}

export function useStorefrontUserRefunds(): UseStorefrontUserRefundsResult {
  const [tick, setTick] = useState(0);
  const [configTick, setConfigTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

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
    const state = getStorefrontUserState();
    return {
      refundRequests: state.refundRequests,
      refundHistory: state.refundHistory,
      config: getWalletConfig(),
    };
  }, [tick, configTick]);

  return {
    ...value,
    loading: !loaded,
  };
}