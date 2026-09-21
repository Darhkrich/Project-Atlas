"use client";

import { useMemo } from "react";
import { useCurrentReseller } from "./use-current-reseller";
import { useCurrentResellerWallet } from "./use-current-reseller-wallet";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import { projectResellerTransactions } from "@/lib/reseller/wallet/transaction-projection";
import type { ResellerWalletLedgerEntry } from "@/lib/reseller/types/wallet";
import type { ResellerTransactionRow } from "@/lib/reseller/types/transaction";

export function useResellerTransactions(): ResellerTransactionRow[] {
  const reseller = useCurrentReseller();
  const walletState = useCurrentResellerWallet();
  const orders = useResellerOrders(reseller?.id ?? "");

  return useMemo(() => {
    if (!reseller) return [];

    const ledgerEntries: ResellerWalletLedgerEntry[] = [];
    for (const row of walletState.ledgerRows) {
      const raw = row.raw;
      if (raw) ledgerEntries.push(raw);
    }

    const nonWalletOrders = orders.filter(
      (o) => o.paymentMethodId !== "wallet"
    );

    return projectResellerTransactions(ledgerEntries, nonWalletOrders);
  }, [reseller, orders, walletState.ledgerRows]);
}