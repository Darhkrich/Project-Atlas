"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  TreasuryEvent,
  TreasuryEventFilters,
  TreasuryStatementRow,
  TreasurySummary,
} from "@/lib/admin/types/treasury";
import {
  getTreasuryEvents,
  isTreasuryStoreLoaded,
  subscribeToTreasuryStore,
} from "@/lib/admin/mock/treasury-store";
import {
  projectTreasurySummary,
  projectTreasuryStatement,
  filterTreasuryEvents,
} from "@/lib/admin/treasury/treasury-projection";
import { useNow } from "@/lib/shared/hooks/use-now";

export interface UseTreasuryResult {
  events: TreasuryEvent[];
  summary: TreasurySummary;
  rows: TreasuryStatementRow[];
  isLoading: boolean;
  error: Error | null;
  nowMs: number | null;
}

const EMPTY_SUMMARY: TreasurySummary = {
  cashAtBank: 0,
  committedOutbound: 0,
  available: 0,
  userLiabilities: 0,
  freeCash: 0,
  coverageStatus: "healthy",
  coverageRatio: 0,
  unmatchedCount: 0,
  pendingApprovalCount: 0,
};

export function useTreasury(filters?: TreasuryEventFilters): UseTreasuryResult {
  const nowMs = useNow();
  const [events, setEvents] = useState<TreasuryEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    const sync = () => {
      setEvents(getTreasuryEvents());
      setLoaded(isTreasuryStoreLoaded());
    };
    const unsub = subscribeToTreasuryStore(sync);
    sync();
    return () => {
      unsub();
    };
  }, []);

  const summary = useMemo(
    () => projectTreasurySummary(events),
    [events]
  );

  const allRows = useMemo(
    () => projectTreasuryStatement(events),
    [events]
  );

  const rows = useMemo(
    () => (filters ? filterTreasuryEvents(allRows, filters) : allRows),
    [allRows, filters]
  );

  return {
    events,
    summary: loaded ? summary : EMPTY_SUMMARY,
    rows,
    isLoading: !loaded,
    error,
    nowMs,
  };
}