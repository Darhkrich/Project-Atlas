// lib/domains/wallet/merchant-money/mutations.ts

import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { getWalletConfig } from "@/lib/domains/wallet/config-store";
import { evaluateAutoApprove } from "./projection";
import {
  getMerchantMoneyStoreState,
  getMerchantWalletState,
  internalAddSavedMethod,
  internalAddWithdrawalHistory,
  internalAddWithdrawalRequest,
  internalAppendLedgerEntries,
  internalAppendLedgerEntry,
  internalPatchAutoPayConfig,
  internalPatchDestination,
  internalPatchLedgerEntry,
  internalPatchSavedMethod,
  internalPatchWalletMeta,
  internalRemoveSavedMethod,
  internalRemoveWithdrawalRequest,
  internalSetDestination,
} from "./store";
import {
  MAX_MERCHANT_DESTINATION_REASON_LENGTH,
  MIN_MERCHANT_DESTINATION_REASON_LENGTH,
  MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH,
  MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH,
  MIN_MERCHANT_WITHDRAWAL_AMOUNT,
} from "./constants";
import type {
  MerchantAdjustmentLedgerEntry,
  MerchantFundingLedgerEntry,
  MerchantMoneyActor,
  MerchantMoneyMutationResult,
  MerchantSavedPaymentMethod,
  MerchantTransferLedgerEntry,
  MerchantWalletType,
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalLedgerEntry,
  MerchantWithdrawalRequest,
  RegisteredDestination,
} from "./types";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import type {
  TreasuryActor,
  TreasuryCounterparty,
  TreasuryLiabilityPoolType,
} from "@/lib/domains/treasury/types";
import { appendAuditEntry } from "@/lib/domains/audit";

function toTreasuryActor(actor: MerchantMoneyActor): TreasuryActor {
  return { id: actor.id, name: actor.name, email: actor.email };
}

function merchantCounterparty(actor: MerchantMoneyActor): TreasuryCounterparty {
  return { type: "merchant", id: actor.id, name: actor.name };
}

function poolForWalletType(
  walletType: MerchantWalletType
): TreasuryLiabilityPoolType {
  return walletType === "billing" ? "merchant_billing" : "merchant_main";
}

/* ------------------------------ Funding -------------------------------- */

export interface FundInput {
  amount: number;
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
}

export function fundMerchantWallet(
  walletType: MerchantWalletType,
  input: FundInput,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (input.amount > 100_000) {
    return { ok: false, error: "Amount exceeds the per-transaction limit." };
  }

  const nowIso = new Date().toISOString();
  const reference = "REF-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const entryId =
    "ML-" +
    (walletType === "billing" ? "BF-" : "MF-") +
    crypto.randomUUID().slice(0, 8).toUpperCase();

  const entry: MerchantFundingLedgerEntry = {
    id: entryId,
    merchantId: actor.id,
    walletType,
    kind: "funding",
    amount: input.amount,
    method: input.method,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    reference,
    status: "successful",
    createdAt: nowIso,
    completedAt: nowIso,
    transactionRef: reference,
  };

  internalAppendLedgerEntry(entry);
  internalPatchWalletMeta(actor.id, walletType, {
    updatedAt: nowIso,
    lastFundingAt: nowIso,
    lastCreditAt: nowIso,
  });

  emitLedgerEvent({
    kind: "wallet_funding_credit",
    direction: "in",
    amount: input.amount,
    poolType: poolForWalletType(walletType),
    ownerId: actor.id,
    counterparty: merchantCounterparty(actor),
    reference,
    description:
      "Merchant " +
      walletType +
      " wallet funding via " +
      input.provider +
      " " +
      input.maskedLabel,
    actor: toTreasuryActor(actor),
    relatedEventId: entry.id,
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.fund",
    resourceType: "wallet",
    resourceId: actor.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      walletType,
      amount: input.amount,
      provider: input.provider,
      reference,
    },
  });

  return { ok: true, reference };
}

/* ------------------------------ Transfer ------------------------------- */

export interface TransferInput {
  from: MerchantWalletType;
  to: MerchantWalletType;
  amount: number;
}

export function transferBetweenWallets(
  input: TransferInput,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  if (input.from === input.to) {
    return { ok: false, error: "Choose two different wallets." };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }

  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  const fromWallet = input.from === "billing" ? state.billing : state.main;
  if (fromWallet.status === "frozen") {
    return { ok: false, error: "The source wallet is frozen." };
  }
  if (input.amount > fromWallet.balance) {
    return { ok: false, error: "Source wallet has insufficient balance." };
  }

  const nowIso = new Date().toISOString();
  const transferRef = "TRF-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const outId = "ML-TR-" + crypto.randomUUID().slice(0, 8) + "-OUT";
  const inId = "ML-TR-" + crypto.randomUUID().slice(0, 8) + "-IN";

  const outEntry: MerchantTransferLedgerEntry = {
    id: outId,
    merchantId: actor.id,
    walletType: input.from,
    kind: "transfer_out",
    amount: input.amount,
    pairedEntryId: inId,
    counterpartyWalletType: input.to,
    transferRef,
    createdAt: nowIso,
    transactionRef: transferRef,
  };
  const inEntry: MerchantTransferLedgerEntry = {
    id: inId,
    merchantId: actor.id,
    walletType: input.to,
    kind: "transfer_in",
    amount: input.amount,
    pairedEntryId: outId,
    counterpartyWalletType: input.from,
    transferRef,
    createdAt: nowIso,
    transactionRef: transferRef,
  };

  internalAppendLedgerEntries([outEntry, inEntry]);
  internalPatchWalletMeta(actor.id, input.from, {
    updatedAt: nowIso,
    lastDebitAt: nowIso,
  });
  internalPatchWalletMeta(actor.id, input.to, {
    updatedAt: nowIso,
    lastCreditAt: nowIso,
  });

  emitLedgerEvent({
    kind: "internal_reclassification",
    direction: "internal",
    amount: input.amount,
    poolType: poolForWalletType(input.to),
    counterpartyPoolType: poolForWalletType(input.from),
    ownerId: actor.id,
    counterparty: merchantCounterparty(actor),
    reference: transferRef,
    description:
      "Merchant wallet transfer: " + input.from + " to " + input.to,
    actor: toTreasuryActor(actor),
    relatedEventId: outId,
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.transfer",
    resourceType: "wallet",
    resourceId: actor.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      from: input.from,
      to: input.to,
      amount: input.amount,
      reference: transferRef,
    },
  });

  return { ok: true, reference: transferRef };
}

/* ------------------------------ Withdrawal ----------------------------- */

export interface WithdrawInput {
  amount: number;
}

export function requestMerchantWithdrawal(
  input: WithdrawInput,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  if (
    !Number.isFinite(input.amount) ||
    input.amount < MIN_MERCHANT_WITHDRAWAL_AMOUNT
  ) {
    return {
      ok: false,
      error:
        "Enter an amount of at least GH\u20B5 " +
        MIN_MERCHANT_WITHDRAWAL_AMOUNT.toFixed(2) +
        ".",
    };
  }

  if (state.main.status === "frozen") {
    return { ok: false, error: "Your main wallet is frozen." };
  }

  const destination = state.destination;
  if (!destination) {
    return {
      ok: false,
      error: "Add a withdrawal destination before cashing out.",
    };
  }
  if (destination.pendingChange) {
    return {
      ok: false,
      error:
        "Your destination change is under review. You cannot cash out until it is approved.",
    };
  }

  const config = getWalletConfig();
  const { fee, total } = computeWithdrawalTotal(
    input.amount,
    config.feeRatePercent
  );

  if (total > state.main.balance) {
    return {
      ok: false,
      error:
        "Your main wallet balance does not cover this withdrawal plus its fee.",
    };
  }

  const nowMs = Date.now();
  const evaluation = evaluateAutoApprove(
    state,
    input.amount,
    fee,
    config,
    nowMs
  );
  const requiresApproval = evaluation.outcome === "requires_approval";
  const approvalReasons = evaluation.reasons;

  const nowIso = new Date(nowMs).toISOString();
  const requestId = "MWD-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const transactionRef = "TXN-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const request: MerchantWithdrawalRequest = {
    id: requestId,
    merchantId: actor.id,
    merchantName: actor.name,
    amount: input.amount,
    fee,
    total,
    destinationId: destination.id,
    destinationMethod: destination.method,
    destinationProvider: destination.provider,
    destinationMaskedLabel: destination.maskedLabel,
    destinationNameOnAccount: destination.nameOnAccount,
    status: requiresApproval ? "pending_admin" : "completed",
    autoApproved: !requiresApproval,
    approvalRequiredReasons: approvalReasons,
    transactionRef,
    requestedAt: nowIso,
    completedAt: requiresApproval ? undefined : nowIso,
  };

  const ledgerEntry: MerchantWithdrawalLedgerEntry = {
    id: "ML-" + requestId,
    merchantId: actor.id,
    walletType: "main",
    kind: "withdrawal",
    amount: input.amount,
    fee,
    total,
    withdrawalId: requestId,
    status: request.status,
    destinationSummary:
      destination.provider + " " + destination.maskedLabel,
    createdAt: nowIso,
    completedAt: requiresApproval ? undefined : nowIso,
    transactionRef,
  };
  internalAppendLedgerEntry(ledgerEntry);

  if (requiresApproval) {
    internalAddWithdrawalRequest(request);
  } else {
    const history: MerchantWithdrawalHistoryEntry = {
      ...request,
      resolvedAt: nowIso,
      resolvedBy: "System",
    };
    internalAddWithdrawalHistory(history);

    emitLedgerEvent({
      kind: "withdrawal_debit",
      direction: "out",
      amount: input.amount,
      poolType: "merchant_main",
      ownerId: actor.id,
      counterparty: merchantCounterparty(actor),
      reference: transactionRef,
      description: "Merchant main wallet withdrawal to registered destination",
      actor: toTreasuryActor(actor),
      relatedEventId: requestId,
      settledAt: nowIso,
    });
  }

  internalPatchWalletMeta(actor.id, "main", {
    updatedAt: nowIso,
    lastDebitAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.withdraw_request",
    resourceType: "wallet",
    resourceId: actor.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      amount: input.amount,
      total,
      requiresApproval,
      approvalReasons,
      reference: transactionRef,
    },
  });

  return { ok: true, reference: transactionRef, requiresApproval };
}

export function cancelMerchantWithdrawal(
  requestId: string,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  const request = state.withdrawalRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, error: "Withdrawal request not found." };
  if (request.status !== "pending_admin") {
    return {
      ok: false,
      error:
        "This withdrawal has already been processed and cannot be cancelled.",
    };
  }

  const removed = internalRemoveWithdrawalRequest(actor.id, requestId);
  if (!removed) return { ok: false, error: "Withdrawal request not found." };

  const nowIso = new Date().toISOString();

  internalPatchLedgerEntry("ML-" + requestId, (e) => {
    if (e.kind !== "withdrawal") return e;
    return { ...e, status: "rejected" };
  });

  const history: MerchantWithdrawalHistoryEntry = {
    ...removed,
    status: "rejected",
    rejectionReason: "Cancelled by merchant",
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(history);
  internalPatchWalletMeta(actor.id, "main", { updatedAt: nowIso });

  appendAuditEntry({
    action: "wallet.merchant.withdraw_cancel",
    resourceType: "wallet",
    resourceId: actor.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { requestId, amount: request.amount },
  });

  return { ok: true };
}

/* ------------------------------ Admin withdrawal ----------------------- */

function findMerchantIdForWithdrawal(
  withdrawalId: string
): string | null {
  const s = getMerchantMoneyStoreState();
  for (const merchantId of Object.keys(s)) {
    if (s[merchantId].withdrawalRequests.some((r) => r.id === withdrawalId)) {
      return merchantId;
    }
    if (
      s[merchantId].withdrawalHistory.some((r) => r.id === withdrawalId)
    ) {
      return merchantId;
    }
  }
  return null;
}

export function approveMerchantWithdrawal(
  withdrawalId: string,
  actor: MerchantMoneyActor,
  note?: string
): MerchantMoneyMutationResult {
  const merchantId = findMerchantIdForWithdrawal(withdrawalId);
  if (!merchantId) return { ok: false, error: "Withdrawal not found." };

  const state = getMerchantWalletState(merchantId);
  if (!state) return { ok: false, error: "Withdrawal not found." };

  const request = state.withdrawalRequests.find(
    (r) => r.id === withdrawalId
  );
  if (!request) return { ok: false, error: "Withdrawal not found." };
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not awaiting approval." };
  }

  if (state.destination && state.destination.pendingChange) {
    return {
      ok: false,
      error:
        "The merchant has a pending destination change. Approve or cancel it before approving this withdrawal.",
    };
  }

  const nowIso = new Date().toISOString();
  const trimmedNote = note && note.trim().length > 0 ? note.trim() : undefined;

  internalPatchLedgerEntry("ML-" + withdrawalId, (e) => {
    if (e.kind !== "withdrawal") return e;
    return {
      ...e,
      status: "completed",
      note: trimmedNote,
      completedAt: nowIso,
    };
  });

  internalRemoveWithdrawalRequest(merchantId, withdrawalId);

  const history: MerchantWithdrawalHistoryEntry = {
    ...request,
    status: "completed",
    approvedAt: nowIso,
    completedAt: nowIso,
    resolvedAt: nowIso,
    resolvedBy: actor.name,
    note: trimmedNote,
  };
  internalAddWithdrawalHistory(history);
  internalPatchWalletMeta(merchantId, "main", {
    updatedAt: nowIso,
    lastDebitAt: nowIso,
  });

  emitLedgerEvent({
    kind: "withdrawal_debit",
    direction: "out",
    amount: request.amount,
    poolType: "merchant_main",
    ownerId: merchantId,
    counterparty: {
      type: "merchant",
      id: merchantId,
      name: request.merchantName,
    },
    reference: request.transactionRef,
    description: "Merchant main wallet withdrawal to registered destination",
    actor: toTreasuryActor(actor),
    relatedEventId: withdrawalId,
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.withdraw_approve",
    resourceType: "wallet",
    resourceId: merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { requestId: withdrawalId, amount: request.amount },
  });

  return { ok: true };
}

export function rejectMerchantWithdrawal(
  withdrawalId: string,
  reason: string,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const merchantId = findMerchantIdForWithdrawal(withdrawalId);
  if (!merchantId) return { ok: false, error: "Withdrawal not found." };

  const state = getMerchantWalletState(merchantId);
  if (!state) return { ok: false, error: "Withdrawal not found." };

  const request = state.withdrawalRequests.find(
    (r) => r.id === withdrawalId
  );
  if (!request) return { ok: false, error: "Withdrawal not found." };
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not awaiting approval." };
  }

  const nowIso = new Date().toISOString();

  internalPatchLedgerEntry("ML-" + withdrawalId, (e) => {
    if (e.kind !== "withdrawal") return e;
    return { ...e, status: "rejected" };
  });

  internalRemoveWithdrawalRequest(merchantId, withdrawalId);

  const history: MerchantWithdrawalHistoryEntry = {
    ...request,
    status: "rejected",
    rejectionReason: trimmed,
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(history);
  internalPatchWalletMeta(merchantId, "main", { updatedAt: nowIso });

  appendAuditEntry({
    action: "wallet.merchant.withdraw_reject",
    resourceType: "wallet",
    resourceId: merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { requestId: withdrawalId, reason: trimmed },
  });

  return { ok: true };
}

/* ------------------------------ Admin adjust --------------------------- */

export interface AdminAdjustWalletInput {
  merchantId: string;
  merchantName: string;
  walletType: MerchantWalletType;
  amount: number;
  reason: string;
  actor: MerchantMoneyActor;
}

export function adjustMerchantWallet(
  input: AdminAdjustWalletInput
): MerchantMoneyMutationResult {
  const trimmed = input.reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    return { ok: false, error: "Amount must be non-zero." };
  }
  if (Math.abs(input.amount) > 100_000) {
    return { ok: false, error: "Amount exceeds the per-adjustment limit." };
  }

  const state = getMerchantWalletState(input.merchantId);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  const wallet =
    input.walletType === "billing" ? state.billing : state.main;
  const projected = wallet.balance + input.amount;
  if (projected < 0) {
    return {
      ok: false,
      error: "Adjustment would overdraw the wallet.",
    };
  }

  const nowIso = new Date().toISOString();
  const entry: MerchantAdjustmentLedgerEntry = {
    id: "ML-ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    merchantId: input.merchantId,
    walletType: input.walletType,
    kind: "adjustment",
    amount: input.amount,
    reason: trimmed,
    actor: {
      id: input.actor.id,
      name: input.actor.name,
      email: input.actor.email,
    },
    createdAt: nowIso,
  };

  internalAppendLedgerEntry(entry);
  internalPatchWalletMeta(input.merchantId, input.walletType, {
    updatedAt: nowIso,
  });

  const isCredit = input.amount > 0;

  emitLedgerEvent({
    kind: isCredit ? "adjustment_credit" : "adjustment_debit",
    direction: isCredit ? "in" : "out",
    amount: Math.abs(input.amount),
    poolType: poolForWalletType(input.walletType),
    ownerId: input.merchantId,
    counterparty: {
      type: "merchant",
      id: input.merchantId,
      name: input.merchantName,
    },
    reference: entry.id,
    description: "Admin adjustment: " + trimmed,
    actor: toTreasuryActor(input.actor),
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.adjust",
    resourceType: "wallet",
    resourceId: input.merchantId,
    actor: {
      id: input.actor.id,
      name: input.actor.name,
      email: input.actor.email,
    },
    metadata: {
      walletType: input.walletType,
      amount: input.amount,
      direction: isCredit ? "credit" : "debit",
      reason: trimmed,
      reference: entry.id,
    },
  });

  return { ok: true, reference: entry.id };
}

/**
 * @deprecated Use adjustMerchantWallet. Defaults to main wallet.
 */
export interface AdminAdjustInput {
  merchantId: string;
  amount: number;
  reason: string;
  actor: MerchantMoneyActor;
}

export function applyAdminMerchantAdjustment(
  input: AdminAdjustInput
): MerchantMoneyMutationResult {
  return adjustMerchantWallet({
    merchantId: input.merchantId,
    merchantName: input.merchantId,
    walletType: "main",
    amount: input.amount,
    reason: input.reason,
    actor: input.actor,
  });
}

/* ------------------------------ Freeze --------------------------------- */

export function freezeMerchantWallet(
  merchantId: string,
  walletType: MerchantWalletType,
  reason: string,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }
  const state = getMerchantWalletState(merchantId);
  if (!state) return { ok: false, error: "Merchant wallet not found." };
  const wallet = walletType === "billing" ? state.billing : state.main;
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is already frozen." };
  }

  const nowIso = new Date().toISOString();
  internalPatchWalletMeta(merchantId, walletType, {
    status: "frozen",
    updatedAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.freeze",
    resourceType: "wallet",
    resourceId: merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { walletType, reason: trimmed },
  });

  return { ok: true };
}

export function unfreezeMerchantWallet(
  merchantId: string,
  walletType: MerchantWalletType,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(merchantId);
  if (!state) return { ok: false, error: "Merchant wallet not found." };
  const wallet = walletType === "billing" ? state.billing : state.main;
  if (wallet.status !== "frozen") {
    return { ok: false, error: "This wallet is not frozen." };
  }

  const nowIso = new Date().toISOString();
  internalPatchWalletMeta(merchantId, walletType, {
    status: "active",
    updatedAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.unfreeze",
    resourceType: "wallet",
    resourceId: merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { walletType },
  });

  return { ok: true };
}

/* ------------------------------ Destination ---------------------------- */

export interface DestinationChangeInput {
  method: "momo" | "bank";
  provider: string;
  accountNumber: string;
  nameOnAccount: string;
  reason: string;
}

function maskAccountNumber(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  const last4 = digits.slice(-4);
  return "**** " + (last4 || "----");
}

export function requestDestinationChange(
  input: DestinationChangeInput,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const trimmedReason = input.reason.trim();
  if (trimmedReason.length < MIN_MERCHANT_DESTINATION_REASON_LENGTH) {
    return {
      ok: false,
      error:
        "Please explain the change in at least " +
        MIN_MERCHANT_DESTINATION_REASON_LENGTH +
        " characters.",
    };
  }
  if (trimmedReason.length > MAX_MERCHANT_DESTINATION_REASON_LENGTH) {
    return {
      ok: false,
      error:
        "Reason must be " +
        MAX_MERCHANT_DESTINATION_REASON_LENGTH +
        " characters or fewer.",
    };
  }
  if (!input.provider.trim()) {
    return { ok: false, error: "Provider is required." };
  }
  if (!input.accountNumber.trim()) {
    return { ok: false, error: "Account number is required." };
  }
  if (!input.nameOnAccount.trim()) {
    return { ok: false, error: "Name on account is required." };
  }

  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  const nowIso = new Date().toISOString();
  const masked = maskAccountNumber(input.accountNumber);

  if (!state.destination) {
    const placeholder: RegisteredDestination = {
      id: "MDST-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      merchantId: actor.id,
      method: input.method,
      provider: input.provider,
      accountNumber: input.accountNumber,
      maskedLabel: masked,
      nameOnAccount: input.nameOnAccount,
      verifiedAt: null,
      pendingChange: {
        method: input.method,
        provider: input.provider,
        accountNumber: input.accountNumber,
        maskedLabel: masked,
        nameOnAccount: input.nameOnAccount,
        reason: trimmedReason,
        requestedAt: nowIso,
      },
    };
    internalSetDestination(actor.id, placeholder);
  } else {
    internalPatchDestination(actor.id, (d) => ({
      ...d,
      pendingChange: {
        method: input.method,
        provider: input.provider,
        accountNumber: input.accountNumber,
        maskedLabel: masked,
        nameOnAccount: input.nameOnAccount,
        reason: trimmedReason,
        requestedAt: nowIso,
      },
    }));
  }

  return { ok: true };
}

export function cancelPendingDestinationChange(
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state || !state.destination || !state.destination.pendingChange) {
    return { ok: false, error: "No pending change to cancel." };
  }
  internalPatchDestination(actor.id, (d) => {
    const { pendingChange, ...rest } = d;
    void pendingChange;
    return rest;
  });
  return { ok: true };
}

/* ------------------------------ Auto-pay ------------------------------- */

export interface UpdateCardInput {
  cardRef: string;
  cardBrand: string;
  cardLast4: string;
}

export function updateAutoPayCard(
  input: UpdateCardInput,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const nowIso = new Date().toISOString();
  const result = internalPatchAutoPayConfig(actor.id, (c) => ({
    ...c,
    cardRef: input.cardRef,
    cardBrand: input.cardBrand,
    cardLast4: input.cardLast4,
    updatedAt: nowIso,
    updatedBy: actor.name,
  }));
  if (!result) return { ok: false, error: "Merchant wallet not found." };
  return { ok: true };
}

export function setAutoPayEnabled(
  enabled: boolean,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  if (enabled) {
    if (state.autoPay.source === "card" && !state.autoPay.cardRef) {
      return { ok: false, error: "Add a card before enabling auto-pay." };
    }
    if (state.autoPay.source === "billing_wallet") {
      if (state.billing.balance <= 0) {
        return {
          ok: false,
          error:
            "Fund your billing wallet or add a card before enabling auto-pay.",
        };
      }
    }
  }

  const nowIso = new Date().toISOString();
  internalPatchAutoPayConfig(actor.id, (c) => ({
    ...c,
    enabled,
    updatedAt: nowIso,
    updatedBy: actor.name,
  }));
  return { ok: true };
}

export function setAutoPaySource(
  source: "card" | "billing_wallet",
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  if (source === "card" && !state.autoPay.cardRef) {
    return {
      ok: false,
      error: "Add a card before selecting the card source.",
    };
  }

  const nowIso = new Date().toISOString();
  internalPatchAutoPayConfig(actor.id, (c) => ({
    ...c,
    source,
    updatedAt: nowIso,
    updatedBy: actor.name,
  }));
  return { ok: true };
}

/* ------------------------------ Saved methods -------------------------- */

export interface AddSavedMethodInput {
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
  isDefault?: boolean;
}

export function addMerchantSavedMethod(
  input: AddSavedMethodInput,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const trimmedLabel = input.label.trim();
  if (trimmedLabel.length < MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be at least " +
        MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH +
        " characters.",
    };
  }
  if (trimmedLabel.length > MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be " +
        MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH +
        " characters or fewer.",
    };
  }

  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  const nowIso = new Date().toISOString();
  const makeDefault =
    input.isDefault === true || state.savedMethods.length === 0;

  if (makeDefault) {
    for (const m of state.savedMethods) {
      internalPatchSavedMethod(m.id, (existing) => ({
        ...existing,
        isDefault: false,
      }));
    }
  }

  const method: MerchantSavedPaymentMethod = {
    id: "MSM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    merchantId: actor.id,
    methodId: input.methodId,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    tokenRef: input.tokenRef,
    label: trimmedLabel,
    isDefault: makeDefault,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  internalAddSavedMethod(method);
  return { ok: true };
}

export function removeMerchantSavedMethod(
  methodId: string,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };
  const target = state.savedMethods.find((m) => m.id === methodId);
  if (!target) return { ok: false, error: "Saved method not found." };

  internalRemoveSavedMethod(methodId);

  if (target.isDefault) {
    const remaining = state.savedMethods.filter((m) => m.id !== methodId);
    if (remaining.length > 0) {
      internalPatchSavedMethod(remaining[0].id, (m) => ({
        ...m,
        isDefault: true,
      }));
    }
  }
  return { ok: true };
}

export function setDefaultMerchantSavedMethod(
  methodId: string,
  actor: MerchantMoneyActor
): MerchantMoneyMutationResult {
  const state = getMerchantWalletState(actor.id);
  if (!state) return { ok: false, error: "Merchant wallet not found." };
  const target = state.savedMethods.find((m) => m.id === methodId);
  if (!target) return { ok: false, error: "Saved method not found." };

  const nowIso = new Date().toISOString();
  for (const m of state.savedMethods) {
    internalPatchSavedMethod(m.id, (existing) => ({
      ...existing,
      isDefault: m.id === methodId,
      updatedAt: nowIso,
    }));
  }
  return { ok: true };
}