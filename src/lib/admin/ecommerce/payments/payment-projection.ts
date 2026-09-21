import type { Merchant } from "@/lib/admin/types/merchant";
import type {
  ApprovalRequiredReason,
  AutoApproveEvaluation,
  CheckoutEvent,
  LedgerRow,
  MerchantMoneyState,
  PaymentsSummary,
  PlanChargeEvent,
  RefundEvent,
  WithdrawalQueueRow,
  WithdrawalRequest,
} from "@/lib/admin/types/merchant-money";
import {
  CHECKOUT_METHOD_LABELS,
  CHECKOUT_STATUS_LABELS,
  CHECKOUT_STATUS_VARIANT,
  PLAN_CHARGE_SOURCE_LABELS,
  PLAN_CHARGE_STATUS_LABELS,
  PLAN_CHARGE_STATUS_VARIANT,
  REFUND_RAIL_LABELS,
  REFUND_STATUS_LABELS,
  REFUND_STATUS_VARIANT,
  WITHDRAWAL_STATUS_LABELS,
  WITHDRAWAL_STATUS_VARIANT,
} from "./payments-labels";

function nameFor(id: string, map: Map<string, Merchant>): string {
  return map.get(id)?.businessName ?? id;
}

function statusFor(id: string, map: Map<string, Merchant>): string {
  return map.get(id)?.merchantStatus ?? "unknown";
}

function planChargeRow(
  event: PlanChargeEvent,
  map: Map<string, Merchant>
): LedgerRow {
  return {
    id: event.id,
    kind: "plan_charge",
    merchantId: event.merchantId,
    merchantName: nameFor(event.merchantId, map),
    merchantStatus: statusFor(event.merchantId, map),
    amount: event.amount,
    statusLabel: PLAN_CHARGE_STATUS_LABELS[event.status],
    statusVariant: PLAN_CHARGE_STATUS_VARIANT[event.status],
    sourceLabel: PLAN_CHARGE_SOURCE_LABELS[event.source],
    sourceRef: event.transactionRef,
    createdAt: event.createdAt,
    raw: event,
  };
}

function checkoutRow(
  event: CheckoutEvent,
  map: Map<string, Merchant>
): LedgerRow {
  return {
    id: event.id,
    kind: "checkout",
    merchantId: event.merchantId,
    merchantName: nameFor(event.merchantId, map),
    merchantStatus: statusFor(event.merchantId, map),
    amount: event.amount,
    statusLabel: CHECKOUT_STATUS_LABELS[event.status],
    statusVariant: CHECKOUT_STATUS_VARIANT[event.status],
    sourceLabel: CHECKOUT_METHOD_LABELS[event.method] ?? event.method,
    sourceRef: event.transactionRef,
    createdAt: event.createdAt,
    raw: event,
  };
}

function withdrawalRow(
  event: WithdrawalRequest,
  map: Map<string, Merchant>
): LedgerRow {
  return {
    id: event.id,
    kind: "withdrawal",
    merchantId: event.merchantId,
    merchantName: nameFor(event.merchantId, map),
    merchantStatus: statusFor(event.merchantId, map),
    amount: event.amount,
    fee: event.fee,
    total: event.total,
    statusLabel: WITHDRAWAL_STATUS_LABELS[event.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANT[event.status],
    sourceLabel:
      event.destinationSnapshot.provider +
      " " +
      event.destinationSnapshot.maskedAccount,
    sourceRef: event.transactionRef,
    createdAt: event.createdAt,
    raw: event,
  };
}

function refundRow(event: RefundEvent, map: Map<string, Merchant>): LedgerRow {
  const settled = Boolean(event.settledAt);
  return {
    id: event.id,
    kind: "refund",
    merchantId: event.merchantId,
    merchantName: nameFor(event.merchantId, map),
    merchantStatus: statusFor(event.merchantId, map),
    amount: event.amount,
    statusLabel: settled
      ? REFUND_STATUS_LABELS.settled
      : REFUND_STATUS_LABELS.processing,
    statusVariant: settled
      ? REFUND_STATUS_VARIANT.settled
      : REFUND_STATUS_VARIANT.processing,
    sourceLabel: REFUND_RAIL_LABELS[event.customerRail],
    sourceRef: event.originalPaymentId,
    createdAt: event.createdAt,
    raw: event,
  };
}

export function projectLedger(
  state: MerchantMoneyState,
  merchants: Merchant[]
): LedgerRow[] {
  const map = new Map(merchants.map((m) => [m.id, m] as const));
  const rows: LedgerRow[] = [
    ...state.planCharges.map((e) => planChargeRow(e, map)),
    ...state.checkouts.map((e) => checkoutRow(e, map)),
    ...state.withdrawals.map((e) => withdrawalRow(e, map)),
    ...state.refunds.map((e) => refundRow(e, map)),
  ];
  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return rows;
}

export function projectWithdrawalQueue(
  state: MerchantMoneyState,
  merchants: Merchant[]
): WithdrawalQueueRow[] {
  const map = new Map(merchants.map((m) => [m.id, m] as const));
  const rows: WithdrawalQueueRow[] = state.withdrawals.map((w) => {
    const dest = state.destinations[w.merchantId];
    return {
      id: w.id,
      merchantId: w.merchantId,
      merchantName: nameFor(w.merchantId, map),
      amount: w.amount,
      fee: w.fee,
      total: w.total,
      destinationLabel: dest ? dest.provider + " " + dest.method : "unknown",
      destinationProvider: dest?.provider ?? "unknown",
      destinationMasked: w.destinationSnapshot.maskedAccount,
      destinationVerified: Boolean(dest?.verifiedAt) && !dest?.pendingChange,
      destinationPendingChange: Boolean(dest?.pendingChange),
      approvalRequiredReasons: w.approvalRequiredReasons,
      status: w.status,
      statusLabel: WITHDRAWAL_STATUS_LABELS[w.status],
      statusVariant: WITHDRAWAL_STATUS_VARIANT[w.status],
      autoApproved: w.autoApproved,
      createdAt: w.createdAt,
      raw: w,
    };
  });
  rows.sort((a, b) => {
    const aP = a.status === "pending_admin" ? 0 : 1;
    const bP = b.status === "pending_admin" ? 0 : 1;
    if (aP !== bP) return aP - bP;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return rows;
}
function computeDelta(current: number, previous: number): MetricWithDelta {
  const diff = current - previous;
  let direction: "up" | "down" | "flat" = "flat";
  if (diff > 0) direction = "up";
  else if (diff < 0) direction = "down";
  const changePct = previous === 0 ? null : (diff / previous) * 100;
  return { current, previous, changePct, direction };
}

export function projectSummary(
  state: MerchantMoneyState,
  sinceMs: number,
  nowMs: number
): PaymentsSummary {
  const windowMs = Math.max(0, nowMs - sinceMs);
  const hasPrevWindow = sinceMs > 0 && windowMs > 0;
  const prevSinceMs = hasPrevWindow ? sinceMs - windowMs : sinceMs;
  const prevUntilMs = sinceMs;

  const inRange = (iso: string, since: number, until: number) => {
    const t = new Date(iso).getTime();
    return t >= since && t < until;
  };
  const inCurrent = (iso: string) => inRange(iso, sinceMs, nowMs + 1);
  const inPrev = (iso: string) =>
    hasPrevWindow && inRange(iso, prevSinceMs, prevUntilMs);

  const countedStatuses: WithdrawalRequest["status"][] = [
    "pending_processing",
    "completed",
  ];

  const currentRevenueWithdrawals = state.withdrawals.filter(
    (w) => countedStatuses.includes(w.status) && inCurrent(w.createdAt)
  );
  const prevRevenueWithdrawals = state.withdrawals.filter(
    (w) => countedStatuses.includes(w.status) && inPrev(w.createdAt)
  );

  const atlasRevenue = computeDelta(
    currentRevenueWithdrawals.reduce((s, w) => s + w.fee, 0),
    prevRevenueWithdrawals.reduce((s, w) => s + w.fee, 0)
  );

  const withdrawalVolume = computeDelta(
    currentRevenueWithdrawals.reduce((s, w) => s + w.amount, 0),
    prevRevenueWithdrawals.reduce((s, w) => s + w.amount, 0)
  );

  const currentPending = state.withdrawals.filter(
    (w) => w.status === "pending_admin"
  );
  const sortedPending = [...currentPending].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const prevPendingCount = state.withdrawals.filter(
    (w) => w.status === "pending_admin" && inPrev(w.createdAt)
  ).length;

  const pendingApprovals = computeDelta(
    currentPending.length,
    prevPendingCount
  );

  const currentSuccessfulCharges = state.planCharges.filter(
    (p) => p.status === "successful" && inCurrent(p.createdAt)
  );
  const prevSuccessfulCharges = state.planCharges.filter(
    (p) => p.status === "successful" && inPrev(p.createdAt)
  );
  const planCharges = computeDelta(
    currentSuccessfulCharges.reduce((s, p) => s + p.amount, 0),
    prevSuccessfulCharges.reduce((s, p) => s + p.amount, 0)
  );

  const pastDuePlanCount = state.planCharges.filter(
    (p) => p.status === "failed" && inCurrent(p.createdAt)
  ).length;

  const failedPlanCur = state.planCharges.filter(
    (p) => p.status === "failed" && inCurrent(p.createdAt)
  ).length;
  const failedCheckoutCur = state.checkouts.filter(
    (c) => c.status === "failed" && inCurrent(c.createdAt)
  ).length;
  const failedWithdrawalCur = state.withdrawals.filter(
    (w) => w.status === "failed" && inCurrent(w.createdAt)
  ).length;
  const failedPlanPrev = state.planCharges.filter(
    (p) => p.status === "failed" && inPrev(p.createdAt)
  ).length;
  const failedCheckoutPrev = state.checkouts.filter(
    (c) => c.status === "failed" && inPrev(c.createdAt)
  ).length;
  const failedWithdrawalPrev = state.withdrawals.filter(
    (w) => w.status === "failed" && inPrev(w.createdAt)
  ).length;

  const failedEvents = computeDelta(
    failedPlanCur + failedCheckoutCur + failedWithdrawalCur,
    failedPlanPrev + failedCheckoutPrev + failedWithdrawalPrev
  );

  const withdrawalsByStatus = {
    completed: state.withdrawals.filter(
      (w) => w.status === "completed" && inCurrent(w.createdAt)
    ).length,
    processing: state.withdrawals.filter(
      (w) => w.status === "pending_processing" && inCurrent(w.createdAt)
    ).length,
    failed: failedWithdrawalCur,
  };

  return {
    atlasRevenue,
    atlasRevenueFeePercent: state.config.feeRatePercent,
    atlasRevenueWithdrawalCount: currentRevenueWithdrawals.length,

    pendingApprovals,
    pendingOldestIso: sortedPending[0]?.createdAt ?? null,

    withdrawalVolume,
    withdrawalCount: currentRevenueWithdrawals.length,
    withdrawalsByStatus,

    planCharges,
    planChargeCount: currentSuccessfulCharges.length,
    pastDuePlanCount,

    failedEvents,
    failedBreakdown: {
      plan: failedPlanCur,
      checkout: failedCheckoutCur,
      withdrawal: failedWithdrawalCur,
    },
  };
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function evaluateAutoApprove(
  input: { merchantId: string; amount: number; fee: number },
  state: MerchantMoneyState,
  nowMs: number
): AutoApproveEvaluation {
  const total = input.amount + input.fee;

  const wallet = state.wallets[input.merchantId];
  const mainBalance = wallet?.main.balance ?? 0;

  if (mainBalance < total) {
    return { outcome: "fails_balance", reasons: [] };
  }

  const reasons: ApprovalRequiredReason[] = [];

  if (total > state.config.thresholdGHS) {
    reasons.push("exceeds_threshold");
  }

  const dest = state.destinations[input.merchantId];
  if (dest?.pendingChange) {
    reasons.push("destination_change_pending");
  }

  const openDisputes = state.disputes.filter(
    (d) => d.merchantId === input.merchantId && d.status === "open"
  );
  if (openDisputes.length > 0) {
    reasons.push("open_dispute");
  }

  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + 86_400_000;
  const sameDayCount = state.withdrawals.filter((w) => {
    if (w.merchantId !== input.merchantId) return false;
    if (w.status === "rejected" || w.status === "failed") return false;
    const t = new Date(w.createdAt).getTime();
    return t >= dayStart && t < dayEnd;
  }).length;
  if (sameDayCount >= state.config.dailyCap) {
    reasons.push("daily_cap_reached");
  }

  if (reasons.length > 0) {
    return { outcome: "requires_approval", reasons };
  }

  return { outcome: "auto_approved", reasons: [] };
}