import type {
  MerchantSavedMethodsStoreState,
  MerchantSavedPaymentMethod,
} from "@/lib/merchant/types/wallet";

const SEED: MerchantSavedMethodsStoreState = {
  savedMethods: [],
};

let store: MerchantSavedMethodsStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): MerchantSavedMethodsStoreState {
  if (!store) store = structuredClone(SEED);
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isMerchantSavedMethodsStoreLoaded(): boolean {
  return store !== null;
}

export function getMerchantSavedMethodsStore(): MerchantSavedMethodsStoreState {
  return ensureStore();
}

export function subscribeToMerchantSavedMethodsStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMerchantSavedMethodsFor(
  merchantId: string
): MerchantSavedPaymentMethod[] {
  const s = ensureStore();
  return s.savedMethods.filter((m) => m.merchantId === merchantId);
}

export function internalAddMerchantSavedMethod(
  method: MerchantSavedPaymentMethod
): MerchantSavedPaymentMethod {
  const s = ensureStore();
  s.savedMethods = [...s.savedMethods, method];
  notify();
  return method;
}

export function internalPatchMerchantSavedMethod(
  methodId: string,
  updater: (m: MerchantSavedPaymentMethod) => MerchantSavedPaymentMethod
): MerchantSavedPaymentMethod | null {
  const s = ensureStore();
  const idx = s.savedMethods.findIndex((m) => m.id === methodId);
  if (idx === -1) return null;
  s.savedMethods[idx] = updater(s.savedMethods[idx]);
  notify();
  return s.savedMethods[idx];
}

export function internalRemoveMerchantSavedMethod(
  methodId: string
): MerchantSavedPaymentMethod | null {
  const s = ensureStore();
  const found = s.savedMethods.find((m) => m.id === methodId);
  if (!found) return null;
  s.savedMethods = s.savedMethods.filter((m) => m.id !== methodId);
  notify();
  return found;
}

export function resetMerchantSavedMethodsStoreForTest(): void {
  store = structuredClone(SEED);
  notify();
}