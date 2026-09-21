import type {
  CustomerSavedMethodsStoreState,
  CustomerSavedPaymentMethod,
} from "@/lib/customer/types/wallet";

const SEED: CustomerSavedMethodsStoreState = {
  savedMethods: [],
};

let store: CustomerSavedMethodsStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): CustomerSavedMethodsStoreState {
  if (!store) store = structuredClone(SEED);
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isSavedMethodsStoreLoaded(): boolean {
  return store !== null;
}

export function getSavedMethodsStore(): CustomerSavedMethodsStoreState {
  return ensureStore();
}

export function subscribeToSavedMethodsStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSavedMethodsFor(
  customerId: string
): CustomerSavedPaymentMethod[] {
  const s = ensureStore();
  return s.savedMethods.filter((m) => m.customerId === customerId);
}

export function internalAddSavedMethod(
  method: CustomerSavedPaymentMethod
): CustomerSavedPaymentMethod {
  const s = ensureStore();
  s.savedMethods = [...s.savedMethods, method];
  notify();
  return method;
}

export function internalPatchSavedMethod(
  methodId: string,
  updater: (m: CustomerSavedPaymentMethod) => CustomerSavedPaymentMethod
): CustomerSavedPaymentMethod | null {
  const s = ensureStore();
  const idx = s.savedMethods.findIndex((m) => m.id === methodId);
  if (idx === -1) return null;
  s.savedMethods[idx] = updater(s.savedMethods[idx]);
  notify();
  return s.savedMethods[idx];
}

export function internalRemoveSavedMethod(
  methodId: string
): CustomerSavedPaymentMethod | null {
  const s = ensureStore();
  const found = s.savedMethods.find((m) => m.id === methodId);
  if (!found) return null;
  s.savedMethods = s.savedMethods.filter((m) => m.id !== methodId);
  notify();
  return found;
}

export function resetSavedMethodsStoreForTest(): void {
  store = structuredClone(SEED);
  notify();
}