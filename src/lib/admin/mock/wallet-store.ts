import type {
  CustomerWallet,
  WalletStoreState,
  WalletWithdrawalHistoryEntry,
  WalletWithdrawalRequest,
} from "../types/customer-wallet";
import { seedStorefrontUserWalletStore } from "../wallets/storefront-user-seed";

type Listener = () => void;

let store: WalletStoreState | null = null;
const listeners = new Set<Listener>();

function ensureStore(): WalletStoreState {
  if (store === null) store = seedStorefrontUserWalletStore();
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isWalletStoreLoaded(): boolean {
  return store !== null;
}

export function getWalletStore(): WalletStoreState {
  return ensureStore();
}

export function subscribeToWalletStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalPatchWallet(
  walletId: string,
  updater: (w: CustomerWallet) => CustomerWallet
): CustomerWallet | null {
  const s = ensureStore();
  const w = s.wallets[walletId];
  if (!w) return null;
  s.wallets[walletId] = updater(w);
  notify();
  return s.wallets[walletId];
}

export function internalPatchWithdrawal(
  requestId: string,
  updater: (r: WalletWithdrawalRequest) => WalletWithdrawalRequest
): WalletWithdrawalRequest | null {
  const s = ensureStore();
  const idx = s.withdrawalRequests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  s.withdrawalRequests[idx] = updater(s.withdrawalRequests[idx]);
  notify();
  return s.withdrawalRequests[idx];
}

export function internalMoveToHistory(
  requestId: string,
  actorName: string,
  status: WalletWithdrawalHistoryEntry["status"],
  opts?: {
    rejectionReason?: string;
    failureReason?: WalletWithdrawalHistoryEntry["failureReason"];
  }
): WalletWithdrawalHistoryEntry | null {
  const s = ensureStore();
  const idx = s.withdrawalRequests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  const req = s.withdrawalRequests[idx];
  const resolvedAt = new Date().toISOString();
  const entry: WalletWithdrawalHistoryEntry = {
    ...req,
    status,
    rejectionReason: opts?.rejectionReason ?? req.rejectionReason,
    failureReason: opts?.failureReason ?? req.failureReason,
    approvedBy: actorName,
    resolvedAt,
  };
  s.withdrawalRequests = s.withdrawalRequests.filter(
    (r) => r.id !== requestId
  );
  s.withdrawalHistory = [entry, ...s.withdrawalHistory];
  notify();
  return entry;
}

export function resetWalletStoreForTest(): void {
  store = seedStorefrontUserWalletStore();
  notify();
}