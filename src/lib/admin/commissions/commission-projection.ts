// lib/admin/commissions/commission-projection.ts
//
// Projections over the commission store. Margins are projections of the
// commission array, not a separate store. Three margin types:
//
//   Type 1 = atlasPrice - providerCost                (gross spread)
//   Type 2 = Type 1 - baseCommission                  (net after reseller base)
//   Type 3 = Type 2 + atlasExtraCut                   (Atlas total revenue)
//
// Only paid commissions contribute Atlas margin. Pending commissions
// describe orders that have not settled; cancelled and reversed
// commissions describe orders whose money is not Atlas's.

import type {
  CommissionStatus,
  PayoutRun,
  ResellerCommission,
  ServiceCategory,
} from "../types/commission";
import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_VARIANT,
  SERVICE_CATEGORY_LABEL,
} from "./commission-labels";

const THIRTY_DAYS_MS = 30 * 86_400_000;
const DAY_MS = 86_400_000;

export interface MetricWithDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

export interface CommissionSummary {
  totalCommission: number;
  totalCommissionDelta: MetricWithDelta;
  pendingCommission: number;
  pendingCommissionDelta: MetricWithDelta;
  paidCommission: number;
  paidCommissionDelta: MetricWithDelta;
  atlasType1Margin: number;
  atlasType1MarginDelta: MetricWithDelta;
  atlasType2Margin: number;
  atlasType2MarginDelta: MetricWithDelta;
  atlasType3Margin: number;
  atlasType3MarginDelta: MetricWithDelta;
  atlasExtraCut: number;
  atlasExtraCutDelta: MetricWithDelta;
  todayCommission: number;
  reversedCommission: number;
  currency: string;
}

export interface CommissionRow {
  id: string;
  resellerId: string;
  resellerName: string;
  orderId: string;
  service: string;
  serviceCategory: ServiceCategory;
  serviceCategoryLabel: string;
  providerCost: number;
  atlasPrice: number;
  resellerPrice: number;
  baseCommission: number;
  extraAmount: number;
  atlasExtraCut: number;
  resellerExtraCut: number;
  totalCommission: number;
  effectiveExtraCutPercent: number | null;
  tierId: string | null;
  tierName: string | null;
  status: CommissionStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  statusReason: string;
  createdAt: string;
  paidAt: string | null;
  reversedAt: string | null;
  raw: ResellerCommission;
}

function computeDelta(current: number, previous: number): MetricWithDelta {
  const diff = current - previous;
  let direction: "up" | "down" | "flat" = "flat";
  if (diff > 0) direction = "up";
  else if (diff < 0) direction = "down";
  const changePct = previous === 0 ? null : (diff / previous) * 100;
  return {
    current: Math.round(current * 100) / 100,
    previous: Math.round(previous * 100) / 100,
    changePct,
    direction,
  };
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function startOfUtcMonth(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

// Margin math. Not clamped. A negative is a real event and must surface.

function type1MarginOf(c: ResellerCommission): number {
  return Math.round((c.atlasPrice - c.providerCost) * 100) / 100;
}

function type2MarginOf(c: ResellerCommission): number {
  return (
    Math.round((c.atlasPrice - c.providerCost - c.baseCommission) * 100) /
    100
  );
}

function type3MarginOf(c: ResellerCommission): number {
  return (
    Math.round(
      (c.atlasPrice -
        c.providerCost -
        c.baseCommission +
        c.atlasExtraCut) *
        100
    ) / 100
  );
}

function reasonFor(c: ResellerCommission): string {
  if (c.status === "paid") {
    return "Paid on order completion";
  }
  if (c.status === "pending") {
    return "Awaiting order completion";
  }
  if (c.status === "cancelled") {
    const reversedTimeline = [...c.timeline].reverse();
    const entry = reversedTimeline.find((t) =>
      t.label.toLowerCase().includes("cancel")
    );
    if (entry) return entry.label;
    return "Cancelled";
  }
  if (c.status === "reversed") {
    const reversedTimeline = [...c.timeline].reverse();
    const entry = reversedTimeline.find(
      (t) =>
        t.label.toLowerCase().includes("revers") ||
        t.label.toLowerCase().includes("refund")
    );
    if (entry) return entry.label;
    return "Reversed on order refund";
  }
  return "";
}

export function projectCommissionRow(c: ResellerCommission): CommissionRow {
  return {
    id: c.id,
    resellerId: c.resellerId,
    resellerName: c.resellerName,
    orderId: c.orderId,
    service: c.service,
    serviceCategory: c.serviceCategory,
    serviceCategoryLabel: SERVICE_CATEGORY_LABEL[c.serviceCategory],
    providerCost: c.providerCost,
    atlasPrice: c.atlasPrice,
    resellerPrice: c.resellerPrice,
    baseCommission: c.baseCommission,
    extraAmount: c.extraAmount,
    atlasExtraCut: c.atlasExtraCut,
    resellerExtraCut: c.resellerExtraCut,
    totalCommission: c.totalCommission,
    effectiveExtraCutPercent: c.effectiveExtraCutPercent ?? null,
    tierId: c.tierId ?? null,
    tierName: c.tierName ?? null,
    status: c.status,
    statusLabel: COMMISSION_STATUS_LABEL[c.status],
    statusVariant: COMMISSION_STATUS_VARIANT[c.status],
    statusReason: reasonFor(c),
    createdAt: c.createdAt,
    paidAt: c.paidAt ?? null,
    reversedAt: c.reversedAt ?? null,
    raw: c,
  };
}

export function projectCommissionRows(
  commissions: ResellerCommission[],
  nowMs: number
): CommissionRow[] {
  void nowMs;
  const rows = commissions.map(projectCommissionRow);
  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return rows;
}

export function projectCommissionSummary(
  commissions: ResellerCommission[],
  nowMs: number
): CommissionSummary {
  const currentStart = nowMs - THIRTY_DAYS_MS;
  const previousStart = nowMs - 2 * THIRTY_DAYS_MS;
  const previousEnd = currentStart;
  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + DAY_MS;

  let totalCur = 0;
  let totalPrev = 0;
  let pendingCur = 0;
  let pendingPrev = 0;
  let paidCur = 0;
  let paidPrev = 0;
  let t1Cur = 0;
  let t1Prev = 0;
  let t2Cur = 0;
  let t2Prev = 0;
  let t3Cur = 0;
  let t3Prev = 0;
  let extraCutCur = 0;
  let extraCutPrev = 0;
  let todayCommission = 0;
  let reversedInWindow = 0;

  for (const c of commissions) {
    const createdTs = new Date(c.createdAt).getTime();
    const inCurrent = createdTs >= currentStart && createdTs < nowMs + 1;
    const inPrevious = createdTs >= previousStart && createdTs < previousEnd;

    if (inCurrent) totalCur += c.totalCommission;
    else if (inPrevious) totalPrev += c.totalCommission;

    if (createdTs >= dayStart && createdTs < dayEnd) {
      todayCommission += c.totalCommission;
    }

    if (c.status === "pending") {
      if (inCurrent) pendingCur += c.totalCommission;
      else if (inPrevious) pendingPrev += c.totalCommission;
    }
    if (c.status === "paid") {
      if (inCurrent) paidCur += c.totalCommission;
      else if (inPrevious) paidPrev += c.totalCommission;
    }

    // Margin only when the money is Atlas's. Reversed commissions are
    // returned to the customer. Cancelled commissions never settled.
    if (c.status === "paid") {
      if (inCurrent) {
        t1Cur += type1MarginOf(c);
        t2Cur += type2MarginOf(c);
        t3Cur += type3MarginOf(c);
        extraCutCur += c.atlasExtraCut;
      } else if (inPrevious) {
        t1Prev += type1MarginOf(c);
        t2Prev += type2MarginOf(c);
        t3Prev += type3MarginOf(c);
        extraCutPrev += c.atlasExtraCut;
      }
    }

    if (c.status === "reversed" && c.reversedAt) {
      const reversedTs = new Date(c.reversedAt).getTime();
      if (reversedTs >= currentStart && reversedTs < nowMs + 1) {
        reversedInWindow += c.totalCommission;
      }
    }
  }

  return {
    totalCommission: Math.round(totalCur * 100) / 100,
    totalCommissionDelta: computeDelta(totalCur, totalPrev),
    pendingCommission: Math.round(pendingCur * 100) / 100,
    pendingCommissionDelta: computeDelta(pendingCur, pendingPrev),
    paidCommission: Math.round(paidCur * 100) / 100,
    paidCommissionDelta: computeDelta(paidCur, paidPrev),
    atlasType1Margin: Math.round(t1Cur * 100) / 100,
    atlasType1MarginDelta: computeDelta(t1Cur, t1Prev),
    atlasType2Margin: Math.round(t2Cur * 100) / 100,
    atlasType2MarginDelta: computeDelta(t2Cur, t2Prev),
    atlasType3Margin: Math.round(t3Cur * 100) / 100,
    atlasType3MarginDelta: computeDelta(t3Cur, t3Prev),
    atlasExtraCut: Math.round(extraCutCur * 100) / 100,
    atlasExtraCutDelta: computeDelta(extraCutCur, extraCutPrev),
    todayCommission: Math.round(todayCommission * 100) / 100,
    reversedCommission: Math.round(reversedInWindow * 100) / 100,
    currency: "GHS",
  };
}

// ---------------------------------------------------------------------------
// Platform margin projections. Type 1 only, projected from commissions.
// ---------------------------------------------------------------------------

export interface PlatformSummary {
  totalMargin: number;
  totalMarginDelta: MetricWithDelta;
  todayMargin: number;
  monthMargin: number;
  avgMarginPercent: number;
  rowCount: number;
}

export function projectPlatformSummary(
  commissions: ResellerCommission[],
  nowMs: number
): PlatformSummary {
  const currentStart = nowMs - THIRTY_DAYS_MS;
  const previousStart = nowMs - 2 * THIRTY_DAYS_MS;
  const previousEnd = currentStart;
  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + DAY_MS;
  const monthStart = startOfUtcMonth(nowMs);

  let totalCur = 0;
  let totalPrev = 0;
  let todayMargin = 0;
  let monthMargin = 0;
  let pctSum = 0;
  let pctCount = 0;
  let rowCount = 0;

  for (const c of commissions) {
    if (c.status !== "paid") continue;
    const ts = new Date(c.createdAt).getTime();
    const margin = type1MarginOf(c);
    const inCurrent = ts >= currentStart && ts < nowMs + 1;
    const inPrevious = ts >= previousStart && ts < previousEnd;

    if (inCurrent) {
      totalCur += margin;
      rowCount += 1;
      if (c.atlasPrice > 0) {
        pctSum += (margin / c.atlasPrice) * 100;
        pctCount += 1;
      }
    } else if (inPrevious) {
      totalPrev += margin;
    }

    if (ts >= dayStart && ts < dayEnd) todayMargin += margin;
    if (ts >= monthStart) monthMargin += margin;
  }

  const avgMarginPercent =
    pctCount === 0 ? 0 : Math.round((pctSum / pctCount) * 10) / 10;

  return {
    totalMargin: Math.round(totalCur * 100) / 100,
    totalMarginDelta: computeDelta(totalCur, totalPrev),
    todayMargin: Math.round(todayMargin * 100) / 100,
    monthMargin: Math.round(monthMargin * 100) / 100,
    avgMarginPercent,
    rowCount,
  };
}

export interface PlatformTrendPoint {
  date: string;
  label: string;
  margin: number;
}

export function projectPlatformTrend(
  commissions: ResellerCommission[],
  nowMs: number
): PlatformTrendPoint[] {
  const points: PlatformTrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStartMs = nowMs - i * DAY_MS;
    const d = new Date(dayStartMs);
    const startUtc = Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate()
    );
    const endUtc = startUtc + DAY_MS;
    const label = d.toLocaleDateString("en-GH", {
      weekday: "short",
      timeZone: "UTC",
    });
    let sum = 0;
    for (const c of commissions) {
      if (c.status !== "paid") continue;
      const ts = new Date(c.createdAt).getTime();
      if (ts < startUtc) continue;
      if (ts >= endUtc) continue;
      sum += type1MarginOf(c);
    }
    points.push({
      date: new Date(startUtc).toISOString(),
      label,
      margin: Math.round(sum * 100) / 100,
    });
  }
  return points;
}

// ---------------------------------------------------------------------------
// Payout summary. Unchanged.
// ---------------------------------------------------------------------------

export interface PayoutSummary {
  pending: number;
  completed: number;
  failed: number;
  total: number;
}

export function projectPayoutSummary(payoutRuns: PayoutRun[]): PayoutSummary {
  let pending = 0;
  let completed = 0;
  let failed = 0;
  for (const p of payoutRuns) {
    if (p.status === "pending") pending += 1;
    else if (p.status === "completed") completed += 1;
    else if (p.status === "failed") failed += 1;
  }
  return { pending, completed, failed, total: payoutRuns.length };
}