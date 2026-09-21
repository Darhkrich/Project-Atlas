import type {
  MerchantFundingLedgerEntry,
  MerchantTransferLedgerEntry,
  MerchantWalletLedgerEntry,
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalLedgerEntry,
  MerchantWithdrawalRequest,
  RegisteredDestination,
} from "@/lib/merchant/types/wallet";
import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import {
  getMerchantWalletStore,
  internalAddWithdrawalHistory,
  internalAddWithdrawalRequest,
  internalAppendLedgerEntries,
  internalAppendLedgerEntry,
  internalPatchMerchantWallet,
  internalRemoveWithdrawalRequest,
} from "@/lib/merchant/mock/wallet-store";
import {
  getMerchantDestinationStore,
  internalPatchDestination,
  internalSetDestination,
} from "@/lib/merchant/mock/destination-store";
import {
  getMerchantAutoPayStore,
  internalPatchAutoPayConfig,
} from "@/lib/merchant/mock/auto-pay-store";
import {
  MAX_MERCHANT_DESTINATION_REASON_LENGTH,
  MIN_MERCHANT_DESTINATION_REASON_LENGTH,
  MIN_MERCHANT_WITHDRAWAL_AMOUNT,
} from "./wallet-constants";

export interface MerchantActor {
  id: string;
  name: string;
  email: string;
}

export interface MerchantMutationResult {
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

export function fundMerchantWallet(
  walletType: "billing" | "main",
  input: FundInput,
  actor: MerchantActor
): MerchantMutationResult {
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
  };

  internalAppendLedgerEntry(entry);
  internalPatchMerchantWallet(walletType, (w) => ({
    ...w,
    balance: Math.round((w.balance + input.amount) * 100) / 100,
    updatedAt: nowIso,
    lastFundingAt: nowIso,
    lastCreditAt: nowIso,
  }));

  return { ok: true, reference };
}

export interface TransferInput {
  from: "billing" | "main";
  to: "billing" | "main";
  amount: number;
}

export function transferBetweenWallets(
  input: TransferInput,
  actor: MerchantActor
): MerchantMutationResult {
  if (input.from === input.to) {
    return { ok: false, error: "Choose two different wallets." };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }

  const store = getMerchantWalletStore();
  const fromWallet = input.from === "billing" ? store.billing : store.main;
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
  };

  internalAppendLedgerEntries([outEntry, inEntry]);

  internalPatchMerchantWallet(input.from, (w) => ({
    ...w,
    balance: Math.round((w.balance - input.amount) * 100) / 100,
    updatedAt: nowIso,
    lastDebitAt: nowIso,
  }));
  internalPatchMerchantWallet(input.to, (w) => ({
    ...w,
    balance: Math.round((w.balance + input.amount) * 100) / 100,
    updatedAt: nowIso,
    lastCreditAt: nowIso,
  }));

  return { ok: true, reference: transferRef };
}

export interface WithdrawInput {
  amount: number;
}

export function requestMerchantWithdrawal(
  input: WithdrawInput,
  actor: MerchantActor
): MerchantMutationResult {
  const store = getMerchantWalletStore();
  const destinationStore = getMerchantDestinationStore();

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

  if (store.main.status === "frozen") {
    return { ok: false, error: "Your main wallet is frozen." };
  }

  const destination = destinationStore.destination;
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

  const { fee, total } = computeWithdrawalTotal(
    input.amount,
    store.config.feeRatePercent
  );

  const pendingTotal = store.withdrawalRequests.reduce(
    (s, r) => s + r.total,
    0
  );
  const available = store.main.balance - pendingTotal;
  if (total > available) {
    return {
      ok: false,
      error: "Your main wallet balance does not cover this withdrawal plus its fee.",
    };
  }

  const requiresApproval = total > store.config.thresholdGHS;
  const nowIso = new Date().toISOString();
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
    approvalRequiredReasons: requiresApproval ? ["exceeds_threshold"] : [],
    transactionRef,
    requestedAt: nowIso,
    completedAt: requiresApproval ? undefined : nowIso,
  };

  internalPatchMerchantWallet("main", (w) => ({
    ...w,
    balance: Math.round((w.balance - total) * 100) / 100,
    updatedAt: nowIso,
    lastDebitAt: nowIso,
  }));

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
    destinationSummary: destination.provider + " " + destination.maskedLabel,
    createdAt: nowIso,
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
  }

  return { ok: true, reference: transactionRef, requiresApproval };
}

export function cancelMerchantWithdrawal(
  requestId: string,
  actor: MerchantActor
): MerchantMutationResult {
  const store = getMerchantWalletStore();
  const request = store.withdrawalRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, error: "Withdrawal request not found." };
  if (request.status !== "pending_admin") {
    return {
      ok: false,
      error: "This withdrawal has already been processed and cannot be cancelled.",
    };
  }

  const removed = internalRemoveWithdrawalRequest(requestId);
  if (!removed) return { ok: false, error: "Withdrawal request not found." };

  const nowIso = new Date().toISOString();

  internalPatchMerchantWallet("main", (w) => ({
    ...w,
    balance: Math.round((w.balance + removed.total) * 100) / 100,
    updatedAt: nowIso,
  }));

  const history: MerchantWithdrawalHistoryEntry = {
    ...removed,
    status: "rejected",
    rejectionReason: "Cancelled by merchant",
    resolvedAt: nowIso,
    resolvedBy: actor.name,
  };
  internalAddWithdrawalHistory(history);

  return { ok: true };
}

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
  actor: MerchantActor
): MerchantMutationResult {
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

  const nowIso = new Date().toISOString();
  const masked = maskAccountNumber(input.accountNumber);

  const store = getMerchantDestinationStore();
  if (!store.destination) {
    const placeholder: RegisteredDestination = {
      id: "MDST-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      merchantId: actor.id,
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
    internalSetDestination(placeholder);
  } else {
    internalPatchDestination((d) => ({
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
  actor: MerchantActor
): MerchantMutationResult {
  const store = getMerchantDestinationStore();
  if (!store.destination || !store.destination.pendingChange) {
    return { ok: false, error: "No pending change to cancel." };
  }
  internalPatchDestination((d) => {
    const { pendingChange, ...rest } = d;
    void pendingChange;
    return { ...rest };
  });
  void actor;
  return { ok: true };
}

export interface UpdateCardInput {
  cardRef: string;
  cardBrand: string;
  cardLast4: string;
}

export function updateAutoPayCard(
  input: UpdateCardInput,
  actor: MerchantActor
): MerchantMutationResult {
  internalPatchAutoPayConfig((c) => ({
    ...c,
    cardRef: input.cardRef,
    cardBrand: input.cardBrand,
    cardLast4: input.cardLast4,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  }));
  return { ok: true };
}

export function setAutoPayEnabled(
  enabled: boolean,
  actor: MerchantActor
): MerchantMutationResult {
  const store = getMerchantAutoPayStore();
  if (enabled) {
    if (store.config.source === "card" && !store.config.cardRef) {
      return {
        ok: false,
        error: "Add a card before enabling auto-pay.",
      };
    }
    if (store.config.source === "billing_wallet") {
      const walletStore = getMerchantWalletStore();
      if (walletStore.billing.balance <= 0) {
        return {
          ok: false,
          error:
            "Fund your billing wallet or add a card before enabling auto-pay.",
        };
      }
    }
  }
  internalPatchAutoPayConfig((c) => ({
    ...c,
    enabled,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  }));
  return { ok: true };
}

export function setAutoPaySource(
  source: "card" | "billing_wallet",
  actor: MerchantActor
): MerchantMutationResult {
  const store = getMerchantAutoPayStore();
  if (source === "card" && !store.config.cardRef) {
    return {
      ok: false,
      error: "Add a card before selecting the card source.",
    };
  }
  internalPatchAutoPayConfig((c) => ({
    ...c,
    source,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  }));
  return { ok: true };
}

export const __unusedLedgerEntry: MerchantWalletLedgerEntry | undefined =
  undefined;