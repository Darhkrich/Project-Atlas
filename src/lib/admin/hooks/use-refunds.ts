/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Refund,
  RefundSummary,
} from "@/lib/admin/types/refund";
import {
  getRefunds,
  isRefundsStoreLoaded,
  subscribeToRefundsStore,
} from "@/lib/admin/mock/refunds-store";
import {
  getTreasuryEvents,
  isTreasuryStoreLoaded,
  subscribeToTreasuryStore,
} from "@/lib/domains/treasury/store";
import { computeCashAtBank } from "@/lib/domains/treasury/helpers";
import {
  projectRefundRows,
  projectRefundsSummary,
  projectRefundsPipeline,
  type RefundLedgerRow,
  type RefundPipelineView,
} from "@/lib/admin/refunds/refunds-projection";
import { useNow } from "@/lib/shared/hooks/use-now";

export interface RefundsTreasuryView {
  balance: number;
  currency: "GHS";
}

export interface UseRefundsResult {
  refunds: Refund[];
  treasury: RefundsTreasuryView | null;
  rows: RefundLedgerRow[];
  summary: RefundSummary;
  pipeline: RefundPipelineView;
  isLoading: boolean;
  error: Error | null;
  nowMs: number | null;
}

const EMPTY_SUMMARY: RefundSummary = {
  volumeToday: 0,
  volumeYesterday: 0,
  countToday: 0,
  countYesterday: 0,
  awaitingApprovalCount: 0,
  awaitingApprovalYesterday: 0,
  failedToday: 0,
  failedYesterday: 0,
  treasuryBalance: 0,
};

const EMPTY_PIPELINE: RefundPipelineView = { stages: [] };

export function useRefunds(): UseRefundsResult {
  const nowMs = useNow();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [treasury, setTreasury] = useState<RefundsTreasuryView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    const syncRefunds = () => {
      setRefunds(getRefunds());
      setLoaded(isRefundsStoreLoaded() && isTreasuryStoreLoaded());
    };
    const syncTreasury = () => {
      const events = getTreasuryEvents();
      setTreasury({
        balance: computeCashAtBank(events),
        currency: "GHS",
      });
      syncRefunds();
    };

    const unsubRefunds = subscribeToRefundsStore(syncRefunds);
    const unsubTreasury = subscribeToTreasuryStore(syncTreasury);

    syncRefunds();
    syncTreasury();

    return () => {
      unsubRefunds();
      unsubTreasury();
    };
  }, []);

  const effectiveNowMs = nowMs ?? Date.now();

  const rows = useMemo(
    () => projectRefundRows(refunds, effectiveNowMs),
    [refunds, effectiveNowMs]
  );

  const summary = useMemo(
    () =>
      treasury
        ? projectRefundsSummary(
            refunds,
            {
              balance: treasury.balance,
              currency: treasury.currency,
              settlements: [],
            },
            effectiveNowMs
          )
        : EMPTY_SUMMARY,
    [refunds, treasury, effectiveNowMs]
  );

  const pipeline = useMemo(
    () => projectRefundsPipeline(refunds),
    [refunds]
  );

  return {
    refunds,
    treasury,
    rows,
    summary,
    pipeline,
    isLoading: !loaded,
    error,
    nowMs,
  };
}