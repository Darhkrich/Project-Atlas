// lib/domains/treasury/period-types.ts
//
// Closed-period model for the treasury. A period is a UTC calendar
// month, identified by "YYYY-MM". Once closed, no new treasury event
// with createdAt inside that range is accepted, and no event in that
// range can be reconciled. Corrections are contra entries in the
// current open period.

import type {
  TreasuryActor,
  TreasuryCoverageStatus,
} from "./types";

export type TreasuryPeriodId = string;

export interface PeriodCloseSnapshot {
  cashAtBank: number;
  committedOutbound: number;
  available: number;
  userLiabilities: number;
  /**
   * Obligation Atlas owes providers at close time. Optional in this
   * build. Required after the money-flow wiring batch lands.
   */
  providerLiabilities?: number;
  freeCash: number;
  coverageStatus: TreasuryCoverageStatus;
  coverageRatio: number;
  eventCount: number;
  unmatchedCount: number;
}

export interface PeriodClose {
  id: string;
  periodId: TreasuryPeriodId;
  openedAt: string;
  closedAt: string;
  closedBy: TreasuryActor;
  snapshot: PeriodCloseSnapshot;
  notes?: string;
  unmatchedCountAtClose: number;
}

export type PeriodStatus = "open" | "closed";

export interface PeriodState {
  periodId: TreasuryPeriodId;
  openedAt: string;
  closedAt: string | null;
  status: PeriodStatus;
  close: PeriodClose | null;
}

export interface ClosePeriodInput {
  periodId: TreasuryPeriodId;
  nowMs: number;
  notes?: string;
}

export interface CloseReadiness {
  ready: boolean;
  periodId: TreasuryPeriodId;
  unmatchedCount: number;
  pendingApprovalCount: number;
  blockers: string[];
}