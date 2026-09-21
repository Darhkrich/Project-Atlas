import type {
  Payment,
  PaymentFlag,
  PaymentReconciliation,
  PaymentStoreState,
} from "@/lib/admin/types/payment";
import {
  seededFlags,
  seededPayments,
  seededReconciliations,
} from "./payments-seed";

let store: PaymentStoreState | null = null;
const listeners = new Set<() => void>();

function loadSeed(): PaymentStoreState {
  return {
    payments: structuredClone(seededPayments),
    reconciliations: structuredClone(seededReconciliations),
    flags: structuredClone(seededFlags),
  };
}

function ensureStore(): PaymentStoreState {
  if (!store) store = loadSeed();
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isPaymentStoreLoaded(): boolean {
  return store !== null;
}

export function getPaymentStore(): PaymentStoreState {
  return ensureStore();
}

export function subscribeToPaymentStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPaymentById(id: string): Payment | undefined {
  return ensureStore().payments.find((p) => p.id === id);
}

export function getReconciliationsFor(paymentId: string): PaymentReconciliation[] {
  return ensureStore().reconciliations.filter(
    (r) => r.paymentId === paymentId
  );
}

export function getFlagsFor(paymentId: string): PaymentFlag[] {
  return ensureStore().flags.filter((f) => f.paymentId === paymentId);
}

export function internalPatchPayment(
  id: string,
  updater: (p: Payment) => Payment
): Payment | null {
  const s = ensureStore();
  const idx = s.payments.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next = updater(s.payments[idx]);
  s.payments[idx] = next;
  notify();
  return next;
}

export function internalAddReconciliation(rec: PaymentReconciliation) {
  const s = ensureStore();
  s.reconciliations.push(rec);
  notify();
}

export function internalAddFlag(flag: PaymentFlag) {
  const s = ensureStore();
  s.flags.push(flag);
  notify();
}

export function internalResolveFlag(
  flagId: string,
  patch: Partial<PaymentFlag>
): PaymentFlag | null {
  const s = ensureStore();
  const idx = s.flags.findIndex((f) => f.id === flagId);
  if (idx === -1) return null;
  s.flags[idx] = { ...s.flags[idx], ...patch };
  notify();
  return s.flags[idx];
}

export function resetPaymentStoreForTest() {
  store = loadSeed();
  notify();
}