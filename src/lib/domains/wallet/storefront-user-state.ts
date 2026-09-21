import type {
  StorefrontFundingLedgerEntry,
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
  StorefrontUserWalletRecord,
  StorefrontUserWalletState,
  StorefrontWalletLedgerEntry,
} from "./storefront-user-types";

const STORAGE_KEY = "atlas-storefront-user-state-v1";

function loadSeed(): StorefrontUserWalletState {
  return {
    wallets: {},
    fundingLedger: [],
    refundRequests: [],
    refundHistory: [],
  };
}

function readFromStorage(): StorefrontUserWalletState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorefrontUserWalletState;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.wallets ||
      !Array.isArray(parsed.fundingLedger) ||
      !Array.isArray(parsed.refundRequests) ||
      !Array.isArray(parsed.refundHistory)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(state: StorefrontUserWalletState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let store: StorefrontUserWalletState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): StorefrontUserWalletState {
  if (store) return store;
  const fromStorage = readFromStorage();
  store = fromStorage ?? loadSeed();
  return store;
}

function notify() {
  if (store) writeToStorage(store);
  for (const fn of listeners) fn();
}

export function isStorefrontUserStateLoaded(): boolean {
  return store !== null;
}

export function getStorefrontUserState(): StorefrontUserWalletState {
  return ensureStore();
}

export function subscribeToStorefrontUserState(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalPatchStorefrontUserWallet(
  walletId: string,
  updater: (w: StorefrontUserWalletRecord) => StorefrontUserWalletRecord
): StorefrontUserWalletRecord | null {
  const s = ensureStore();
  const w = s.wallets[walletId];
  if (!w) return null;
  s.wallets[walletId] = updater(w);
  notify();
  return s.wallets[walletId];
}

export function internalSetStorefrontUserWallet(
  wallet: StorefrontUserWalletRecord
): StorefrontUserWalletRecord {
  const s = ensureStore();
  s.wallets[wallet.id] = wallet;
  notify();
  return wallet;
}

export function internalAppendStorefrontLedgerEntry(
  entry: StorefrontWalletLedgerEntry
): StorefrontWalletLedgerEntry {
  const s = ensureStore();
  s.fundingLedger = [entry, ...s.fundingLedger];
  notify();
  return entry;
}

export function internalAddStorefrontRefundRequest(
  req: StorefrontRefundRequest
): StorefrontRefundRequest {
  const s = ensureStore();
  s.refundRequests = [req, ...s.refundRequests];
  notify();
  return req;
}

export function internalRemoveStorefrontRefundRequest(
  requestId: string
): StorefrontRefundRequest | null {
  const s = ensureStore();
  const found = s.refundRequests.find((r) => r.id === requestId);
  if (!found) return null;
  s.refundRequests = s.refundRequests.filter((r) => r.id !== requestId);
  notify();
  return found;
}

export function internalPatchStorefrontRefundRequest(
  requestId: string,
  updater: (r: StorefrontRefundRequest) => StorefrontRefundRequest
): StorefrontRefundRequest | null {
  const s = ensureStore();
  const idx = s.refundRequests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  s.refundRequests[idx] = updater(s.refundRequests[idx]);
  notify();
  return s.refundRequests[idx];
}

export function internalAddStorefrontRefundHistory(
  entry: StorefrontRefundHistoryEntry
): StorefrontRefundHistoryEntry {
  const s = ensureStore();
  s.refundHistory = [entry, ...s.refundHistory];
  notify();
  return entry;
}

export function internalDeleteStorefrontUserWallet(walletId: string): boolean {
  const s = ensureStore();
  if (!s.wallets[walletId]) return false;
  delete s.wallets[walletId];
  s.fundingLedger = s.fundingLedger.filter((e) => e.walletId !== walletId);
  s.refundRequests = s.refundRequests.filter((r) => r.walletId !== walletId);
  s.refundHistory = s.refundHistory.filter((r) => r.walletId !== walletId);
  notify();
  return true;
}

export function resetStorefrontUserStateForTest(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  store = loadSeed();
  notify();
}

// Unused re-exports kept for type compatibility. Remove when the pool
// reconciliation audit is complete.
export const __unusedFundingEntry: StorefrontFundingLedgerEntry | undefined =
  undefined;