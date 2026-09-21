import type {
  StorefrontRefundHistoryEntry,
  StorefrontRefundLedgerEntry,
  StorefrontRefundRequest,
  StorefrontRefundableSource,
} from "./storefront-user-types";
import type {
  WalletApprovalReason,
  WalletFundingMethod,
} from "./enums";
import { computeWithdrawalTotal } from "./fee";
import {
  getStorefrontUserState,
  internalAddStorefrontRefundHistory,
  internalAddStorefrontRefundRequest,
  internalAppendStorefrontLedgerEntry,
  internalPatchStorefrontUserWallet,
  internalRemoveStorefrontRefundRequest,
} from "./storefront-user-state";
import { getStorefrontWallet } from "./storefront-user-wallet-mutations";

export interface StorefrontRefundActor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storefrontId: string;
  resellerSlug: string;
  storefrontName: string;
}

export interface StorefrontAdminActor {
  id: string;
  name: string;
  email: string;
}

export interface StorefrontRefundResult {
  ok: boolean;
  error?: string;
  reference?: string;
  requiresApproval?: boolean;
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function requestsTodayCount(
  requests: StorefrontRefundRequest[],
  walletId: string
): number {
  const dayStart = startOfUtcDay(Date.now());
  const dayEnd = dayStart + 86_400_000;
  return requests.filter((r) => {
    if (r.walletId !== walletId) return false;
    const t = new Date(r.requestedAt).getTime();
    return t >= dayStart && t < dayEnd;
  }).length;
}

export function deriveRefundableSourcesForWallet(
  walletId: string
): StorefrontRefundableSource[] {
  const state = getStorefrontUserState();
  const funding = state.fundingLedger.filter(
    (e): e is Extract<typeof e, { kind: "funding" }> =>
      e.walletId === walletId && e.kind === "funding" && e.status === "successful"
  );

  const out: StorefrontRefundableSource[] = [];
  for (const entry of funding) {
    const fromHistory = state.refundHistory
      .filter(
        (h) =>
          h.walletId === walletId &&
          h.sourcePaymentId === entry.id &&
          (h.status === "completed" ||
            h.status === "pending_admin" ||
            h.status === "pending_processing")
      )
      .reduce((s, h) => s + h.amount, 0);

    const fromPending = state.refundRequests
      .filter((r) => r.walletId === walletId && r.sourcePaymentId === entry.id)
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

export interface CreateStorefrontRefundInput {
  walletId: string;
  sourcePaymentId: string;
  amount: number;
}

export function createStorefrontRefund(
  input: CreateStorefrontRefundInput,
  actor: StorefrontRefundActor
): StorefrontRefundResult {
  const state = getStorefrontUserState();
  const wallet = getStorefrontWallet(input.walletId);
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is frozen." };
  }
  if (!actor.phone || !actor.phone.trim()) {
    return {
      ok: false,
      error: "Add a phone number to your profile before requesting refunds.",
    };
  }

  const sources = deriveRefundableSourcesForWallet(input.walletId);
  const source = sources.find((s) => s.entry.id === input.sourcePaymentId);
  if (!source) {
    return { ok: false, error: "That funding source is not available." };
  }
  if (!Number.isFinite(input.amount) || input.amount < 1) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (input.amount > source.remainingAmount) {
    return {
      ok: false,
      error: "You cannot refund more than the remaining amount on this source.",
    };
  }

  const { fee, total } = computeWithdrawalTotal(
    input.amount,
    state.config.feeRatePercent
  );
  if (total > wallet.balance) {
    return {
      ok: false,
      error: "The wallet balance does not cover this refund plus its fee.",
    };
  }

  const requestsToday = requestsTodayCount(state.refundRequests, input.walletId);
  const approvalRequiredReasons: WalletApprovalReason[] = [];
  if (total > state.config.thresholdGHS) {
    approvalRequiredReasons.push("exceeds_threshold");
  }
  if (requestsToday >= state.config.dailyCap) {
    approvalRequiredReasons.push("daily_cap_reached");
  }

  const requiresApproval = approvalRequiredReasons.length > 0;
  const nowIso = new Date().toISOString();
  const refundId = "SRF-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const transactionRef = "TXN-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const request: StorefrontRefundRequest = {
    id: refundId,
    walletId: input.walletId,
    ownerId: actor.id,
    ownerName: actor.name,
    ownerEmail: actor.email,
    ownerPhone: actor.phone ?? "",
    storefrontId: wallet.storefrontId,
    resellerSlug: wallet.resellerSlug,
    storefrontName: wallet.storefrontName,
    amount: input.amount,
    fee,
    total,
    sourcePaymentId: source.entry.id,
    sourceMethodId: source.entry.method as WalletFundingMethod,
    sourceProvider: source.entry.provider,
    sourceMaskedLabel: source.entry.maskedLabel,
    sourceCreatedAt: source.entry.createdAt,
    sourceAmount: source.entry.amount,
    status: requiresApproval ? "pending_admin" : "completed",
    autoApproved: !requiresApproval,
    approvalRequiredReasons,
    transactionRef,
    requestedAt: nowIso,
    completedAt: requiresApproval ? undefined : nowIso,
  };

  internalPatchStorefrontUserWallet(input.walletId, (w) => ({
    ...w,
    balance: Math.round((w.balance - total) * 100) / 100,
    updatedAt: nowIso,
    lastRefundAt: nowIso,
    ownerPhone: actor.phone ?? w.ownerPhone,
  }));

  const ledgerEntry: StorefrontRefundLedgerEntry = {
    id: "SL-" + refundId,
    walletId: input.walletId,
    ownerId: actor.id,
    kind: "refund",
    amount: input.amount,
    fee,
    total,
    refundId,
    status: request.status,
    sourceSummary: request.sourceProvider + " " + request.sourceMaskedLabel,
    createdAt: nowIso,
  };
  internalAppendStorefrontLedgerEntry(ledgerEntry);

  if (requiresApproval) {
    internalAddStorefrontRefundRequest(request);
  } else {
    const history: StorefrontRefundHistoryEntry = {
      ...request,
      resolvedAt: nowIso,
      resolvedBy: "System",
    };
    internalAddStorefrontRefundHistory(history);
  }

  return { ok: true, reference: transactionRef, requiresApproval };
}

export function cancelStorefrontRefundRequest(
  requestId: string,
  actor: StorefrontRefundActor
): StorefrontRefundResult {
  const state = getStorefrontUserState();
  const request = state.refundRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, error: "Refund request not found." };
  if (request.status !== "pending_admin") {
    return {
      ok: false,
      error: "This refund has already been processed and cannot be cancelled.",
    };
  }

  const removed = internalRemoveStorefrontRefundRequest(requestId);
  if (!removed) return { ok: false, error: "Refund request not found." };

  const nowIso = new Date().toISOString();
  internalPatchStorefrontUserWallet(removed.walletId, (w) => ({
    ...w,
    balance: Math.round((w.balance + removed.total) * 100) / 100,
    updatedAt: nowIso,
  }));

  const history: StorefrontRefundHistoryEntry = {
    ...removed,
    status: "rejected",
    rejectionReason: "Cancelled by customer",
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddStorefrontRefundHistory(history);

  return { ok: true };
}

export function approveStorefrontRefund(
  requestId: string,
  admin: StorefrontAdminActor
): StorefrontRefundResult {
  const state = getStorefrontUserState();
  const request = state.refundRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, error: "Refund request not found." };
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Refund is not awaiting approval." };
  }

  const removed = internalRemoveStorefrontRefundRequest(requestId);
  if (!removed) return { ok: false, error: "Refund request not found." };

  const nowIso = new Date().toISOString();
  const history: StorefrontRefundHistoryEntry = {
    ...removed,
    status: "completed",
    approvedBy: admin.name,
    approvedAt: nowIso,
    completedAt: nowIso,
    resolvedAt: nowIso,
    resolvedBy: admin.name,
  };
  internalAddStorefrontRefundHistory(history);

  return { ok: true };
}

export function rejectStorefrontRefund(
  requestId: string,
  reason: string,
  admin: StorefrontAdminActor
): StorefrontRefundResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const state = getStorefrontUserState();
  const request = state.refundRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, error: "Refund request not found." };
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Refund is not awaiting approval." };
  }

  const removed = internalRemoveStorefrontRefundRequest(requestId);
  if (!removed) return { ok: false, error: "Refund request not found." };

  const nowIso = new Date().toISOString();
  internalPatchStorefrontUserWallet(removed.walletId, (w) => ({
    ...w,
    balance: Math.round((w.balance + removed.total) * 100) / 100,
    updatedAt: nowIso,
  }));

  const history: StorefrontRefundHistoryEntry = {
    ...removed,
    status: "rejected",
    rejectionReason: trimmed,
    approvedBy: admin.name,
    approvedAt: nowIso,
    resolvedAt: nowIso,
    resolvedBy: admin.name,
  };
  internalAddStorefrontRefundHistory(history);

  return { ok: true };
}