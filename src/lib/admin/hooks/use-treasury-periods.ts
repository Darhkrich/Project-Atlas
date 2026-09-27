/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
// lib/admin/hooks/use-treasury-periods.ts
//
// Read hook over the treasury period store. Returns the trailing
// monthsVisible periods, the current period id, and the next closable
// period's readiness. Subscribes to the period store; re-renders when a
// period is closed.
//
// "Next closable" means the closest period strictly before the current
// period that has not yet been closed. The current period cannot be
// closed (Stage 3 decision). Past months that are already closed are
// skipped.

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPeriodCloses,
  isPeriodStoreLoaded,
  subscribeToPeriodStore,
} from "@/lib/domains/treasury/period-store";
import {
  computeCloseReadiness,
  getCurrentPeriodId,
  getPreviousPeriodId,
  projectAllPeriodStates,
} from "@/lib/domains/treasury/period-projection";
import { PERIOD_DEFAULT_MONTHS_VISIBLE } from "@/lib/domains/treasury/constants";
import { getTreasuryEvents } from "@/lib/domains/treasury/store";
import { useNow } from "@/lib/shared/hooks/use-now";
import type {
  CloseReadiness,
  PeriodState,
  TreasuryPeriodId,
} from "@/lib/domains/treasury/period-types";

export interface UseTreasuryPeriodsResult {
  periods: PeriodState[];
  currentPeriodId: TreasuryPeriodId;
  nextClosablePeriodId: TreasuryPeriodId;
  nextClosableReadiness: CloseReadiness | null;
  loading: boolean;
  error: Error | null;
  nowMs: number | null;
}

function findNextClosablePeriodId(
  periods: PeriodState[],
  currentPeriodId: TreasuryPeriodId
): TreasuryPeriodId {
  let candidate = getPreviousPeriodId(currentPeriodId);
  for (let i = 0; i < 36; i++) {
    const state = periods.find((p) => p.periodId === candidate);
    if (!state) return candidate;
    if (state.status === "open") return candidate;
    candidate = getPreviousPeriodId(candidate);
  }
  return candidate;
}

export function useTreasuryPeriods(
  monthsVisible: number = PERIOD_DEFAULT_MONTHS_VISIBLE
): UseTreasuryPeriodsResult {
  const nowMs = useNow();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(isPeriodStoreLoaded());
    const unsub = subscribeToPeriodStore(() => setTick((x) => x + 1));
    return unsub;
  }, []);

  const value = useMemo(() => {
    const effectiveNow = nowMs ?? Date.now();
    const closes = getPeriodCloses();
    const events = getTreasuryEvents();
    const currentPeriodId = getCurrentPeriodId(effectiveNow);

    const periods = projectAllPeriodStates(
      closes,
      events,
      effectiveNow,
      monthsVisible
    );

    const nextClosablePeriodId = findNextClosablePeriodId(
      periods,
      currentPeriodId
    );
    const nextClosableState = periods.find(
      (p) => p.periodId === nextClosablePeriodId
    );
    const nextClosableReadiness =
      nextClosableState && nextClosableState.status === "open"
        ? computeCloseReadiness(events, nextClosablePeriodId)
        : null;

    return {
      periods,
      currentPeriodId,
      nextClosablePeriodId,
      nextClosableReadiness,
    };
  }, [tick, nowMs, monthsVisible]);

  return {
    ...value,
    loading: !loaded,
    error: null,
    nowMs,
  };
}