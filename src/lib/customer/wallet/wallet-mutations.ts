import type {
  CustomerFundingTransaction,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
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
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is frozen." };
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

  return { ok: true, reference };
}

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

  const requiresApproval = total > config.thresholdGHS;
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
    approvalRequiredReasons: requiresApproval ? ["exceeds_threshold"] : [],
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
    balance: Math.round((w.balance + removed.total) * 100) / 100,
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

  return { ok: true };
}