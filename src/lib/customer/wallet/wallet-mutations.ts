import type {
  CustomerFundingTransaction,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type {
  WalletApprovalReason,
  WalletFundingMethod,
} from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { getWalletConfig } from "@/lib/domains/wallet/config-store";
import {
  getCustomerWalletStore,
  internalAddFundingTransaction,
  internalAddWithdrawalHistory,
  internalAddWithdrawalRequest,
  internalPatchCustomerWallet,
  internalRemoveWithdrawalRequest,
} from "@/lib/customer/mock/wallet-store";
import { deriveRefundableSources } from "./wallet-projection";
import { appendAuditEntry } from "@/lib/domains/audit";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import { isDualApprovalRequired } from "@/lib/domains/treasury/helpers";
import type { TreasuryActor } from "@/lib/domains/treasury/types";

export interface CustomerActor {
  id: string;
  name: string;
  email: string;
}

export interface CustomerMutationResult {
  ok: boolean;
  error?: string;
  reference?: string;
  requiresApproval?: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function requestsTodayCount(
  customerId: string,
  nowMs: number
): number {
  const store = getCustomerWalletStore();
  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + 86_400_000;
  let count = 0;
  for (const r of store.withdrawalRequests) {
    if (r.customerId !== customerId) continue;
    const t = new Date(r.requestedAt).getTime();
    if (t >= dayStart && t < dayEnd) count += 1;
  }
  for (const h of store.withdrawalHistory) {
    if (h.customerId !== customerId) continue;
    const t = new Date(h.requestedAt).getTime();
    if (t >= dayStart && t < dayEnd) count += 1;
  }
  return count;
}

/* ------------------------------ Fund ---------------------------------- */

export interface FundInput {
  amount: number;
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  saveForFuture: boolean;
}

export function fundCustomerWallet(
  input: FundInput,
  actor: CustomerActor
): CustomerMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (input.amount > 100_000) {
    return { ok: false, error: "Amount exceeds the per-transaction limit." };
  }

  const store = getCustomerWalletStore();
  const wallet = store.wallets["WAL-" + actor.id];
  if (!wallet) {
    return { ok: false, error: "Wallet not found." };
  }

  const nowIso = new Date().toISOString();
  const id = "FUND-" + crypto.randomUUID();
  const reference = "REF-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const tx: CustomerFundingTransaction = {
    id,
    customerId: actor.id,
    amount: input.amount,
    method: input.method,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    reference,
    status: "successful",
    createdAt: nowIso,
    completedAt: nowIso,
  };

  internalAddFundingTransaction(tx);
  internalPatchCustomerWallet(actor.id, (w) => ({
    ...w,
    balance: Math.round((w.balance + input.amount) * 100) / 100,
    updatedAt: nowIso,
    lastFundingAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.customer.fund",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { amount: input.amount, provider: input.provider, reference },
  });

  emitLedgerEvent({
    kind: "wallet_funding_credit",
    direction: "in",
    amount: input.amount,
    poolType: "customer",
    ownerId: actor.id,
    counterparty: {
      type: "bank",
      id: slugify(input.provider) || "external",
      name: input.provider,
    },
    reference,
    description: "Customer wallet funding via " + input.provider,
    actor: { id: actor.id, name: actor.name, email: actor.email },
  });

  return { ok: true, reference };
}

/* ------------------------------ Withdraw ------------------------------ */

export interface WithdrawInput {
  sourcePaymentId: string;
  amount: number;
}

export function requestCustomerWithdrawal(
  input: WithdrawInput,
  actor: CustomerActor
): CustomerMutationResult {
  const store = getCustomerWalletStore();
  const wallet = store.wallets["WAL-" + actor.id];
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is frozen." };
  }

  const sources = deriveRefundableSources(store, actor.id);
  const source = sources.find(
    (s) => s.transaction.id === input.sourcePaymentId
  );
  if (!source) {
    return { ok: false, error: "That funding transaction is not available." };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (input.amount > source.remainingAmount) {
    return {
      ok: false,
      error:
        "You cannot refund more than the remaining amount on this funding source.",
    };
  }

  const config = getWalletConfig();
  const { fee, total } = computeWithdrawalTotal(
    input.amount,
    config.feeRatePercent
  );

  if (total > wallet.balance) {
    return {
      ok: false,
      error: "The wallet balance does not cover this refund plus its fee.",
    };
  }

  const approvalReasons: WalletApprovalReason[] = [];
  if (total > config.thresholdGHS) {
    approvalReasons.push("exceeds_threshold");
  }
  const todayCount = requestsTodayCount(actor.id, Date.now());
  if (todayCount >= config.dailyCap) {
    approvalReasons.push("daily_cap_reached");
  }
  const requiresApproval = approvalReasons.length > 0;

  const nowIso = new Date().toISOString();
  const requestId = "WWD-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const transactionRef = "TXN-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const request: CustomerWithdrawalRequest = {
    id: requestId,
    customerId: actor.id,
    customerName: wallet.customerName,
    amount: input.amount,
    fee,
    total,
    sourcePaymentId: source.transaction.id,
    sourceMethodId: source.transaction.method,
    sourceProvider: source.transaction.provider,
    sourceMaskedLabel: source.transaction.maskedLabel,
    sourceCreatedAt: source.transaction.createdAt,
    sourceAmount: source.transaction.amount,
    status: requiresApproval ? "pending_admin" : "completed",
    autoApproved: !requiresApproval,
    approvalRequiredReasons: approvalReasons,
    transactionRef,
    requestedAt: nowIso,
    completedAt: requiresApproval ? undefined : nowIso,
  };

  internalPatchCustomerWallet(actor.id, (w) => ({
    ...w,
    balance: Math.round((w.balance - total) * 100) / 100,
    updatedAt: nowIso,
    lastWithdrawalAt: nowIso,
  }));

  if (requiresApproval) {
    internalAddWithdrawalRequest(request);
  } else {
    const historyEntry: CustomerWithdrawalHistoryEntry = {
      ...request,
      resolvedAt: nowIso,
      resolvedBy: "System",
    };
    internalAddWithdrawalHistory(historyEntry);
  }

  appendAuditEntry({
    action: "wallet.customer.withdraw_request",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      amount: input.amount,
      total,
      requiresApproval,
      approvalReasons,
      reference: transactionRef,
    },
  });

  if (!requiresApproval) {
    emitLedgerEvent({
      kind: "refund_rail_debit",
      direction: "out",
      amount: input.amount,
      poolType: "customer",
      ownerId: actor.id,
      counterparty: {
        type: "bank",
        id: slugify(source.transaction.provider) || "external",
        name: source.transaction.provider,
      },
      reference: transactionRef,
      description: "Customer wallet withdrawal refund",
      actor: { id: actor.id, name: actor.name, email: actor.email },
    });
  }

  return { ok: true, reference: transactionRef, requiresApproval };
}

export function cancelCustomerWithdrawal(
  requestId: string,
  actor: CustomerActor
): CustomerMutationResult {
  const store = getCustomerWalletStore();
  const request = store.withdrawalRequests.find(
    (r) => r.id === requestId && r.customerId === actor.id
  );
  if (!request) {
    return { ok: false, error: "Refund request not found." };
  }
  if (request.status !== "pending_admin") {
    return {
      ok: false,
      error: "This refund has already been processed and cannot be cancelled.",
    };
  }

  const removed = internalRemoveWithdrawalRequest(actor.id, requestId);
  if (!removed) {
    return { ok: false, error: "Refund request not found." };
  }

  const nowIso = new Date().toISOString();
  internalPatchCustomerWallet(actor.id, (w) => ({
    ...w,
    balance: Math.round((w.balance + removed.amount) * 100) / 100,
    updatedAt: nowIso,
  }));

  const historyEntry: CustomerWithdrawalHistoryEntry = {
    ...removed,
    status: "rejected",
    rejectionReason: "Cancelled by customer",
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(historyEntry);

  appendAuditEntry({
    action: "wallet.customer.withdraw_cancel",
    resourceType: "wallet",
    resourceId: "WAL-" + actor.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { requestId, amount: removed.amount },
  });

  return { ok: true };
}

export function approveCustomerWithdrawal(
  requestId: string,
  actor: CustomerActor
): CustomerMutationResult {
  const store = getCustomerWalletStore();
  const request = store.withdrawalRequests.find((r) => r.id === requestId);
  if (!request) {
    return { ok: false, error: "Withdrawal request not found." };
  }
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not awaiting approval." };
  }

  const wallet = store.wallets["WAL-" + request.customerId];
  if (!wallet) return { ok: false, error: "Wallet not found." };

  if (wallet.balance < 0) {
    return {
      ok: false,
      error: "Wallet balance is negative. Cannot process further refunds.",
    };
  }

  const removed = internalRemoveWithdrawalRequest(
    request.customerId,
    requestId
  );
  if (!removed) {
    return { ok: false, error: "Withdrawal request not found." };
  }

  const nowIso = new Date().toISOString();
  const historyEntry: CustomerWithdrawalHistoryEntry = {
    ...removed,
    status: "completed",
    approvedAt: nowIso,
    completedAt: nowIso,
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(historyEntry);

  appendAuditEntry({
    action: "wallet.customer.withdraw_approve",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { requestId, amount: removed.amount },
  });

  emitLedgerEvent({
    kind: "refund_rail_debit",
    direction: "out",
    amount: removed.amount,
    poolType: "customer",
    ownerId: request.customerId,
    counterparty: {
      type: "bank",
      id: slugify(removed.sourceProvider) || "external",
      name: removed.sourceProvider,
    },
    reference: removed.transactionRef,
    description: "Customer wallet withdrawal refund approved",
    actor: { id: actor.id, name: actor.name, email: actor.email },
  });

  return { ok: true };
}

export function rejectCustomerWithdrawal(
  requestId: string,
  reason: string,
  actor: CustomerActor
): CustomerMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const store = getCustomerWalletStore();
  const request = store.withdrawalRequests.find((r) => r.id === requestId);
  if (!request) {
    return { ok: false, error: "Withdrawal request not found." };
  }
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not awaiting approval." };
  }

  const removed = internalRemoveWithdrawalRequest(
    request.customerId,
    requestId
  );
  if (!removed) {
    return { ok: false, error: "Withdrawal request not found." };
  }

  const nowIso = new Date().toISOString();
  internalPatchCustomerWallet(request.customerId, (w) => ({
    ...w,
    balance: Math.round((w.balance + removed.total) * 100) / 100,
    updatedAt: nowIso,
  }));

  const historyEntry: CustomerWithdrawalHistoryEntry = {
    ...removed,
    status: "rejected",
    rejectionReason: trimmed,
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(historyEntry);

  appendAuditEntry({
    action: "wallet.customer.withdraw_reject",
    resourceType: "wallet",
    resourceId: "WAL-" + request.customerId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { requestId, reason: trimmed },
  });

  return { ok: true };
}

/* ------------------------------ Freeze -------------------------------- */

export function freezeCustomerWallet(
  customerId: string,
  reason: string,
  actor: CustomerActor
): CustomerMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const store = getCustomerWalletStore();
  const wallet = store.wallets["WAL-" + customerId];
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is already frozen." };
  }

  const nowIso = new Date().toISOString();
  internalPatchCustomerWallet(customerId, (w) => ({
    ...w,
    status: "frozen",
    updatedAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.customer.freeze",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { reason: trimmed, customerId },
  });

  return { ok: true };
}

export function unfreezeCustomerWallet(
  customerId: string,
  actor: CustomerActor
): CustomerMutationResult {
  const store = getCustomerWalletStore();
  const wallet = store.wallets["WAL-" + customerId];
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status !== "frozen") {
    return { ok: false, error: "This wallet is not frozen." };
  }

  const nowIso = new Date().toISOString();
  internalPatchCustomerWallet(customerId, (w) => ({
    ...w,
    status: "active",
    updatedAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.customer.unfreeze",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { customerId },
  });

  return { ok: true };
}

/* ------------------------------Credit Adjust -------------------------------- */

export interface AdjustCustomerWalletInput {
  customerId: string;
  amount: number;
  reason: string;
}

export function adjustCustomerWallet(
  input: AdjustCustomerWalletInput,
  actor: CustomerActor
): CustomerMutationResult {
  const trimmed = input.reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    return { ok: false, error: "Amount must be a non-zero number." };
  }
  if (Math.abs(input.amount) > 100_000) {
    return { ok: false, error: "Amount exceeds the per-adjustment limit." };
  }

  const store = getCustomerWalletStore();
  const wallet = store.wallets["WAL-" + input.customerId];
  if (!wallet) return { ok: false, error: "Wallet not found." };

  const nowIso = new Date().toISOString();
  const isCredit = input.amount > 0;
  const magnitude = Math.round(Math.abs(input.amount) * 100) / 100;
  const reference = "ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const kind = isCredit ? "adjustment_credit" : "adjustment_debit";
  const requiresDual = isDualApprovalRequired(kind, magnitude);

  internalPatchCustomerWallet(input.customerId, (w) => ({
    ...w,
    balance: Math.round((w.balance + input.amount) * 100) / 100,
    updatedAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.customer.adjust",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      customerId: input.customerId,
      amount: input.amount,
      direction: isCredit ? "credit" : "debit",
      reason: trimmed,
      reference,
      requiresDual,
    },
  });

  emitLedgerEvent({
    kind,
    direction: isCredit ? "in" : "out",
    amount: magnitude,
    poolType: "customer",
    ownerId: input.customerId,
    counterparty: {
      type: "admin",
      id: actor.id,
      name: actor.name,
    },
    reference,
    description: trimmed,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    approvalStatus: requiresDual ? "pending" : "auto",
    settledAt: requiresDual ? undefined : nowIso,
  });

  return { ok: true, reference, requiresApproval: requiresDual };
}

/* --------------------------- Refund credit ---------------------------- */

export function creditCustomerWallet(
  refundId: string,
  customerId: string,
  amount: number,
  actor: TreasuryActor
): CustomerMutationResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Credit amount must be positive." };
  }

  const store = getCustomerWalletStore();
  const wallet = store.wallets["WAL-" + customerId];
  if (!wallet) return { ok: false, error: "Wallet not found." };

  const nowIso = new Date().toISOString();
  internalPatchCustomerWallet(customerId, (w) => ({
    ...w,
    balance: Math.round((w.balance + amount) * 100) / 100,
    updatedAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.customer.refund_credit",
    resourceType: "wallet",
    resourceId: wallet.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { refundId, amount },
  });

  return { ok: true };
}