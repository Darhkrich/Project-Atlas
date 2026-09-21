import type {
  MetricWithDelta,
  RegisteredDestination,
  ResellerCommissionsSummary,
  ResellerFundingLedgerEntry,
  ResellerLedgerRow,
  ResellerPendingWithdrawalRow,
  ResellerRefundableSource,
  ResellerWalletLedgerEntry,
  ResellerWalletStoreState,
  ResellerWalletSummary,
  ResellerWalletView,
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalRequest,
  WithdrawalAmountBounds,
} from "@/lib/reseller/types/wallet";
import type {
  WalletApprovalReason,
  WalletAutoApproveConfig,
  WalletFundingMethod,
} from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import {
  APPROVAL_REASON_LABEL,
  FUNDING_METHOD_LABEL,
  LEDGER_KIND_LABEL,
  LEDGER_KIND_VARIANT,
  WITHDRAWAL_KIND_LABEL,
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
  describeDestination,
  describeSource,
} from "./wallet-labels";
import { MIN_RESELLER_WITHDRAWAL_AMOUNT } from "./wallet-constants";

const THIRTY_DAYS_MS = 30 * 86_400_000;

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

function inWindow(iso: string, sinceMs: number, untilMs: number): boolean {
  const t = new Date(iso).getTime();
  return t >= sinceMs && t < untilMs;
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function projectWallet(
  state: ResellerWalletStoreState,
  resellerId: string
): ResellerWalletView | null {
  const record = state.wallets[resellerId];
  if (!record) return null;
  const pending = state.withdrawalRequests.filter(
    (r) => r.resellerId === resellerId
  );
  return {
    record,
    isFrozen: record.status === "frozen",
    hasPendingWithdrawals: pending.length > 0,
  };
}

function describeLedgerEntry(
  entry: ResellerWalletLedgerEntry,
  destination: RegisteredDestination | null
): { description: string; detail: string } {
  if (entry.kind === "funding") {
    return {
      description: entry.provider + " " + entry.maskedLabel,
      detail: entry.reference,
    };
  }
  if (entry.kind === "commission") {
    return {
      description: entry.relatedOrderId,
      detail:
        entry.service +
        " - " +
        entry.commissionRate +
        "% of GH\u20B5 " +
        entry.grossOrderValue.toFixed(2),
    };
  }
  if (entry.kind === "purchase") {
    return {
      description: entry.relatedOrderId,
      detail: entry.service,
    };
  }
  if (entry.kind === "adjustment") {
    return {
      description: entry.actor.name,
      detail: entry.reason,
    };
  }
  // withdrawal
  const kindLabel = WITHDRAWAL_KIND_LABEL[entry.withdrawalKind];
  if (entry.withdrawalKind === "refund_to_source") {
    return { description: kindLabel, detail: entry.withdrawalId };
  }
  return {
    description: kindLabel,
    detail: destination ? describeDestination(destination) : entry.withdrawalId,
  };
}

export function projectLedger(
  state: ResellerWalletStoreState,
  resellerId: string,
  destination: RegisteredDestination | null
): ResellerLedgerRow[] {
  const rows: ResellerLedgerRow[] = state.ledger
    .filter((e) => e.resellerId === resellerId)
    .map((entry) => {
      const { description, detail } = describeLedgerEntry(entry, destination);
      const base: ResellerLedgerRow = {
        id: entry.id,
        kind: entry.kind,
        kindLabel: LEDGER_KIND_LABEL[entry.kind],
        kindVariant: LEDGER_KIND_VARIANT[entry.kind],
        description,
        detail,
        amount: entry.kind === "adjustment" ? Math.abs(entry.amount) : entry.amount,
        createdAt: entry.createdAt,
        raw: entry,
      };
      if (entry.kind === "withdrawal") {
        base.fee = entry.fee;
        base.total = entry.total;
        base.status = entry.status;
        base.statusLabel = WITHDRAWAL_STATUS_LABEL[entry.status];
        base.statusVariant = WITHDRAWAL_STATUS_VARIANT[entry.status];
      }
      return base;
    });

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return rows;
}

export function projectFundingRows(
  state: ResellerWalletStoreState,
  resellerId: string
): ResellerLedgerRow[] {
  return projectLedger(state, resellerId, null).filter(
    (r) => r.kind === "funding"
  );
}

export function projectCommissionRows(
  state: ResellerWalletStoreState,
  resellerId: string
): ResellerLedgerRow[] {
  return projectLedger(state, resellerId, null).filter(
    (r) => r.kind === "commission"
  );
}

export function projectPendingWithdrawals(
  state: ResellerWalletStoreState,
  resellerId: string,
  destination: RegisteredDestination | null
): ResellerPendingWithdrawalRow[] {
  const requests = state.withdrawalRequests.filter(
    (r) => r.resellerId === resellerId
  );

  const rows: ResellerPendingWithdrawalRow[] = requests.map((req) => {
    const description =
      req.kind === "refund_to_source" &&
      req.sourceProvider &&
      req.sourceMaskedLabel
        ? describeSource(
            req.sourceMethodId ?? "momo",
            req.sourceProvider,
            req.sourceMaskedLabel
          )
        : req.destinationProvider && req.destinationMaskedLabel
        ? req.destinationProvider + " " + req.destinationMaskedLabel
        : destination
        ? describeDestination(destination)
        : "Unknown destination";

    return {
      id: req.id,
      kind: req.kind,
      kindLabel: WITHDRAWAL_KIND_LABEL[req.kind],
      amount: req.amount,
      fee: req.fee,
      total: req.total,
      description,
      status: req.status,
      statusLabel: WITHDRAWAL_STATUS_LABEL[req.status],
      statusVariant: WITHDRAWAL_STATUS_VARIANT[req.status],
      approvalReasons: req.approvalRequiredReasons,
      requestedAt: req.requestedAt,
      canCancel: req.status === "pending_admin",
      raw: req,
    };
  });

  rows.sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
  return rows;
}

export function projectWithdrawalHistory(
  state: ResellerWalletStoreState,
  resellerId: string
): ResellerWithdrawalHistoryEntry[] {
  return state.withdrawalHistory
    .filter((h) => h.resellerId === resellerId)
    .sort(
      (a, b) =>
        new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
    );
}

export function projectCommissionsSummary(
  state: ResellerWalletStoreState,
  resellerId: string,
  nowMs: number
): ResellerCommissionsSummary {
  const d = new Date(nowMs);
  const startOfMonth = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  let lifetime = 0;
  let thisMonth = 0;
  let count = 0;

  const commissions = state.ledger.filter(
    (e): e is Extract<ResellerWalletLedgerEntry, { kind: "commission" }> =>
      e.resellerId === resellerId && e.kind === "commission"
  );

  for (const e of commissions) {
    lifetime += e.amount;
    count += 1;
    if (new Date(e.createdAt).getTime() >= startOfMonth) {
      thisMonth += e.amount;
    }
  }

  const sorted = [...commissions].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const last = sorted[0];

  return {
    lifetimeTotal: Math.round(lifetime * 100) / 100,
    thisMonthTotal: Math.round(thisMonth * 100) / 100,
    lastCreditAmount: last ? last.amount : null,
    lastCreditOrderId: last ? last.relatedOrderId : null,
    lastCreditAt: last ? last.createdAt : null,
    creditCount: count,
  };
}

export function projectSummary(
  state: ResellerWalletStoreState,
  resellerId: string,
  nowMs: number
): ResellerWalletSummary {
  const currentStart = nowMs - THIRTY_DAYS_MS;
  const previousStart = nowMs - 2 * THIRTY_DAYS_MS;
  const previousEnd = currentStart;

  let depositsCur = 0;
  let depositsPrev = 0;
  let commissionsCur = 0;
  let commissionsPrev = 0;
  let spendCur = 0;
  let spendPrev = 0;
  let withdrawCur = 0;
  let withdrawPrev = 0;

  for (const e of state.ledger) {
    if (e.resellerId !== resellerId) continue;
    if (e.kind === "funding" && e.status === "successful") {
      if (inWindow(e.createdAt, currentStart, nowMs)) depositsCur += e.amount;
      else if (inWindow(e.createdAt, previousStart, previousEnd))
        depositsPrev += e.amount;
    }
    if (e.kind === "commission") {
      if (inWindow(e.createdAt, currentStart, nowMs)) commissionsCur += e.amount;
      else if (inWindow(e.createdAt, previousStart, previousEnd))
        commissionsPrev += e.amount;
    }
    if (e.kind === "purchase") {
      if (inWindow(e.createdAt, currentStart, nowMs)) spendCur += e.amount;
      else if (inWindow(e.createdAt, previousStart, previousEnd))
        spendPrev += e.amount;
    }
  }

  for (const h of state.withdrawalHistory) {
    if (h.resellerId !== resellerId) continue;
    if (h.status !== "completed") continue;
    if (inWindow(h.resolvedAt, currentStart, nowMs)) withdrawCur += h.amount;
    else if (inWindow(h.resolvedAt, previousStart, previousEnd))
      withdrawPrev += h.amount;
  }

  return {
    totalDeposits: computeDelta(depositsCur, depositsPrev).current,
    totalDepositsDelta: computeDelta(depositsCur, depositsPrev),
    totalCommissions: computeDelta(commissionsCur, commissionsPrev).current,
    totalCommissionsDelta: computeDelta(commissionsCur, commissionsPrev),
    totalSpend: computeDelta(spendCur, spendPrev).current,
    totalSpendDelta: computeDelta(spendCur, spendPrev),
    totalWithdrawn: computeDelta(withdrawCur, withdrawPrev).current,
    totalWithdrawnDelta: computeDelta(withdrawCur, withdrawPrev),
    currency: "GHS",
  };
}

export function deriveRefundableSources(
  state: ResellerWalletStoreState,
  resellerId: string
): ResellerRefundableSource[] {
  const fundingEntries = state.ledger.filter(
    (e): e is ResellerFundingLedgerEntry =>
      e.resellerId === resellerId &&
      e.kind === "funding" &&
      e.status === "successful"
  );

  const history = state.withdrawalHistory.filter(
    (h) => h.resellerId === resellerId
  );
  const pending = state.withdrawalRequests.filter(
    (r) => r.resellerId === resellerId
  );

  const out: ResellerRefundableSource[] = [];
  for (const entry of fundingEntries) {
    const fromHistory = history
      .filter(
        (h) =>
          h.kind === "refund_to_source" &&
          h.sourcePaymentId === entry.id &&
          (h.status === "completed" ||
            h.status === "pending_admin" ||
            h.status === "pending_processing")
      )
      .reduce((s, h) => s + h.amount, 0);

    const fromPending = pending
      .filter(
        (r) => r.kind === "refund_to_source" && r.sourcePaymentId === entry.id
      )
      .reduce((s, r) => s + r.amount, 0);

    const consumed = fromHistory + fromPending;
    const remaining = Math.max(0, entry.amount - consumed);

    out.push({
      entry,
      alreadyRefundedAmount: Math.round(consumed * 100) / 100,
      remainingAmount: Math.round(remaining * 100) / 100,
    });
  }
  return out;
}

export function deriveWithdrawAmountBounds(
  state: ResellerWalletStoreState,
  resellerId: string,
  config: WalletAutoApproveConfig,
  kind: "refund_to_source" | "cash_out_to_destination",
  source: ResellerRefundableSource | null
): WithdrawalAmountBounds {
  const wallet = state.wallets[resellerId];
  if (!wallet) {
    return { min: MIN_RESELLER_WITHDRAWAL_AMOUNT, max: 0, fee: 0, total: 0 };
  }

  const feeRate = config.feeRatePercent;

  let maxByConstraint: number;
  if (kind === "refund_to_source") {
    if (!source) {
      return { min: MIN_RESELLER_WITHDRAWAL_AMOUNT, max: 0, fee: 0, total: 0 };
    }
    maxByConstraint = source.remainingAmount;
  } else {
    // The balance is already net of pending withdrawals because the ledger
    // debits at request time. Do not subtract pending again.
    maxByConstraint = wallet.balance;
  }

  const maxByBalance =
    feeRate > 0 ? maxByConstraint / (1 + feeRate / 100) : maxByConstraint;
  const max = Math.max(
    0,
    Math.floor(Math.min(maxByConstraint, maxByBalance) * 100) / 100
  );
  const { fee, total } = computeWithdrawalTotal(max, feeRate);
  return {
    min: MIN_RESELLER_WITHDRAWAL_AMOUNT,
    max,
    fee,
    total,
  };
}

export function requiresAdminApproval(
  total: number,
  config: WalletAutoApproveConfig
): boolean {
  return total > config.thresholdGHS;
}

// Counts today's withdrawals across both pending requests and history
// entries. Fixes the earlier version which only counted pending.
export function approximateDailyCount(
  state: ResellerWalletStoreState,
  resellerId: string,
  nowMs: number
): number {
  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + 86_400_000;

  let count = 0;
  for (const r of state.withdrawalRequests) {
    if (r.resellerId !== resellerId) continue;
    const t = new Date(r.requestedAt).getTime();
    if (t >= dayStart && t < dayEnd) count += 1;
  }
  for (const h of state.withdrawalHistory) {
    if (h.resellerId !== resellerId) continue;
    const t = new Date(h.requestedAt).getTime();
    if (t >= dayStart && t < dayEnd) count += 1;
  }
  return count;
}

export function evaluateApprovalReasons(
  state: ResellerWalletStoreState,
  resellerId: string,
  total: number,
  nowMs: number
): WalletApprovalReason[] {
  const wallet = state.wallets[resellerId];
  if (!wallet) return [];

  const config = { thresholdGHS: 5000, feeRatePercent: 0.5, dailyCap: 2 };
  // Config is read by the caller and passed in; this function is kept for
  // compatibility. See wallet-mutations for the authoritative path.
  void config;

  const reasons: WalletApprovalReason[] = [];
  if (total > wallet.balance) reasons.push("insufficient_balance");
  if (wallet.status === "frozen") reasons.push("owner_suspended");
  return reasons;
}

export function fundingMethodLabel(method: WalletFundingMethod): string {
  return FUNDING_METHOD_LABEL[method];
}

export function withdrawalRequestAmount(
  request: ResellerWithdrawalRequest
): number {
  return request.amount;
}

export function approvalReasonLabel(
  reason: WalletApprovalReason
): string {
  return APPROVAL_REASON_LABEL[reason];
}