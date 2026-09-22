// lib/domains/treasury/helpers.ts

import type {
  TreasuryCoverageStatus,
  TreasuryEvent,
  TreasuryEventKind,
} from "./types";
import {
  ALWAYS_DUAL_APPROVAL_KINDS,
  DUAL_APPROVAL_THRESHOLD_GHS,
  RESERVE_FLOOR_WARN_PERCENT,
} from "./constants";

export function isDualApprovalRequired(
  kind: TreasuryEventKind,
  amount: number
): boolean {
  if (ALWAYS_DUAL_APPROVAL_KINDS.includes(kind)) return true;
  return amount > DUAL_APPROVAL_THRESHOLD_GHS;
}

export function isCashInSettled(event: TreasuryEvent): boolean {
  return event.direction === "in" && event.settledAt !== undefined;
}

export function isCashOutSettled(event: TreasuryEvent): boolean {
  return event.direction === "out" && event.settledAt !== undefined;
}

export function isCommittedOutbound(event: TreasuryEvent): boolean {
  return (
    event.direction === "out" &&
    event.approvalStatus === "approved" &&
    event.settledAt === undefined
  );
}

export function computeCashAtBank(events: TreasuryEvent[]): number {
  let total = 0;
  for (const event of events) {
    if (isCashInSettled(event)) total += event.amount;
    else if (isCashOutSettled(event)) total -= event.amount;
  }
  return Math.round(total * 100) / 100;
}

export function computeCommittedOutbound(events: TreasuryEvent[]): number {
  const total = events
    .filter(isCommittedOutbound)
    .reduce((sum, e) => sum + e.amount, 0);
  return Math.round(total * 100) / 100;
}

export function computeCoverage(
  freeCash: number,
  liabilities: number
): { status: TreasuryCoverageStatus; ratio: number } {
  if (liabilities <= 0) {
    return { status: "healthy", ratio: 1 };
  }
  const ratio = freeCash / liabilities;
  if (ratio <= 0) return { status: "danger", ratio };
  if (ratio < RESERVE_FLOOR_WARN_PERCENT / 100) {
    return { status: "warning", ratio };
  }
  return { status: "healthy", ratio };
}

export function isSameUtcDay(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function isUtcDayAgo(
  iso: string,
  nowMs: number,
  daysAgo: number
): boolean {
  const targetMs = nowMs - daysAgo * 24 * 60 * 60 * 1000;
  return isSameUtcDay(iso, new Date(targetMs).toISOString());
}

export function isTodayUtc(iso: string, nowMs: number): boolean {
  return isUtcDayAgo(iso, nowMs, 0);
}