import type {
  StorefrontSavedMethodsStoreState,
  StorefrontSavedPaymentMethod,
} from "@/lib/storefront-user/types/wallet";

const SEED: StorefrontSavedMethodsStoreState = {
  savedMethods: [],
};

let store: StorefrontSavedMethodsStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): StorefrontSavedMethodsStoreState {
  if (!store) store = structuredClone(SEED);
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isStorefrontSavedMethodsStoreLoaded(): boolean {
  return store !== null;
}

export function getStorefrontSavedMethodsStore(): StorefrontSavedMethodsStoreState {
  return ensureStore();
}

export function subscribeToStorefrontSavedMethodsStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStorefrontSavedMethodsFor(
  walletId: string
): StorefrontSavedPaymentMethod[] {
  const s = ensureStore();
  return s.savedMethods.filter((m) => m.walletId === walletId);
}

export function internalAddStorefrontSavedMethod(
  method: StorefrontSavedPaymentMethod
): StorefrontSavedPaymentMethod {
  const s = ensureStore();
  s.savedMethods = [...s.savedMethods, method];
  notify();
  return method;
}

export function internalPatchStorefrontSavedMethod(
  methodId: string,
  updater: (m: StorefrontSavedPaymentMethod) => StorefrontSavedPaymentMethod
): StorefrontSavedPaymentMethod | null {
  const s = ensureStore();
  const idx = s.savedMethods.findIndex((m) => m.id === methodId);
  if (idx === -1) return null;
  s.savedMethods[idx] = updater(s.savedMethods[idx]);
  notify();
  return s.savedMethods[idx];
}

export function internalRemoveStorefrontSavedMethod(
  methodId: string
): StorefrontSavedPaymentMethod | null {
  const s = ensureStore();
  const found = s.savedMethods.find((m) => m.id === methodId);
  if (!found) return null;
  s.savedMethods = s.savedMethods.filter((m) => m.id !== methodId);
  notify();
  return found;
}

export function internalDeleteSavedMethodsForWallet(walletId: string): void {
  const s = ensureStore();
  s.savedMethods = s.savedMethods.filter((m) => m.walletId !== walletId);
  notify();
}

export function resetStorefrontSavedMethodsStoreForTest(): void {
  store = structuredClone(SEED);
  notify();
}