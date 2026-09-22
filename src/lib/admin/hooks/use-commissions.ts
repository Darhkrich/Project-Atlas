/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCommissionStore,
  subscribeToCommissionStore,
} from "@/lib/admin/mock/commission-store";
import {
  projectCommissionRows,
  projectCommissionSummary,
  projectPayoutSummary,
  projectPlatformSummary,
  projectPlatformTrend,
  type CommissionRow,
  type CommissionSummary,
  type PayoutSummary,
  type PlatformSummary,
  type PlatformTrendPoint,
} from "@/lib/admin/commissions/commission-projection";
import { useNow } from "@/lib/shared/hooks/use-now";
import type {
  CommissionAuditEntry,
  PayoutRun,
  ResellerCommission,
} from "@/lib/admin/types/commission";

export interface UseCommissionsResult {
  commissions: ResellerCommission[];
  commissionRows: CommissionRow[];
  payoutRuns: PayoutRun[];
  audit: CommissionAuditEntry[];
  commissionSummary: CommissionSummary;
  platformSummary: PlatformSummary;
  platformTrend: PlatformTrendPoint[];
  payoutSummary: PayoutSummary;
  loading: boolean;
  error: string | null;
}

const EMPTY_DELTA = {
  current: 0,
  previous: 0,
  changePct: null as number | null,
  direction: "flat" as const,
};

const EMPTY_SUMMARY: CommissionSummary = {
  totalCommission: 0,
  totalCommissionDelta: EMPTY_DELTA,
  pendingCommission: 0,
  pendingCommissionDelta: EMPTY_DELTA,
  paidCommission: 0,
  paidCommissionDelta: EMPTY_DELTA,
  atlasType1Margin: 0,
  atlasType1MarginDelta: EMPTY_DELTA,
  atlasType2Margin: 0,
  atlasType2MarginDelta: EMPTY_DELTA,
  atlasType3Margin: 0,
  atlasType3MarginDelta: EMPTY_DELTA,
  atlasExtraCut: 0,
  atlasExtraCutDelta: EMPTY_DELTA,
  todayCommission: 0,
  reversedCommission: 0,
  currency: "GHS",
};

const EMPTY_PLATFORM_SUMMARY: PlatformSummary = {
  totalMargin: 0,
  totalMarginDelta: EMPTY_DELTA,
  todayMargin: 0,
  monthMargin: 0,
  avgMarginPercent: 0,
  rowCount: 0,
};

const EMPTY_PAYOUT_SUMMARY: PayoutSummary = {
  pending: 0,
  completed: 0,
  failed: 0,
  total: 0,
};

export function useCommissions(): UseCommissionsResult {
  const nowMs = useNow();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getCommissionStore();
    setLoaded(true);
    const unsub = subscribeToCommissionStore(() => setTick((x) => x + 1));
    return unsub;
  }, []);

  const value = useMemo(() => {
    if (!loaded) {
      return {
        commissions: [] as ResellerCommission[],
        commissionRows: [] as CommissionRow[],
        payoutRuns: [] as PayoutRun[],
        audit: [] as CommissionAuditEntry[],
        commissionSummary: EMPTY_SUMMARY,
        platformSummary: EMPTY_PLATFORM_SUMMARY,
        platformTrend: [] as PlatformTrendPoint[],
        payoutSummary: EMPTY_PAYOUT_SUMMARY,
        error: null as string | null,
      };
    }
    try {
      const state = getCommissionStore();
      const effectiveNow = nowMs ?? Date.now();

      return {
        commissions: state.commissions,
        commissionRows: projectCommissionRows(
          state.commissions,
          effectiveNow
        ),
        payoutRuns: state.payoutRuns,
        audit: state.audit,
        commissionSummary: projectCommissionSummary(
          state.commissions,
          effectiveNow
        ),
        platformSummary: projectPlatformSummary(
          state.commissions,
          effectiveNow
        ),
        platformTrend: projectPlatformTrend(
          state.commissions,
          effectiveNow
        ),
        payoutSummary: projectPayoutSummary(state.payoutRuns),
        error: null as string | null,
      };
    } catch (err) {
      return {
        commissions: [] as ResellerCommission[],
        commissionRows: [] as CommissionRow[],
        payoutRuns: [] as PayoutRun[],
        audit: [] as CommissionAuditEntry[],
        commissionSummary: EMPTY_SUMMARY,
        platformSummary: EMPTY_PLATFORM_SUMMARY,
        platformTrend: [] as PlatformTrendPoint[],
        payoutSummary: EMPTY_PAYOUT_SUMMARY,
        error:
          err instanceof Error ? err.message : "Failed to load commissions",
      };
    }
  }, [tick, loaded, nowMs]);

  return {
    ...value,
    loading: !loaded,
  };
}