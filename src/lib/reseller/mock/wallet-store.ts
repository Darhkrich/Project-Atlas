import type {
  ResellerWalletLedgerEntry,
  ResellerWalletRecord,
  ResellerWalletStoreState,
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalRequest,
} from "@/lib/reseller/types/wallet";
import { seedResellerWalletStore } from "./reseller-wallet-seed";

type Listener = () => void;

let store: ResellerWalletStoreState | null = null;
const listeners = new Set<Listener>();

function ensureStore(): ResellerWalletStoreState {
  if (store === null) store = seedResellerWalletStore();
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isResellerWalletStoreLoaded(): boolean {
  return store !== null;
}

export function getResellerWalletStore(): ResellerWalletStoreState {
  return ensureStore();
}

export function subscribeToResellerWalletStore(
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
// Funding, commission, and adjustment entries add. Purchase entries subtract.
// Withdrawal entries subtract unless the status is rejected or failed. That
// means a pending withdrawal earmarks the funds. Approval flips the status to
// completed without touching the balance. Rejection releases the hold.
// ---------------------------------------------------------------------------

function recomputeBalance(resellerId: string): void {
  const s = ensureStore();
  const wallet = s.wallets[resellerId];
  if (!wallet) return;

  let balance = 0;
  for (const entry of s.ledger) {
    if (entry.resellerId !== resellerId) continue;
    if (entry.kind === "funding") {
      if (entry.status === "successful") balance += entry.amount;
    } else if (entry.kind === "commission") {
      balance += entry.amount;
    } else if (entry.kind === "purchase") {
      balance -= entry.amount;
    } else if (entry.kind === "withdrawal") {
      if (entry.status !== "rejected" && entry.status !== "failed") {
        balance -= entry.amount;
      }
    } else if (entry.kind === "adjustment") {
      balance += entry.amount;
    }
  }

  s.wallets[resellerId] = {
    ...wallet,
    balance: Math.round(balance * 100) / 100,
  };
}

export function internalPatchResellerWalletMeta(
  resellerId: string,
  patch: Partial<
    Pick<
      ResellerWalletRecord,
      "updatedAt" | "lastFundingAt" | "lastCommissionAt" | "lastWithdrawalAt" | "status"
    >
  >
): ResellerWalletRecord | null {
  const s = ensureStore();
  const wallet = s.wallets[resellerId];
  if (!wallet) return null;
  s.wallets[resellerId] = { ...wallet, ...patch };
  notify();
  return s.wallets[resellerId];
}

export function internalEnsureResellerWallet(
  resellerId: string,
  resellerName: string
): ResellerWalletRecord {
  const s = ensureStore();
  const existing = s.wallets[resellerId];
  if (existing) return existing;

  const nowIso = new Date().toISOString();
  const wallet: ResellerWalletRecord = {
    id: "WAL-" + resellerId,
    resellerId,
    resellerName,
    balance: 0,
    currency: "GHS",
    status: "active",
    updatedAt: nowIso,
    lastFundingAt: null,
    lastCommissionAt: null,
    lastWithdrawalAt: null,
  };
  s.wallets[resellerId] = wallet;
  notify();
  return wallet;
}

export function internalAppendLedgerEntry(
  entry: ResellerWalletLedgerEntry
): ResellerWalletLedgerEntry {
  const s = ensureStore();
  s.ledger = [entry, ...s.ledger];
  recomputeBalance(entry.resellerId);
  notify();
  return entry;
}

export function internalPatchLedgerEntry(
  entryId: string,
  updater: (e: ResellerWalletLedgerEntry) => ResellerWalletLedgerEntry
): ResellerWalletLedgerEntry | null {
  const s = ensureStore();
  const idx = s.ledger.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;
  s.ledger[idx] = updater(s.ledger[idx]);
  recomputeBalance(s.ledger[idx].resellerId);
  notify();
  return s.ledger[idx];
}

export function internalAddWithdrawalRequest(
  req: ResellerWithdrawalRequest
): ResellerWithdrawalRequest {
  const s = ensureStore();
  s.withdrawalRequests = [req, ...s.withdrawalRequests];
  notify();
  return req;
}

export function internalRemoveWithdrawalRequest(
  resellerId: string,
  requestId: string
): ResellerWithdrawalRequest | null {
  const s = ensureStore();
  const found = s.withdrawalRequests.find(
    (r) => r.id === requestId && r.resellerId === resellerId
  );
  if (!found) return null;
  s.withdrawalRequests = s.withdrawalRequests.filter(
    (r) => r.id !== requestId
  );
  notify();
  return found;
}

export function internalAddWithdrawalHistory(
  entry: ResellerWithdrawalHistoryEntry
): ResellerWithdrawalHistoryEntry {
  const s = ensureStore();
  s.withdrawalHistory = [entry, ...s.withdrawalHistory];
  notify();
  return entry;
}

export function resetResellerWalletStoreForTest(): void {
  store = seedResellerWalletStore();
  notify();
}