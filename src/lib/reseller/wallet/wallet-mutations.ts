import type {
  RegisteredDestination,
  ResellerAdjustmentLedgerEntry,
   ResellerAdjustmentMethod,
  ResellerFundingLedgerEntry,
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalLedgerEntry,
  ResellerWithdrawalRequest,
} from "@/lib/reseller/types/wallet";
import type {
  ResellerDestinationMethod,
  WalletFundingMethod,
  WithdrawalKind,
} from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import { getWalletConfig } from "@/lib/domains/wallet/config-store";
import {
  getResellerWalletStore,
  internalAddWithdrawalHistory,
  internalAddWithdrawalRequest,
  internalAppendLedgerEntry,
  internalEnsureResellerWallet,
  internalPatchLedgerEntry,
  internalPatchResellerWalletMeta,
  internalRemoveWithdrawalRequest,
} from "@/lib/reseller/mock/wallet-store";
import {
  getDestinationStore,
  internalPatchDestination,
  internalSetDestination,
} from "@/lib/reseller/mock/wallet-destination-store";
import { deriveRefundableSources } from "./wallet-projection";
import {
  MAX_DESTINATION_REASON_LENGTH,
  MIN_DESTINATION_REASON_LENGTH,
  MIN_RESELLER_WITHDRAWAL_AMOUNT,
} from "./wallet-constants";

export interface ResellerActor {
  id: string;
  name: string;
  email: string;
}

export interface ResellerMutationResult {
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
}

export function fundResellerWallet(
  input: FundInput,
  actor: ResellerActor
): ResellerMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (input.amount > 100_000) {
    return { ok: false, error: "Amount exceeds the per-transaction limit." };
  }

  internalEnsureResellerWallet(actor.id, actor.name);

  const nowIso = new Date().toISOString();
  const reference = "REF-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const entry: ResellerFundingLedgerEntry = {
    id: "RL-FUND-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    resellerId: actor.id,
    kind: "funding",
    amount: input.amount,
    method: input.method,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    reference,
    status: "successful",
    createdAt: nowIso,
    completedAt: nowIso,
  };

  internalAppendLedgerEntry(entry);
  internalPatchResellerWalletMeta(actor.id, {
    updatedAt: nowIso,
    lastFundingAt: nowIso,
  });

  return { ok: true, reference };
}

export interface WithdrawInput {
  kind: WithdrawalKind;
  amount: number;
  sourcePaymentId?: string;
}

export function requestResellerWithdrawal(
  input: WithdrawInput,
  actor: ResellerActor
): ResellerMutationResult {
  const store = getResellerWalletStore();
  const wallet = store.wallets[actor.id];
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is frozen." };
  }

  if (
    !Number.isFinite(input.amount) ||
    input.amount < MIN_RESELLER_WITHDRAWAL_AMOUNT
  ) {
    return {
      ok: false,
      error:
        "Enter an amount of at least GH\u20B5 " +
        MIN_RESELLER_WITHDRAWAL_AMOUNT.toFixed(2) +
        ".",
    };
  }

  let sourcePaymentId: string | undefined;
  let sourceMethodId: WalletFundingMethod | undefined;
  let sourceProvider: string | undefined;
  let sourceMaskedLabel: string | undefined;
  let sourceCreatedAt: string | undefined;
  let sourceAmount: number | undefined;

  let destinationId: string | undefined;
  let destinationMethod: ResellerDestinationMethod | undefined;
  let destinationProvider: string | undefined;
  let destinationMaskedLabel: string | undefined;
  let destinationNameOnAccount: string | undefined;

  if (input.kind === "refund_to_source") {
    if (!input.sourcePaymentId) {
      return { ok: false, error: "Choose a funding source first." };
    }
    const sources = deriveRefundableSources(store, actor.id);
    const source = sources.find((s) => s.entry.id === input.sourcePaymentId);
    if (!source) {
      return {
        ok: false,
        error: "That funding source is not available for refund.",
      };
    }
    if (input.amount > source.remainingAmount) {
      return {
        ok: false,
        error:
          "You cannot refund more than the remaining amount on that funding source.",
      };
    }
    sourcePaymentId = source.entry.id;
    sourceMethodId = source.entry.method;
    sourceProvider = source.entry.provider;
    sourceMaskedLabel = source.entry.maskedLabel;
    sourceCreatedAt = source.entry.createdAt;
    sourceAmount = source.entry.amount;
  } else {
    const destinationStore = getDestinationStore();
    const destination = destinationStore.destinations[actor.id];
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
    destinationId = destination.id;
    destinationMethod = destination.method;
    destinationProvider = destination.provider;
    destinationMaskedLabel = destination.maskedLabel;
    destinationNameOnAccount = destination.nameOnAccount;
  }

  const config = getWalletConfig();
  const { fee, total } = computeWithdrawalTotal(
    input.amount,
    config.feeRatePercent
  );

  // Balance is already net of pending withdrawals. Do not subtract them again.
  if (total > wallet.balance) {
    return {
      ok: false,
      error: "Your wallet balance does not cover this withdrawal plus its fee.",
    };
  }

  const requiresApproval = total > config.thresholdGHS;
  const nowIso = new Date().toISOString();
  const requestId = "RWD-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const transactionRef = "TXN-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const request: ResellerWithdrawalRequest = {
    id: requestId,
    resellerId: actor.id,
    resellerName: actor.name,
    kind: input.kind,
    amount: input.amount,
    fee,
    total,
    sourcePaymentId,
    sourceMethodId,
    sourceProvider,
    sourceMaskedLabel,
    sourceCreatedAt,
    sourceAmount,
    destinationId,
    destinationMethod,
    destinationProvider,
    destinationMaskedLabel,
    destinationNameOnAccount,
    status: requiresApproval ? "pending_admin" : "completed",
    autoApproved: !requiresApproval,
    approvalRequiredReasons: requiresApproval ? ["exceeds_threshold"] : [],
    transactionRef,
    requestedAt: nowIso,
    completedAt: requiresApproval ? undefined : nowIso,
  };

  const ledgerEntry: ResellerWithdrawalLedgerEntry = {
    id: "RL-" + requestId,
    resellerId: actor.id,
    kind: "withdrawal",
    amount: input.amount,
    fee,
    total,
    withdrawalKind: input.kind,
    withdrawalId: requestId,
    status: request.status,
    createdAt: nowIso,
  };
  internalAppendLedgerEntry(ledgerEntry);

  if (requiresApproval) {
    internalAddWithdrawalRequest(request);
    internalPatchResellerWalletMeta(actor.id, { updatedAt: nowIso });
  } else {
    const history: ResellerWithdrawalHistoryEntry = {
      ...request,
      resolvedAt: nowIso,
      resolvedBy: "System",
    };
    internalAddWithdrawalHistory(history);
    internalPatchResellerWalletMeta(actor.id, {
      updatedAt: nowIso,
      lastWithdrawalAt: nowIso,
    });
  }

  return { ok: true, reference: transactionRef, requiresApproval };
}

export function approveResellerWithdrawal(
  resellerId: string,
  requestId: string,
  actor: ResellerActor
): ResellerMutationResult {
  const store = getResellerWalletStore();
  const request = store.withdrawalRequests.find(
    (r) => r.id === requestId && r.resellerId === resellerId
  );
  if (!request) return { ok: false, error: "Withdrawal request not found." };
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not awaiting approval." };
  }

  const wallet = store.wallets[resellerId];
  if (!wallet) return { ok: false, error: "Wallet not found." };

  if (wallet.balance < 0) {
    internalPatchLedgerEntry("RL-" + requestId, (e) => ({
      ...e,
      status: "failed",
    }));
    internalRemoveWithdrawalRequest(resellerId, requestId);
    const nowIso = new Date().toISOString();
    const history: ResellerWithdrawalHistoryEntry = {
      ...request,
      status: "failed",
      failureReason: "insufficient_balance",
      resolvedAt: nowIso,
      resolvedBy: actor.name,
    };
    internalAddWithdrawalHistory(history);
    internalPatchResellerWalletMeta(resellerId, { updatedAt: nowIso });
    return {
      ok: false,
      error: "Insufficient commission balance. Withdrawal marked failed.",
    };
  }

  internalPatchLedgerEntry("RL-" + requestId, (e) => {
    if (e.kind !== "withdrawal") return e;
    return {
      ...e,
      status: "completed",
    };
  });

  internalRemoveWithdrawalRequest(resellerId, requestId);

  const nowIso = new Date().toISOString();
  const history: ResellerWithdrawalHistoryEntry = {
    ...request,
    status: "completed",
    approvedAt: nowIso,
    completedAt: nowIso,
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(history);
  internalPatchResellerWalletMeta(resellerId, {
    updatedAt: nowIso,
    lastWithdrawalAt: nowIso,
  });

  return { ok: true };
}

export function rejectResellerWithdrawal(
  resellerId: string,
  requestId: string,
  reason: string,
  actor: ResellerActor
): ResellerMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const store = getResellerWalletStore();
  const request = store.withdrawalRequests.find(
    (r) => r.id === requestId && r.resellerId === resellerId
  );
  if (!request) return { ok: false, error: "Withdrawal request not found." };
  if (request.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not awaiting approval." };
  }

  internalPatchLedgerEntry("RL-" + requestId, (e) => {
    if (e.kind !== "withdrawal") return e;
    return {
      ...e,
      status: "rejected",
    };
  });

  internalRemoveWithdrawalRequest(resellerId, requestId);

  const nowIso = new Date().toISOString();
  const history: ResellerWithdrawalHistoryEntry = {
    ...request,
    status: "rejected",
    rejectionReason: trimmed,
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(history);
  internalPatchResellerWalletMeta(resellerId, { updatedAt: nowIso });

  return { ok: true };
}

export function cancelResellerWithdrawal(
  requestId: string,
  actor: ResellerActor
): ResellerMutationResult {
  const store = getResellerWalletStore();
  const request = store.withdrawalRequests.find(
    (r) => r.id === requestId && r.resellerId === actor.id
  );
  if (!request) return { ok: false, error: "Withdrawal request not found." };
  if (request.status !== "pending_admin") {
    return {
      ok: false,
      error:
        "This withdrawal has already been processed and cannot be cancelled.",
    };
  }

  internalPatchLedgerEntry("RL-" + requestId, (e) => {
    if (e.kind !== "withdrawal") return e;
    return {
      ...e,
      status: "rejected",
    };
  });

  internalRemoveWithdrawalRequest(actor.id, requestId);

  const nowIso = new Date().toISOString();
  const history: ResellerWithdrawalHistoryEntry = {
    ...request,
    status: "rejected",
    rejectionReason: "Cancelled by reseller",
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(history);
  internalPatchResellerWalletMeta(actor.id, { updatedAt: nowIso });

  return { ok: true };
}

export interface AdminAdjustInput {
  resellerId: string;
  amount: number;
  reason: string;
  method: ResellerAdjustmentMethod;
  actor: { name: string; email: string };
}

export function applyAdminWalletAdjustment(
  input: AdminAdjustInput
): ResellerMutationResult {
  const trimmed = input.reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    return { ok: false, error: "Amount must be non-zero." };
  }

  internalEnsureResellerWallet(input.resellerId, input.resellerId);

  const nowIso = new Date().toISOString();
  const entry: ResellerAdjustmentLedgerEntry = {
    id: "RL-ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    resellerId: input.resellerId,
    kind: "adjustment",
    amount: input.amount,
    method: input.method,
    reason: trimmed,
    actor: input.actor,
    createdAt: nowIso,
  };

  internalAppendLedgerEntry(entry);
  internalPatchResellerWalletMeta(input.resellerId, { updatedAt: nowIso });

  return { ok: true };
}

export interface DestinationChangeInput {
  method: ResellerDestinationMethod;
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
  actor: ResellerActor
): ResellerMutationResult {
  const trimmedReason = input.reason.trim();
  if (trimmedReason.length < MIN_DESTINATION_REASON_LENGTH) {
    return {
      ok: false,
      error:
        "Please explain the change in at least " +
        MIN_DESTINATION_REASON_LENGTH +
        " characters.",
    };
  }
  if (trimmedReason.length > MAX_DESTINATION_REASON_LENGTH) {
    return {
      ok: false,
      error:
        "Reason must be " +
        MAX_DESTINATION_REASON_LENGTH +
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

  const nowIso = new Date().toISOString();
  const masked = maskAccountNumber(input.accountNumber);

  const store = getDestinationStore();
  const current = store.destinations[actor.id];

  if (!current) {
    const placeholder: RegisteredDestination = {
      id: "DST-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      resellerId: actor.id,
      method: input.method,
      provider: input.provider,
      accountNumber: input.accountNumber,
      maskedLabel: masked,
      nameOnAccount: input.nameOnAccount,
      verifiedAt: "",
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
  actor: ResellerActor
): ResellerMutationResult {
  const store = getDestinationStore();
  const current = store.destinations[actor.id];
  if (!current || !current.pendingChange) {
    return { ok: false, error: "No pending change to cancel." };
  }
  internalPatchDestination(actor.id, (d) => {
    const { pendingChange, ...rest } = d;
    void pendingChange;
    return { ...rest };
  });
  return { ok: true };
}