"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/admin/types/orders";
import type {
  TransactionLedgerRow,
  TransactionOverlayRecord,
} from "@/lib/admin/types/transaction";
import type { CustomerWalletStoreState } from "@/lib/customer/types/wallet";
import type { StorefrontUserWalletState } from "@/lib/domains/wallet/storefront-user-types";
import {
  getOrders,
  isOrdersStoreLoaded,
  subscribeToOrdersStore,
} from "@/lib/admin/mock/orders-store";
import {
  getCustomerWalletStore,
  isCustomerWalletStoreLoaded,
  subscribeToCustomerWalletStore,
} from "@/lib/customer/mock/wallet-store";
import {
  getStorefrontUserState,
  isStorefrontUserStateLoaded,
  subscribeToStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
import {
  getOverlayTransactions,
  isTransactionOverlayLoaded,
  subscribeToTransactionOverlay,
} from "@/lib/admin/mock/transaction-overlay-store";
import { projectTransactions } from "@/lib/admin/transactions/transactions-projection";

export interface UseTransactionsResult {
  transactions: TransactionLedgerRow[];
  isLoading: boolean;
  error: Error | null;
}

export function useTransactions(): UseTransactionsResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerState, setCustomerState] =
    useState<CustomerWalletStoreState | null>(null);
  const [storefrontState, setStorefrontState] =
    useState<StorefrontUserWalletState | null>(null);
  const [overlay, setOverlay] = useState<TransactionOverlayRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    const syncOrders = () => {
      setOrders(getOrders());
      setLoaded(
        isOrdersStoreLoaded() &&
          isCustomerWalletStoreLoaded() &&
          isStorefrontUserStateLoaded() &&
          isTransactionOverlayLoaded()
      );
    };
    const syncCustomer = () => {
      setCustomerState(getCustomerWalletStore());
      syncOrders();
    };
    const syncStorefront = () => {
      setStorefrontState(getStorefrontUserState());
      syncOrders();
    };
    const syncOverlay = () => {
      setOverlay(getOverlayTransactions());
      syncOrders();
    };

    const unsubOrders = subscribeToOrdersStore(syncOrders);
    const unsubCustomer = subscribeToCustomerWalletStore(syncCustomer);
    const unsubStorefront = subscribeToStorefrontUserState(syncStorefront);
    const unsubOverlay = subscribeToTransactionOverlay(syncOverlay);

    syncOrders();
    syncCustomer();
    syncStorefront();
    syncOverlay();

    return () => {
      unsubOrders();
      unsubCustomer();
      unsubStorefront();
      unsubOverlay();
    };
  }, []);

  const transactions = useMemo(() => {
    if (!customerState || !storefrontState) return [];
    return projectTransactions(
      orders,
      customerState,
      storefrontState,
      overlay
    );
  }, [orders, customerState, storefrontState, overlay]);

  return {
    transactions,
    isLoading: !loaded,
    error,
  };
}