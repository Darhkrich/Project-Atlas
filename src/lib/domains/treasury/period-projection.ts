// lib/domains/treasury/period-projection.ts
//
// Pure functions over period identifiers and period states. No store
// reads, no side effects. Callers look up state and pass it in.

import type { TreasuryEvent } from "./types";
import type {
  CloseReadiness,
  PeriodClose,
  PeriodState,
  TreasuryPeriodId,
} from "./period-types";

// ---------------------------------------------------------------------------
// Period ID arithmetic. UTC calendar months.
// ---------------------------------------------------------------------------

export function getPeriodIdFromIso(iso: string): TreasuryPeriodId {
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  return String(year) + "-" + String(month).padStart(2, "0");
}

export function getCurrentPeriodId(nowMs: number): TreasuryPeriodId {
  return getPeriodIdFromIso(new Date(nowMs).toISOString());
}

export function getPreviousPeriodId(
  periodId: TreasuryPeriodId
): TreasuryPeriodId {
  const parts = periodId.split("-");
  let year = Number(parts[0]);
  let month = Number(parts[1]) - 1;
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return String(year) + "-" + String(month).padStart(2, "0");
}

export function getPeriodRange(periodId: TreasuryPeriodId): {
  startMs: number;
  endMs: number;
} {
  const parts = periodId.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const startMs = Date.UTC(year, month, 1);
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const endMs = Date.UTC(nextYear, nextMonth, 1);
  return { startMs, endMs };
}

export function isDateInPeriod(
  iso: string,
  periodId: TreasuryPeriodId
): boolean {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  const range = getPeriodRange(periodId);
  return t >= range.startMs && t < range.endMs;
}

// ---------------------------------------------------------------------------
// Period state views.
// ---------------------------------------------------------------------------

export function projectAllPeriodStates(
  closes: PeriodClose[],
  events: TreasuryEvent[],
  nowMs: number,
  monthsVisible: number
): PeriodState[] {
  void events;
  const out: PeriodState[] = [];
  let periodId = getCurrentPeriodId(nowMs);
  for (let i = 0; i < monthsVisible; i++) {
    const close = closes.find((c) => c.periodId === periodId) ?? null;
    const range = getPeriodRange(periodId);
    out.push({
      periodId,
      openedAt: new Date(range.startMs).toISOString(),
      closedAt: close ? close.closedAt : null,
      status: close ? "closed" : "open",
      close,
    });
    periodId = getPreviousPeriodId(periodId);
  }
  return out;
}

export function getPeriodCloseFor(
  periodId: TreasuryPeriodId,
  closes: PeriodClose[]
): PeriodClose | null {
  return closes.find((c) => c.periodId === periodId) ?? null;
}

export function isDateInClosedPeriod(
  iso: string,
  closes: PeriodClose[]
): boolean {
  const periodId = getPeriodIdFromIso(iso);
  return closes.some((c) => c.periodId === periodId);
}

// ---------------------------------------------------------------------------
// Close readiness.
// ---------------------------------------------------------------------------

export function computeCloseReadiness(
  events: TreasuryEvent[],
  periodId: TreasuryPeriodId
): CloseReadiness {
  const range = getPeriodRange(periodId);
  let unmatchedCount = 0;
  let pendingApprovalCount = 0;
  for (const event of events) {
    const t = new Date(event.createdAt).getTime();
    if (t < range.startMs || t >= range.endMs) continue;
    if (event.reconciliationStatus === "unmatched") unmatchedCount += 1;
    if (event.approvalStatus === "pending") pendingApprovalCount += 1;
  }
  const blockers: string[] = [];
  if (unmatchedCount > 0) {
    blockers.push(
      unmatchedCount + " unmatched event" + (unmatchedCount === 1 ? "" : "s")
    );
  }
  if (pendingApprovalCount > 0) {
    blockers.push(
      pendingApprovalCount +
        " pending approval" +
        (pendingApprovalCount === 1 ? "" : "s")
    );
  }
  return {
    ready: blockers.length === 0,
    periodId,
    unmatchedCount,
    pendingApprovalCount,
    blockers,
  };
}