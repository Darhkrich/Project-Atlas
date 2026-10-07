// lib/domains/wallet/merchant-money/projection.ts

import type {
  WalletAutoApproveConfig,
  WalletApprovalReason,
} from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import {
  MERCHANT_LEDGER_KIND_LABEL,
  MERCHANT_LEDGER_KIND_VARIANT,
  MERCHANT_WITHDRAWAL_STATUS_LABEL,
  MERCHANT_WITHDRAWAL_STATUS_VARIANT,
} from "./labels";
import { MIN_MERCHANT_WITHDRAWAL_AMOUNT } from "./constants";
import type {
  AutoApproveEvaluation,
  MerchantBillingSummary,
  MerchantLedgerRow,
  MerchantMainSummary,
  MerchantPendingWithdrawalRow,
  MerchantWalletLedgerEntry,
  MerchantWalletQuickStats,
  MerchantWalletState,
  MerchantWalletType,
  MerchantWalletView,
  MerchantWithdrawalHistoryEntry,
  WithdrawalAmountBounds,
} from "./types";

const THIRTY_DAYS_MS = 30 * 86_400_000;

function computeDelta(
  current: number,
  previous: number
): {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
} {
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

function inWindow(iso: string, sinceMs: number, untilMs: number): boolean {
  const t = new Date(iso).getTime();
  return t >= sinceMs && t < untilMs;
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function projectWalletView(
  state: MerchantWalletState
): MerchantWalletView {
  const billingFrozen = state.billing.status === "frozen";
  const mainFrozen = state.main.status === "frozen";
  return {
    billing: state.billing,
    main: state.main,
    isFrozen: billingFrozen || mainFrozen,
    billingFrozen,
    mainFrozen,
  };
}

function describeLedgerEntry(entry: MerchantWalletLedgerEntry): {
  description: string;
  detail: string;
} {
  if (entry.kind === "funding") {
    return {
      description: entry.provider + " " + entry.maskedLabel,
      detail: entry.reference,
    };
  }
  if (entry.kind === "customer_payment") {
    return {
      description: entry.relatedOrderNumber,
      detail: entry.paymentProvider
        ? entry.paymentMethod + " via " + entry.paymentProvider
        : entry.paymentMethod,
    };
  }
  if (entry.kind === "plan_charge") {
    return {
      description: entry.planCode + " plan - " + entry.billingCycle,
      detail:
        entry.status === "failed" && entry.failureReason
          ? "Failed: " + entry.failureReason
          : "Source: " + entry.source,
    };
  }
  if (entry.kind === "refund") {
    return {
      description: entry.relatedOrderNumber,
      detail: entry.reason,
    };
  }
  if (entry.kind === "withdrawal") {
    return {
      description: "Withdrawal " + entry.withdrawalId,
      detail: entry.destinationSummary,
    };
  }
  if (entry.kind === "adjustment") {
    return {
      description: "Admin adjustment",
      detail: entry.reason,
    };
  }
  return {
    description:
      entry.kind === "transfer_in" ? "Transfer in" : "Transfer out",
    detail:
      "From " + entry.counterpartyWalletType + " - " + entry.transferRef,
  };
}

function isCreditKind(kind: MerchantWalletLedgerEntry["kind"]): boolean {
  return (
    kind === "funding" ||
    kind === "customer_payment" ||
    kind === "transfer_in"
  );
}

export function projectLedgerRows(
  state: MerchantWalletState,
  walletType: MerchantWalletType
): MerchantLedgerRow[] {
  const rows: MerchantLedgerRow[] = state.ledger
    .filter((e) => e.walletType === walletType)
    .map((entry) => {
      const { description, detail } = describeLedgerEntry(entry);
      const credit = isCreditKind(entry.kind);
      const row: MerchantLedgerRow = {
        merchantId: state.billing.merchantId,
        merchantName: state.billing.merchantName,
        id: entry.id,
        walletType: entry.walletType,
        kind: entry.kind,
        kindLabel: MERCHANT_LEDGER_KIND_LABEL[entry.kind],
        kindVariant: MERCHANT_LEDGER_KIND_VARIANT[entry.kind],
        description,
        detail,
        direction: credit ? "credit" : "debit",
        amount: entry.amount,
        createdAt: entry.createdAt,
        raw: entry,
      };
      if (entry.kind === "withdrawal") {
        row.fee = entry.fee;
        row.total = entry.total;
        row.status = MERCHANT_WITHDRAWAL_STATUS_LABEL[entry.status];
        row.statusVariant = MERCHANT_WITHDRAWAL_STATUS_VARIANT[entry.status];
      }
      if (entry.kind === "plan_charge") {
        row.status =
          entry.status === "successful"
            ? "Successful"
            : entry.status === "failed"
            ? "Failed"
            : "Processing";
        row.statusVariant =
          entry.status === "successful"
            ? "success"
            : entry.status === "failed"
            ? "danger"
            : "warning";
      }
      if (entry.kind === "funding") {
        row.status =
          entry.status === "successful"
            ? "Successful"
            : entry.status === "failed"
            ? "Failed"
            : "Processing";
        row.statusVariant =
          entry.status === "successful"
            ? "success"
            : entry.status === "failed"
            ? "danger"
            : "warning";
      }
      if (entry.kind === "refund") {
        row.status = entry.settledAt ? "Settled" : "Processing";
        row.statusVariant = entry.settledAt ? "success" : "warning";
      }
      return row;
    });
  rows.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return rows;
}

export function projectAllLedgerRows(
  state: MerchantWalletState
): MerchantLedgerRow[] {
  const all: MerchantLedgerRow[] = [];
  all.push(...projectLedgerRows(state, "main"));
  all.push(...projectLedgerRows(state, "billing"));
  all.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return all;
}

export function projectPendingWithdrawals(
  state: MerchantWalletState
): MerchantPendingWithdrawalRow[] {
  const rows: MerchantPendingWithdrawalRow[] = state.withdrawalRequests.map(
    (req) => ({
      id: req.id,
      amount: req.amount,
      fee: req.fee,
      total: req.total,
      destination:
        req.destinationProvider + " " + req.destinationMaskedLabel,
      status: req.status,
      statusLabel: MERCHANT_WITHDRAWAL_STATUS_LABEL[req.status],
      statusVariant: MERCHANT_WITHDRAWAL_STATUS_VARIANT[req.status],
      approvalReasons: req.approvalRequiredReasons,
      requestedAt: req.requestedAt,
      canCancel: req.status === "pending_admin",
      raw: req,
    })
  );
  rows.sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
  return rows;
}

export function projectWithdrawalHistory(
  state: MerchantWalletState
): MerchantWithdrawalHistoryEntry[] {
  return [...state.withdrawalHistory].sort(
    (a, b) =>
      new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
  );
}

export function projectQuickStats(
  state: MerchantWalletState,
  nowMs: number
): MerchantWalletQuickStats {
  const currentStart = nowMs - THIRTY_DAYS_MS;
  const previousStart = nowMs - 2 * THIRTY_DAYS_MS;
  const previousEnd = currentStart;

  let fundedCur = 0;
  let fundedPrev = 0;
  let custPayCur = 0;
  let custPayPrev = 0;
  let planChargeCur = 0;
  let planChargePrev = 0;
  let withdrawCur = 0;
  let withdrawPrev = 0;

  for (const e of state.ledger) {
    if (e.kind === "funding" && e.status === "successful") {
      if (inWindow(e.createdAt, currentStart, nowMs)) fundedCur += e.amount;
      else if (inWindow(e.createdAt, previousStart, previousEnd))
        fundedPrev += e.amount;
    }
    if (e.kind === "customer_payment") {
      if (inWindow(e.createdAt, currentStart, nowMs)) custPayCur += e.amount;
      else if (inWindow(e.createdAt, previousStart, previousEnd))
        custPayPrev += e.amount;
    }
    if (e.kind === "plan_charge" && e.status === "successful") {
      if (inWindow(e.createdAt, currentStart, nowMs))
        planChargeCur += e.amount;
      else if (inWindow(e.createdAt, previousStart, previousEnd))
        planChargePrev += e.amount;
    }
  }

  for (const h of state.withdrawalHistory) {
    if (h.status !== "completed") continue;
    if (inWindow(h.resolvedAt, currentStart, nowMs))
      withdrawCur += h.amount;
    else if (inWindow(h.resolvedAt, previousStart, previousEnd))
      withdrawPrev += h.amount;
  }

  return {
    totalFunded: computeDelta(fundedCur, fundedPrev).current,
    totalFundedDelta: computeDelta(fundedCur, fundedPrev),
    totalCustomerPayments: computeDelta(custPayCur, custPayPrev).current,
    totalCustomerPaymentsDelta: computeDelta(custPayCur, custPayPrev),
    totalPlanCharges: computeDelta(planChargeCur, planChargePrev).current,
    totalPlanChargesDelta: computeDelta(planChargeCur, planChargePrev),
    totalWithdrawn: computeDelta(withdrawCur, withdrawPrev).current,
    totalWithdrawnDelta: computeDelta(withdrawCur, withdrawPrev),
    currency: "GHS",
  };
}

export function projectBillingSummary(
  state: MerchantWalletState,
  autoPayEnabled: boolean,
  autoPaySource: "card" | "billing_wallet"
): MerchantBillingSummary {
  const planCharges = state.ledger
    .filter(
      (e): e is Extract<
        MerchantWalletLedgerEntry,
        { kind: "plan_charge" }
      > => e.kind === "plan_charge"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const lastSuccessful = planCharges.find((c) => c.status === "successful");
  const last = planCharges[0];
  const pastDueCount = planCharges.filter((c) => c.status === "failed").length;

  let nextChargeAmount: number | null = null;
  let nextChargeDate: string | null = null;
  if (lastSuccessful) {
    nextChargeAmount = lastSuccessful.amount;
    const cycleDays = lastSuccessful.billingCycle === "annual" ? 365 : 30;
    const lastMs = new Date(lastSuccessful.createdAt).getTime();
    nextChargeDate = new Date(lastMs + cycleDays * 86_400_000).toISOString();
  }

  return {
    nextChargeAmount,
    nextChargeDate,
    lastChargeAmount: last ? last.amount : null,
    lastChargeAt: last ? last.createdAt : null,
    lastChargeStatus: last ? last.status : null,
    pastDueCount,
    autoPayEnabled,
    autoPaySource,
  };
}

export function projectMainSummary(
  state: MerchantWalletState
): MerchantMainSummary {
  const payments = state.ledger
    .filter(
      (e): e is Extract<
        MerchantWalletLedgerEntry,
        { kind: "customer_payment" }
      > => e.kind === "customer_payment"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const refunds = state.ledger.filter(
    (e): e is Extract<
      MerchantWalletLedgerEntry,
      { kind: "refund" }
    > => e.kind === "refund" && !e.settledAt
  );

  return {
    lastCustomerPaymentAmount: payments[0]?.amount ?? null,
    lastCustomerPaymentAt: payments[0]?.createdAt ?? null,
    pendingRefundCount: refunds.length,
    pendingRefundAmount: refunds.reduce((s, r) => s + r.amount, 0),
    customerPaymentCount: payments.length,
  };
}

export function deriveWithdrawAmountBounds(
  state: MerchantWalletState,
  config: WalletAutoApproveConfig
): WithdrawalAmountBounds {
  const available = Math.max(0, state.main.balance);
  const feeRate = config.feeRatePercent;
  const maxByBalance =
    feeRate > 0 ? available / (1 + feeRate / 100) : available;
  const max = Math.max(0, Math.floor(maxByBalance * 100) / 100);
  const { fee, total } = computeWithdrawalTotal(max, feeRate);
  return {
    min: MIN_MERCHANT_WITHDRAWAL_AMOUNT,
    max,
    fee,
    total,
  };
}

function countWithdrawalsToday(
  state: MerchantWalletState,
  nowMs: number
): number {
  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + 86_400_000;
  let count = 0;
  for (const r of state.withdrawalRequests) {
    if (r.status === "rejected" || r.status === "failed") continue;
    const t = new Date(r.requestedAt).getTime();
    if (t >= dayStart && t < dayEnd) count += 1;
  }
  for (const h of state.withdrawalHistory) {
    if (h.status === "rejected" || h.status === "failed") continue;
    const t = new Date(h.requestedAt).getTime();
    if (t >= dayStart && t < dayEnd) count += 1;
  }
  return count;
}

export function evaluateAutoApprove(
  state: MerchantWalletState,
  amount: number,
  fee: number,
  config: WalletAutoApproveConfig,
  nowMs: number
): AutoApproveEvaluation {
  const total = amount + fee;

  if (state.main.balance < total) {
    return { outcome: "fails_balance", reasons: [] };
  }

  const reasons: WalletApprovalReason[] = [];

  if (total > config.thresholdGHS) {
    reasons.push("exceeds_threshold");
  }

  if (state.destination?.pendingChange) {
    reasons.push("detail_change_pending");
  }

  if (countWithdrawalsToday(state, nowMs) >= config.dailyCap) {
    reasons.push("daily_cap_reached");
  }

  if (reasons.length > 0) {
    return { outcome: "requires_approval", reasons };
  }

  return { outcome: "auto_approved", reasons: [] };
}