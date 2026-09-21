/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  getMerchantMoneyState,
  subscribeToMerchantMoney,
} from "@/lib/admin/mock/merchant-money-store";
import type { MerchantMoneyState } from "@/lib/admin/types/merchant-money";

export function useMerchantMoney() {
  const [state, setState] = useState<MerchantMoneyState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setState(getMerchantMoneyState());
    setLoading(false);
    const unsubscribe = subscribeToMerchantMoney(() => {
      setState({ ...getMerchantMoneyState() });
    });
    return unsubscribe;
  }, []);

  return {
    state,
    loading,
    wallets: state?.wallets ?? {},
    walletTransactions: state?.walletTransactions ?? [],
    destinations: state?.destinations ?? {},
    cards: state?.cards ?? {},
    autopay: state?.autopay ?? {},
    withdrawals: state?.withdrawals ?? [],
    planCharges: state?.planCharges ?? [],
    checkouts: state?.checkouts ?? [],
    refunds: state?.refunds ?? [],
    disputes: state?.disputes ?? [],
    dunning: state?.dunning ?? [],
    config: state?.config ?? null,
  };
}