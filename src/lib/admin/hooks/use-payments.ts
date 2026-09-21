"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPaymentStore,
  isPaymentStoreLoaded,
  subscribeToPaymentStore,
} from "@/lib/admin/mock/payments-store";
import {
  projectPaymentSummary,
  projectPaymentLedger,
} from "@/lib/admin/payments/payments-projection";
import { useNow } from "./use-now";
import type {
  Payment,
  PaymentFlag,
  PaymentReconciliation,
  PaymentStoreState,
} from "@/lib/admin/types/payment";
import type {
  PaymentsSummary,
  PaymentsLedgerRow,
} from "@/lib/admin/payments/payments-projection";

export interface UsePaymentsResult {
  payments: Payment[];
  reconciliations: PaymentReconciliation[];
  flags: PaymentFlag[];
  summary: PaymentsSummary;
  ledgerRows: PaymentsLedgerRow[];
  loading: boolean;
  error: string | null;
}

const EMPTY_SUMMARY: PaymentsSummary = {
  totalCount: 0,
  successfulCount: 0,
  failedCount: 0,
  pendingCount: 0,
  refundedCount: 0,
  totalVolume: 0,
  successfulVolume: 0,
  pendingVolume: 0,
  failedVolume: 0,
  refundedVolume: 0,
  flaggedCount: 0,
  unreconciledFailedCount: 0,
  currency: "GHS",
};

export function usePayments(): UsePaymentsResult {
  const nowMs = useNow();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isPaymentStoreLoaded());
    const unsub = subscribeToPaymentStore(() => setTick((x) => x + 1));
    return unsub;
  }, []);

  const value = useMemo(() => {
    try {
      const state: PaymentStoreState = getPaymentStore();
      const effectiveNowMs = nowMs ?? Date.now();
      const summary = projectPaymentSummary(state, effectiveNowMs);
      const ledgerRows = projectPaymentLedger(state, effectiveNowMs);
      return {
        payments: state.payments,
        reconciliations: state.reconciliations,
        flags: state.flags,
        summary,
        ledgerRows,
        error: null as string | null,
      };
    } catch (err) {
      return {
        payments: [] as Payment[],
        reconciliations: [] as PaymentReconciliation[],
        flags: [] as PaymentFlag[],
        summary: EMPTY_SUMMARY,
        ledgerRows: [] as PaymentsLedgerRow[],
        error:
          err instanceof Error ? err.message : "Failed to load payments",
      };
    }
  }, [tick, nowMs]);

  return {
    ...value,
    loading: !loaded,
  };
}