// lib/merchant/billing/store.ts
//
// Single mutable source of truth for merchant invoices. Keyed by
// merchantId. Subscribers are notified after any write.
//
// In-memory only for this batch. Persistence is registered for the
// follow-up that also persists the merchant money store and the
// subscription store.

import type {
  MerchantInvoice,
  MerchantInvoiceStoreState,
} from "./types";

type Listener = () => void;

let store: MerchantInvoiceStoreState | null = null;
let version = 0;
const listeners = new Set<Listener>();

function ensureStore(): MerchantInvoiceStoreState {
  if (store === null) store = {};
  return store;
}

function notify() {
  version += 1;
  for (const fn of listeners) fn();
}

export function isInvoiceStoreLoaded(): boolean {
  return store !== null;
}

export function getInvoiceStoreVersion(): number {
  return version;
}

export function getInvoicesForMerchant(
  merchantId: string
): MerchantInvoice[] {
  const s = ensureStore();
  return s[merchantId] ?? [];
}

export function getAllInvoices(): MerchantInvoice[] {
  const s = ensureStore();
  const out: MerchantInvoice[] = [];
  for (const list of Object.values(s)) out.push(...list);
  return out;
}

export function subscribeToInvoiceStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalAppendInvoice(
  invoice: MerchantInvoice
): MerchantInvoice {
  const s = ensureStore();
  const list = s[invoice.merchantId] ?? [];
  s[invoice.merchantId] = [invoice, ...list];
  notify();
  return invoice;
}

export function internalPatchInvoice(
  merchantId: string,
  invoiceId: string,
  updater: (inv: MerchantInvoice) => MerchantInvoice
): MerchantInvoice | null {
  const s = ensureStore();
  const list = s[merchantId];
  if (!list) return null;
  const idx = list.findIndex((i) => i.id === invoiceId);
  if (idx === -1) return null;
  list[idx] = updater(list[idx]);
  s[merchantId] = [...list];
  notify();
  return list[idx];
}

export function resetInvoiceStoreForTest(): void {
  store = {};
  version = 0;
  notify();
}