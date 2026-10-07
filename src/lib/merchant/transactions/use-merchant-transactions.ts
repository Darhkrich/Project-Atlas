"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import {
  getMerchantWalletState,
  getMerchantMoneyStoreVersion,
  isMerchantMoneyStoreLoaded,
  subscribeToMerchantMoneyStore,
} from "@/lib/domains/wallet/merchant-money/store";
import { getInvoicesForMerchant } from "@/lib/merchant/billing/store";
import {
  getInvoiceStoreVersion,
  isInvoiceStoreLoaded,
  subscribeToInvoiceStore,
} from "@/lib/merchant/billing/store";
import { projectTransactions } from "./projection";
import type { MerchantTransaction } from "./types";

export interface UseMerchantTransactionsResult {
  transactions: MerchantTransaction[];
  loading: boolean;
  error: string | null;
}

const EMPTY: UseMerchantTransactionsResult = {
  transactions: [],
  loading: false,
  error: null,
};

function subscribe(onStoreChange: () => void): () => void {
  const a = subscribeToMerchantMoneyStore(onStoreChange);
  const b = subscribeToInvoiceStore(onStoreChange);
  return () => {
    a();
    b();
  };
}

function snapshot(): number {
  if (!isMerchantMoneyStoreLoaded() || !isInvoiceStoreLoaded()) return -1;
  return getMerchantMoneyStoreVersion() + getInvoiceStoreVersion();
}

export function useMerchantTransactions(): UseMerchantTransactionsResult {
  const merchant = useCurrentMerchant();
  const version = useSyncExternalStore(subscribe, snapshot, () => -1);

  return useMemo(() => {
    if (!merchant) {
      return { ...EMPTY, error: "No merchant session." };
    }
    if (version < 0) {
      return { ...EMPTY, loading: true };
    }
    try {
      const walletState = getMerchantWalletState(merchant.id);
      const invoices = getInvoicesForMerchant(merchant.id);
      const transactions = projectTransactions(walletState, invoices);
      return { transactions, loading: false, error: null };
    } catch (err) {
      return {
        ...EMPTY,
        error:
          err instanceof Error ? err.message : "Failed to load transactions.",
      };
    }
  }, [merchant, version]);
}