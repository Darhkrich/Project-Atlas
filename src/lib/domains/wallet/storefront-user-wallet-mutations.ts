import type {
  StorefrontFundingLedgerEntry,
  StorefrontPurchaseLedgerEntry,
  StorefrontUserWalletRecord,
  StorefrontAdjustmentLedgerEntry,
} from "./storefront-user-types";
import { walletIdFor } from "./storefront-user-types";
import type { WalletFundingMethod } from "./enums";
import {
  getStorefrontUserState,
  internalAppendStorefrontLedgerEntry,
  internalDeleteStorefrontUserWallet,
  internalPatchStorefrontUserWallet,
  internalSetStorefrontUserWallet,
} from "./storefront-user-state";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import type {
  TreasuryActor,
  TreasuryCounterparty,
} from "@/lib/domains/treasury/types";
import { appendAuditEntry } from "@/lib/domains/audit";

export interface StorefrontWalletActor {
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

export interface StorefrontWalletMutationResult {
  ok: boolean;
  error?: string;
  reference?: string;
}

function toTreasuryActor(actor: StorefrontWalletActor): TreasuryActor {
  return { id: actor.id, name: actor.name, email: actor.email };
}

function adminToTreasuryActor(admin: StorefrontAdminActor): TreasuryActor {
  return { id: admin.id, name: admin.name, email: admin.email };
}

function counterpartyFor(
  walletId: string,
  wallet: StorefrontUserWalletRecord
): TreasuryCounterparty {
  return {
    type: "storefront_user",
    id: walletId,
    name: wallet.ownerName,
  };
}

export function ensureStorefrontWallet(actor: StorefrontWalletActor): string {
  const state = getStorefrontUserState();
  const id = walletIdFor(actor.storefrontId, actor.id);
  if (!state.wallets[id]) {
    const nowIso = new Date().toISOString();
    const wallet: StorefrontUserWalletRecord = {
      id,
      ownerId: actor.id,
      ownerName: actor.name,
      ownerEmail: actor.email,
      ownerPhone: actor.phone ?? "",
      storefrontId: actor.storefrontId,
      resellerSlug: actor.resellerSlug,
      storefrontName: actor.storefrontName,
      balance: 0,
      currency: "GHS",
      status: "active",
      updatedAt: nowIso,
      lastFundingAt: null,
      lastPurchaseAt: null,
      lastRefundAt: null,
    };
    internalSetStorefrontUserWallet(wallet);
  }
  return id;
}

export function getStorefrontWallet(
  walletId: string
): StorefrontUserWalletRecord | undefined {
  return getStorefrontUserState().wallets[walletId];
}

export interface FundStorefrontInput {
  amount: number;
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
}

export function fundStorefrontUserWallet(
  walletId: string,
  input: FundStorefrontInput,
  actor: StorefrontWalletActor
): StorefrontWalletMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }
  if (input.amount > 100_000) {
    return { ok: false, error: "Amount exceeds the per-transaction limit." };
  }
  const wallet = getStorefrontWallet(walletId);
  if (!wallet) return { ok: false, error: "Wallet not found." };

  const nowIso = new Date().toISOString();
  const reference = "REF-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const entry: StorefrontFundingLedgerEntry = {
    id: "SL-FUND-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    walletId,
    ownerId: actor.id,
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

  internalAppendStorefrontLedgerEntry(entry);
  internalPatchStorefrontUserWallet(walletId, (w) => ({
    ...w,
    balance: Math.round((w.balance + input.amount) * 100) / 100,
    updatedAt: nowIso,
    lastFundingAt: nowIso,
  }));

  emitLedgerEvent({
    kind: "wallet_funding_credit",
    direction: "in",
    amount: input.amount,
    poolType: "storefront_user",
    ownerId: walletId,
    counterparty: counterpartyFor(walletId, wallet),
    reference,
    description:
      "Storefront user wallet funding via " +
      input.provider +
      " " +
      input.maskedLabel,
    actor: toTreasuryActor(actor),
    relatedEventId: entry.id,
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.storefront_user.fund",
    resourceType: "wallet",
    resourceId: walletId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      amount: input.amount,
      provider: input.provider,
      reference,
    },
  });

  return { ok: true, reference };
}

export interface RecordStorefrontPurchaseInput {
  amount: number;
  service: string;
  plan: string;
  orderId: string;
}

export function recordStorefrontPurchase(
  walletId: string,
  input: RecordStorefrontPurchaseInput,
  actor: StorefrontWalletActor
): StorefrontWalletMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Invalid purchase amount." };
  }
  const wallet = getStorefrontWallet(walletId);
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is frozen." };
  }
  if (wallet.balance < input.amount) {
    return {
      ok: false,
      error: "Insufficient wallet balance for this purchase.",
    };
  }

  const nowIso = new Date().toISOString();

  internalPatchStorefrontUserWallet(walletId, (w) => ({
    ...w,
    balance: Math.round((w.balance - input.amount) * 100) / 100,
    updatedAt: nowIso,
    lastPurchaseAt: nowIso,
  }));

  const entry: StorefrontPurchaseLedgerEntry = {
    id: "SL-PUR-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    walletId,
    ownerId: actor.id,
    kind: "purchase",
    amount: input.amount,
    relatedOrderId: input.orderId,
    service: input.service,
    plan: input.plan,
    createdAt: nowIso,
  };
  internalAppendStorefrontLedgerEntry(entry);

  emitLedgerEvent({
    kind: "internal_reclassification",
    direction: "internal",
    amount: input.amount,
    poolType: "storefront_user",
    ownerId: walletId,
    counterparty: counterpartyFor(walletId, wallet),
    reference: input.orderId,
    description:
      "Storefront purchase: " + input.service + " (" + input.plan + ")",
    actor: toTreasuryActor(actor),
    relatedEventId: entry.id,
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.storefront_user.purchase",
    resourceType: "wallet",
    resourceId: walletId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      amount: input.amount,
      service: input.service,
      orderId: input.orderId,
    },
  });

  return { ok: true };
}

export function deleteStorefrontUserWallet(walletId: string): boolean {
  return internalDeleteStorefrontUserWallet(walletId);
}

/* ------------------------------ Freeze -------------------------------- */

export function freezeStorefrontUserWallet(
  walletId: string,
  reason: string,
  admin: StorefrontAdminActor
): StorefrontWalletMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }
  const wallet = getStorefrontWallet(walletId);
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is already frozen." };
  }

  const nowIso = new Date().toISOString();
  internalPatchStorefrontUserWallet(walletId, (w) => ({
    ...w,
    status: "frozen",
    updatedAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.storefront_user.freeze",
    resourceType: "wallet",
    resourceId: walletId,
    actor: { id: admin.id, name: admin.name, email: admin.email },
    metadata: { reason: trimmed },
  });

  return { ok: true };
}

export function unfreezeStorefrontUserWallet(
  walletId: string,
  admin: StorefrontAdminActor
): StorefrontWalletMutationResult {
  const wallet = getStorefrontWallet(walletId);
  if (!wallet) return { ok: false, error: "Wallet not found." };
  if (wallet.status !== "frozen") {
    return { ok: false, error: "This wallet is not frozen." };
  }

  const nowIso = new Date().toISOString();
  internalPatchStorefrontUserWallet(walletId, (w) => ({
    ...w,
    status: "active",
    updatedAt: nowIso,
  }));

  appendAuditEntry({
    action: "wallet.storefront_user.unfreeze",
    resourceType: "wallet",
    resourceId: walletId,
    actor: { id: admin.id, name: admin.name, email: admin.email },
    metadata: {},
  });

  return { ok: true };
}

/* ------------------------------ Adjust -------------------------------- */

export interface AdjustStorefrontUserWalletInput {
  walletId: string;
  amount: number;
  reason: string;
}

export function adjustStorefrontUserWallet(
  input: AdjustStorefrontUserWalletInput,
  admin: StorefrontAdminActor
): StorefrontWalletMutationResult {
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

  const wallet = getStorefrontWallet(input.walletId);
  if (!wallet) return { ok: false, error: "Wallet not found." };

  const nowIso = new Date().toISOString();
  const isCredit = input.amount > 0;
  const magnitude = Math.round(Math.abs(input.amount) * 100) / 100;
  const reference = "ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  internalPatchStorefrontUserWallet(input.walletId, (w) => ({
    ...w,
    balance: Math.round((w.balance + input.amount) * 100) / 100,
    updatedAt: nowIso,
  }));

  const entry: StorefrontAdjustmentLedgerEntry = {
    id: "SL-ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    walletId: input.walletId,
    ownerId: wallet.ownerId,
    kind: "adjustment",
    amount: input.amount,
    method: "atlas_wallet",
    reason: trimmed,
    actor: { name: admin.name, email: admin.email },
    createdAt: nowIso,
  };
  internalAppendStorefrontLedgerEntry(entry);

  appendAuditEntry({
    action: "wallet.storefront_user.adjust",
    resourceType: "wallet",
    resourceId: input.walletId,
    actor: { id: admin.id, name: admin.name, email: admin.email },
    metadata: {
      amount: input.amount,
      direction: isCredit ? "credit" : "debit",
      reason: trimmed,
      reference,
    },
  });

  emitLedgerEvent({
    kind: isCredit ? "adjustment_credit" : "adjustment_debit",
    direction: isCredit ? "in" : "out",
    amount: magnitude,
    poolType: "storefront_user",
    ownerId: input.walletId,
    counterparty: {
      type: "admin",
      id: admin.id,
      name: admin.name,
    },
    reference,
    description: trimmed,
    actor: adminToTreasuryActor(admin),
    settledAt: nowIso,
  });

  return { ok: true, reference };
}