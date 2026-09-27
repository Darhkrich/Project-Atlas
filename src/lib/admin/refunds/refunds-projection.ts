export interface RefundsTreasurySnapshot {
  balance: number;
  currency: "GHS";
  settlements?: unknown[];
}
import type {
  Refund,
  RefundAudience,
  RefundLedgerFilters,
  RefundReason,
  RefundStatus,
  RefundSummary,
  RefundType,
  RiskBand,
} from "@/lib/admin/types/refund";
import { REFUND_STATUS_ORDER } from "./refunds-constants";
import {
  REFUND_STATUS_LABELS,
  reasonLabel,
} from "./refunds-labels";
import {
  deriveRiskBand,
  isTodayUtc,
  isUtcDayAgo,
  refundedAmount,
} from "./refunds-helpers";

export interface RefundLedgerRow {
  id: string;
  type: RefundType;
  audience: RefundAudience;
  status: RefundStatus;
  statusLabel: string;
  orderId: string;
  customerName: string;
  resellerName: string | null;
  amount: number;
  refundedAmount: number;
  reason: RefundReason;
  reasonLabel: string;
  riskBand: RiskBand;
  requestedAt: string;
  isOverdue: boolean;
}

export interface RefundPipelineStage {
  status: RefundStatus;
  label: string;
  count: number;
  amount: number;
}

export interface RefundPipelineView {
  stages: RefundPipelineStage[];
}

function matchesSearch(row: RefundLedgerRow, term: string): boolean {
  const needle = term.toLowerCase();
  if (row.id.toLowerCase().includes(needle)) return true;
  if (row.orderId.toLowerCase().includes(needle)) return true;
  if (row.customerName.toLowerCase().includes(needle)) return true;
  if (row.resellerName && row.resellerName.toLowerCase().includes(needle))
    return true;
  return false;
}

export function projectRefundRows(
  refunds: Refund[],
  nowMs: number
): RefundLedgerRow[] {
  const overdueCutoffMs = nowMs - 24 * 60 * 60 * 1000;

  return refunds.map((refund) => ({
    id: refund.id,
    type: refund.type,
    audience: refund.audience,
    status: refund.status,
    statusLabel: REFUND_STATUS_LABELS[refund.status],
    orderId: refund.order.orderId,
    customerName: refund.customer.name,
    resellerName: refund.reseller?.name ?? null,
    amount: refund.amount,
    refundedAmount: refundedAmount(refund),
    reason: refund.reason,
    reasonLabel: reasonLabel(refund.reason),
    riskBand: deriveRiskBand(refund.customerHistory),
    requestedAt: refund.requestedAt,
    isOverdue:
      refund.status === "pending_admin" &&
      new Date(refund.requestedAt).getTime() < overdueCutoffMs,
  }));
}

export function filterRefunds(
  rows: RefundLedgerRow[],
  filters: RefundLedgerFilters
): RefundLedgerRow[] {
  return rows.filter((row) => {
    if (filters.search && !matchesSearch(row, filters.search)) return false;
    if (filters.type && row.type !== filters.type) return false;
    if (filters.audience && row.audience !== filters.audience) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.reason && row.reason !== filters.reason) return false;
    if (filters.dateFrom) {
      const fromMs = new Date(filters.dateFrom + "T00:00:00Z").getTime();
      if (new Date(row.requestedAt).getTime() < fromMs) return false;
    }
    if (filters.dateTo) {
      const toMs = new Date(filters.dateTo + "T23:59:59Z").getTime();
      if (new Date(row.requestedAt).getTime() > toMs) return false;
    }
    return true;
  });
}

export function projectRefundsSummary(
  refunds: Refund[],
  treasury: RefundsTreasurySnapshot,
  nowMs: number
): RefundSummary {
  let volumeToday = 0;
  let volumeYesterday = 0;
  let countToday = 0;
  let countYesterday = 0;
  let awaitingApprovalCount = 0;
  let awaitingApprovalYesterday = 0;
  let failedToday = 0;
  let failedYesterday = 0;

  for (const refund of refunds) {
    if (isTodayUtc(refund.requestedAt, nowMs)) {
      countToday += 1;
      if (refund.status === "failed") failedToday += 1;
    } else if (isUtcDayAgo(refund.requestedAt, nowMs, 1)) {
      countYesterday += 1;
      if (refund.status === "failed") failedYesterday += 1;
    }

    if (refund.status === "pending_admin") {
      awaitingApprovalCount += 1;
      if (isUtcDayAgo(refund.requestedAt, nowMs, 1)) {
        awaitingApprovalYesterday += 1;
      }
    }

    for (const settlement of refund.settlements) {
      if (isTodayUtc(settlement.settledAt, nowMs)) {
        volumeToday += settlement.amount;
      } else if (isUtcDayAgo(settlement.settledAt, nowMs, 1)) {
        volumeYesterday += settlement.amount;
      }
    }
  }

  return {
    volumeToday: Math.round(volumeToday * 100) / 100,
    volumeYesterday: Math.round(volumeYesterday * 100) / 100,
    countToday,
    countYesterday,
    awaitingApprovalCount,
    awaitingApprovalYesterday,
    failedToday,
    failedYesterday,
    treasuryBalance: treasury.balance,
  };
}

export function projectRefundsPipeline(
  refunds: Refund[]
): RefundPipelineView {
  const stages: RefundPipelineStage[] = REFUND_STATUS_ORDER.map((status) => {
    const matching = refunds.filter((r) => r.status === status);
    return {
      status,
      label: REFUND_STATUS_LABELS[status],
      count: matching.length,
      amount:
        Math.round(
          matching.reduce((sum, r) => sum + r.amount, 0) * 100
        ) / 100,
    };
  });
  return { stages };
}