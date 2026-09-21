import type {
  ResellerSavedMethodsStoreState,
  ResellerSavedPaymentMethod,
} from "@/lib/reseller/types/wallet";

const SEED: ResellerSavedMethodsStoreState = {
  savedMethods: [],
};

let store: ResellerSavedMethodsStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): ResellerSavedMethodsStoreState {
  if (!store) store = structuredClone(SEED);
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isResellerSavedMethodsStoreLoaded(): boolean {
  return store !== null;
}

export function getResellerSavedMethodsStore(): ResellerSavedMethodsStoreState {
  return ensureStore();
}

export function subscribeToResellerSavedMethodsStore(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getResellerSavedMethodsFor(
  resellerId: string
): ResellerSavedPaymentMethod[] {
  const s = ensureStore();
  return s.savedMethods.filter((m) => m.resellerId === resellerId);
}

export function internalAddResellerSavedMethod(
  method: ResellerSavedPaymentMethod
): ResellerSavedPaymentMethod {
  const s = ensureStore();
  s.savedMethods = [...s.savedMethods, method];
  notify();
  return method;
}

export function internalPatchResellerSavedMethod(
  methodId: string,
  updater: (m: ResellerSavedPaymentMethod) => ResellerSavedPaymentMethod
): ResellerSavedPaymentMethod | null {
  const s = ensureStore();
  const idx = s.savedMethods.findIndex((m) => m.id === methodId);
  if (idx === -1) return null;
  s.savedMethods[idx] = updater(s.savedMethods[idx]);
  notify();
  return s.savedMethods[idx];
}

export function internalRemoveResellerSavedMethod(
  methodId: string
): ResellerSavedPaymentMethod | null {
  const s = ensureStore();
  const found = s.savedMethods.find((m) => m.id === methodId);
  if (!found) return null;
  s.savedMethods = s.savedMethods.filter((m) => m.id !== methodId);
  notify();
  return found;
}

export function resetResellerSavedMethodsStoreForTest(): void {
  store = structuredClone(SEED);
  notify();
}