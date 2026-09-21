import type {
  StorefrontFundingLedgerEntry,
  StorefrontPurchaseLedgerEntry,
  StorefrontUserWalletRecord,
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

export interface StorefrontWalletActor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storefrontId: string;
  resellerSlug: string;
  storefrontName: string;
}

export interface StorefrontWalletMutationResult {
  ok: boolean;
  error?: string;
  reference?: string;
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
  if (wallet.status === "frozen") {
    return { ok: false, error: "This wallet is frozen." };
  }

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
    return { ok: false, error: "Insufficient wallet balance for this purchase." };
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

  return { ok: true };
}

export function deleteStorefrontUserWallet(walletId: string): boolean {
  return internalDeleteStorefrontUserWallet(walletId);
}