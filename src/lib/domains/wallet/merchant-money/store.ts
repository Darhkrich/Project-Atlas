// lib/domains/wallet/merchant-money/store.ts

import type {
  MerchantMoneyStoreState,
  MerchantWalletLedgerEntry,
  MerchantWalletState,
  MerchantWalletType,
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalRequest,
  MerchantSavedPaymentMethod,
  MerchantAutoPayConfig,
  MerchantWalletRecord,
  RegisteredDestination,
} from "./types";
import { buildMerchantMoneySeed } from "./seed";

type Listener = () => void;

let store: MerchantMoneyStoreState | null = null;
let referenceNowMs: number | null = null;
const listeners = new Set<Listener>();

function ensureStore(): MerchantMoneyStoreState {
  if (store === null) {
    if (referenceNowMs === null) referenceNowMs = Date.now();
    store = buildMerchantMoneySeed(referenceNowMs);
    for (const merchantId of Object.keys(store)) {
      recomputeBalances(merchantId);
    }
  }
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isMerchantMoneyStoreLoaded(): boolean {
  return store !== null;
}

export function getMerchantMoneyStoreState(): MerchantMoneyStoreState {
  return ensureStore();
}

export function getMerchantWalletState(
  merchantId: string
): MerchantWalletState | null {
  const s = ensureStore();
  return s[merchantId] ?? null;
}

export function subscribeToMerchantMoneyStore(
  listener: Listener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Balance derivation.
//
// Every wallet balance is derived from the ledger. No balance is stored as a
// source of truth. Funding, customer payments, and transfer_in entries add.
// Plan charges and refunds subtract when settled. Withdrawals subtract unless
// the entry is rejected or failed. Adjustments carry their own sign.
//
// Balance is recomputed after every ledger append or patch. Only the ledger
// changes; the derived number follows.
// ---------------------------------------------------------------------------

function deriveBalance(
  merchantId: string,
  walletType: MerchantWalletType
): number {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet) return 0;

  let total = 0;
  for (const entry of wallet.ledger) {
    if (entry.walletType !== walletType) continue;
    if (entry.kind === "funding") {
      if (entry.status === "successful") total += entry.amount;
    } else if (entry.kind === "customer_payment") {
      total += entry.amount;
    } else if (entry.kind === "plan_charge") {
      if (entry.status === "successful") total -= entry.amount;
    } else if (entry.kind === "refund") {
      if (entry.settledAt) total -= entry.amount;
    } else if (entry.kind === "withdrawal") {
      if (entry.status !== "rejected" && entry.status !== "failed") {
        total -= entry.total;
      }
    } else if (entry.kind === "transfer_in") {
      total += entry.amount;
    } else if (entry.kind === "transfer_out") {
      total -= entry.amount;
    } else if (entry.kind === "adjustment") {
      total += entry.amount;
    }
  }
  return Math.round(total * 100) / 100;
}

function recomputeBalances(merchantId: string): void {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet) return;
  const billingBalance = deriveBalance(merchantId, "billing");
  const mainBalance = deriveBalance(merchantId, "main");
  s[merchantId] = {
    ...wallet,
    billing: { ...wallet.billing, balance: billingBalance },
    main: { ...wallet.main, balance: mainBalance },
  };
}

// ---------------------------------------------------------------------------
// Internal mutation surface. Only mutations.ts calls these.
// ---------------------------------------------------------------------------

export function internalAppendLedgerEntry(
  entry: MerchantWalletLedgerEntry
): MerchantWalletLedgerEntry {
  const s = ensureStore();
  const wallet = s[entry.merchantId];
  if (!wallet) return entry;
  wallet.ledger = [entry, ...wallet.ledger];
  recomputeBalances(entry.merchantId);
  notify();
  return entry;
}

export function internalAppendLedgerEntries(
  entries: MerchantWalletLedgerEntry[]
): MerchantWalletLedgerEntry[] {
  if (entries.length === 0) return entries;
  const s = ensureStore();
  const merchantId = entries[0].merchantId;
  const wallet = s[merchantId];
  if (!wallet) return entries;
  wallet.ledger = [...entries, ...wallet.ledger];
  recomputeBalances(merchantId);
  notify();
  return entries;
}

export function internalPatchLedgerEntry(
  entryId: string,
  updater: (e: MerchantWalletLedgerEntry) => MerchantWalletLedgerEntry
): MerchantWalletLedgerEntry | null {
  const s = ensureStore();
  for (const merchantId of Object.keys(s)) {
    const wallet = s[merchantId];
    const idx = wallet.ledger.findIndex((e) => e.id === entryId);
    if (idx === -1) continue;
    wallet.ledger[idx] = updater(wallet.ledger[idx]);
    recomputeBalances(merchantId);
    notify();
    return wallet.ledger[idx];
  }
  return null;
}

export function internalAddWithdrawalRequest(
  req: MerchantWithdrawalRequest
): MerchantWithdrawalRequest {
  const s = ensureStore();
  const wallet = s[req.merchantId];
  if (!wallet) return req;
  wallet.withdrawalRequests = [req, ...wallet.withdrawalRequests];
  notify();
  return req;
}

export function internalRemoveWithdrawalRequest(
  merchantId: string,
  requestId: string
): MerchantWithdrawalRequest | null {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet) return null;
  const found = wallet.withdrawalRequests.find((r) => r.id === requestId);
  if (!found) return null;
  wallet.withdrawalRequests = wallet.withdrawalRequests.filter(
    (r) => r.id !== requestId
  );
  notify();
  return found;
}

export function internalAddWithdrawalHistory(
  entry: MerchantWithdrawalHistoryEntry
): MerchantWithdrawalHistoryEntry {
  const s = ensureStore();
  const wallet = s[entry.merchantId];
  if (!wallet) return entry;
  wallet.withdrawalHistory = [entry, ...wallet.withdrawalHistory];
  notify();
  return entry;
}

export function internalPatchWalletMeta(
  merchantId: string,
  walletType: MerchantWalletType,
  patch: Partial<
    Pick<
      MerchantWalletRecord,
      "updatedAt" | "lastFundingAt" | "lastCreditAt" | "lastDebitAt" | "status"
    >
  >
): MerchantWalletRecord | null {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet) return null;
  if (walletType === "billing") {
    wallet.billing = { ...wallet.billing, ...patch };
  } else {
    wallet.main = { ...wallet.main, ...patch };
  }
  notify();
  return walletType === "billing" ? wallet.billing : wallet.main;
}

export function internalSetDestination(
  merchantId: string,
  destination: RegisteredDestination | null
): RegisteredDestination | null {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet) return null;
  wallet.destination = destination;
  notify();
  return wallet.destination;
}

export function internalPatchDestination(
  merchantId: string,
  updater: (d: RegisteredDestination) => RegisteredDestination
): RegisteredDestination | null {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet || !wallet.destination) return null;
  wallet.destination = updater(wallet.destination);
  notify();
  return wallet.destination;
}

export function internalAddSavedMethod(
  method: MerchantSavedPaymentMethod
): MerchantSavedPaymentMethod {
  const s = ensureStore();
  const wallet = s[method.merchantId];
  if (!wallet) return method;
  wallet.savedMethods = [...wallet.savedMethods, method];
  notify();
  return method;
}

export function internalPatchSavedMethod(
  methodId: string,
  updater: (m: MerchantSavedPaymentMethod) => MerchantSavedPaymentMethod
): MerchantSavedPaymentMethod | null {
  const s = ensureStore();
  for (const merchantId of Object.keys(s)) {
    const wallet = s[merchantId];
    const idx = wallet.savedMethods.findIndex((m) => m.id === methodId);
    if (idx === -1) continue;
    wallet.savedMethods[idx] = updater(wallet.savedMethods[idx]);
    notify();
    return wallet.savedMethods[idx];
  }
  return null;
}

export function internalRemoveSavedMethod(
  methodId: string
): MerchantSavedPaymentMethod | null {
  const s = ensureStore();
  for (const merchantId of Object.keys(s)) {
    const wallet = s[merchantId];
    const found = wallet.savedMethods.find((m) => m.id === methodId);
    if (!found) continue;
    wallet.savedMethods = wallet.savedMethods.filter((m) => m.id !== methodId);
    notify();
    return found;
  }
  return null;
}

export function internalPatchAutoPayConfig(
  merchantId: string,
  updater: (c: MerchantAutoPayConfig) => MerchantAutoPayConfig
): MerchantAutoPayConfig | null {
  const s = ensureStore();
  const wallet = s[merchantId];
  if (!wallet) return null;
  wallet.autoPay = updater(wallet.autoPay);
  notify();
  return wallet.autoPay;
}

export function resetMerchantMoneyStoreForTest(): void {
  referenceNowMs = Date.now();
  store = buildMerchantMoneySeed(referenceNowMs);
  for (const merchantId of Object.keys(store)) {
    recomputeBalances(merchantId);
  }
  notify();
}