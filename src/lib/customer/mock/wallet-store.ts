import type {
  CustomerFundingTransaction,
  CustomerWalletRecord,
  CustomerWalletStoreState,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import { seedCustomerWalletStore } from "@/lib/customer/wallet/wallet-seed";

type Listener = () => void;

let store: CustomerWalletStoreState | null = null;
const listeners = new Set<Listener>();

function ensureStore(): CustomerWalletStoreState {
  if (store === null) store = seedCustomerWalletStore();
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isCustomerWalletStoreLoaded(): boolean {
  return store !== null;
}

export function getCustomerWalletStore(): CustomerWalletStoreState {
  return ensureStore();
}

export function subscribeToCustomerWalletStore(
  listener: Listener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalPatchCustomerWallet(
  customerId: string,
  updater: (w: CustomerWalletRecord) => CustomerWalletRecord
): CustomerWalletRecord | null {
  const s = ensureStore();
  const id = "WAL-" + customerId;
  const current = s.wallets[id];
  if (!current) return null;
  s.wallets[id] = updater(current);
  notify();
  return s.wallets[id];
}

export function internalAddFundingTransaction(
  tx: CustomerFundingTransaction
): CustomerFundingTransaction {
  const s = ensureStore();
  s.fundingTransactions = [tx, ...s.fundingTransactions];
  const id = "WAL-" + tx.customerId;
  const w = s.wallets[id];
  if (w) {
    s.wallets[id] = {
      ...w,
      lastFundingAt: tx.createdAt,
      updatedAt: tx.createdAt,
    };
  }
  notify();
  return tx;
}

export function internalAddWithdrawalRequest(
  req: CustomerWithdrawalRequest
): CustomerWithdrawalRequest {
  const s = ensureStore();
  s.withdrawalRequests = [req, ...s.withdrawalRequests];
  notify();
  return req;
}

export function internalRemoveWithdrawalRequest(
  customerId: string,
  requestId: string
): CustomerWithdrawalRequest | null {
  const s = ensureStore();
  const found = s.withdrawalRequests.find(
    (r) => r.id === requestId && r.customerId === customerId
  );
  if (!found) return null;
  s.withdrawalRequests = s.withdrawalRequests.filter(
    (r) => r.id !== requestId
  );
  notify();
  return found;
}

export function internalAddWithdrawalHistory(
  entry: CustomerWithdrawalHistoryEntry
): CustomerWithdrawalHistoryEntry {
  const s = ensureStore();
  s.withdrawalHistory = [entry, ...s.withdrawalHistory];
  const id = "WAL-" + entry.customerId;
  const w = s.wallets[id];
  if (w) {
    s.wallets[id] = {
      ...w,
      lastWithdrawalAt: entry.resolvedAt,
      updatedAt: entry.resolvedAt,
    };
  }
  notify();
  return entry;
}

export function resetCustomerWalletStoreForTest(): void {
  store = seedCustomerWalletStore();
  notify();
}