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
  PlatformMargin,
  ResellerCommission,
} from "@/lib/admin/types/commission";

export interface UseCommissionsResult {
  commissions: ResellerCommission[];
  commissionRows: CommissionRow[];
  margins: PlatformMargin[];
  payoutRuns: PayoutRun[];
  audit: CommissionAuditEntry[];
  commissionSummary: CommissionSummary;
  platformSummary: PlatformSummary;
  platformTrend: PlatformTrendPoint[];
  payoutSummary: PayoutSummary;
  loading: boolean;
  error: string | null;
}

const EMPTY_SUMMARY: CommissionSummary = {
  totalCommission: 0,
  totalCommissionDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  pendingCommission: 0,
  pendingCommissionDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  paidCommission: 0,
  paidCommissionDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  atlasBaseMargin: 0,
  atlasBaseMarginDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  atlasExtraCut: 0,
  atlasExtraCutDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
  todayCommission: 0,
  reversedCommission: 0,
  currency: "GHS",
};

const EMPTY_PLATFORM_SUMMARY: PlatformSummary = {
  totalMargin: 0,
  totalMarginDelta: {
    current: 0,
    previous: 0,
    changePct: null,
    direction: "flat",
  },
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
        margins: [] as PlatformMargin[],
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
        commissionRows: projectCommissionRows(state.commissions, effectiveNow),
        margins: state.margins,
        payoutRuns: state.payoutRuns,
        audit: state.audit,
        commissionSummary: projectCommissionSummary(
          state.commissions,
          effectiveNow
        ),
        platformSummary: projectPlatformSummary(state.margins, effectiveNow),
        platformTrend: projectPlatformTrend(state.margins, effectiveNow),
        payoutSummary: projectPayoutSummary(state.payoutRuns),
        error: null as string | null,
      };
    } catch (err) {
      return {
        commissions: [] as ResellerCommission[],
        commissionRows: [] as CommissionRow[],
        margins: [] as PlatformMargin[],
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