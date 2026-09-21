import type {
  StorefrontCustomerRecord,
  StorefrontCustomerState,
} from "../../storefront/types";

type Listener = () => void;

let store: StorefrontCustomerState | null = null;
const listeners = new Set<Listener>();

function ensureStore(): StorefrontCustomerState {
  if (store === null) store = { customers: {} };
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isStorefrontCustomerStoreLoaded(): boolean {
  return store !== null;
}

export function getStorefrontCustomerState(): StorefrontCustomerState {
  return ensureStore();
}

export function subscribeToStorefrontCustomerStore(
  listener: Listener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalUpsertStorefrontCustomer(
  customer: StorefrontCustomerRecord
): StorefrontCustomerRecord {
  const s = ensureStore();
  s.customers[customer.id] = customer;
  notify();
  return customer;
}

export function internalPatchStorefrontCustomer(
  customerId: string,
  updater: (c: StorefrontCustomerRecord) => StorefrontCustomerRecord
): StorefrontCustomerRecord | null {
  const s = ensureStore();
  const current = s.customers[customerId];
  if (!current) return null;
  s.customers[customerId] = updater(current);
  notify();
  return s.customers[customerId];
}

export function resetStorefrontCustomerStoreForTest(): void {
  store = { customers: {} };
  notify();
}