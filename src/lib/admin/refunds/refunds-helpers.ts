import type {
  CustomerRefundHistoryItem,
  Refund,
  RefundAudience,
  RiskBand,
} from "@/lib/admin/types/refund";
import { COVERAGE_SPLIT, RISK_THRESHOLDS } from "./refunds-constants";

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

export function splitFor(
  audience: RefundAudience,
  amount: number
): { atlasShareAmount: number; resellerShareAmount: number } {
  const split = COVERAGE_SPLIT[audience];
  return {
    atlasShareAmount: Math.round(amount * split.atlas * 100) / 100,
    resellerShareAmount: Math.round(amount * split.reseller * 100) / 100,
  };
}

export function refundedAmount(refund: Refund): number {
  return Math.round(
    refund.settlements.reduce((sum, s) => sum + s.amount, 0) * 100
  ) / 100;
}

export function remainingRefundable(refund: Refund): number {
  return Math.round((refund.amount - refundedAmount(refund)) * 100) / 100;
}

export function isType1(refund: Refund): boolean {
  return refund.type === "automatic";
}

export function isActionable(refund: Refund): boolean {
  return refund.status === "pending_admin" || refund.status === "approved";
}

export function isSettled(refund: Refund): boolean {
  return refund.status === "completed";
}

export function deriveRiskBand(
  history: CustomerRefundHistoryItem[]
): RiskBand {
  if (history.length === 0) return "clean";

  const total = history.length;
  const rejected = history.filter((h) => h.status === "rejected").length;

  if (
    total >= RISK_THRESHOLDS.highMinRefunds &&
    rejected >= RISK_THRESHOLDS.highMinRejections
  ) {
    return "high";
  }

  if (
    total >= RISK_THRESHOLDS.mediumMinRefunds ||
    rejected >= RISK_THRESHOLDS.mediumMinRejections
  ) {
    return "medium";
  }

  if (total <= RISK_THRESHOLDS.lowMaxRefunds) return "low";

  return "clean";
}

export function isOverdue(requestedAt: string, nowMs: number): boolean {
  return (
    nowMs - new Date(requestedAt).getTime() > 24 * 60 * 60 * 1000
  );
}

export function isOverdueByHours(
  requestedAt: string,
  nowMs: number,
  hours: number
): boolean {
  return nowMs - new Date(requestedAt).getTime() > hours * 60 * 60 * 1000;
}