import type { Merchant } from "../types/merchant";
import { mockMerchants } from "./merchants";

/**
 * The single mutable source of truth for merchant records. Cloned from
 * the seed on first read so the source catalog is never touched.
 *
 * Do not call applyMerchantPatch directly from components. Route writes
 * through lib/admin/merchants/merchant-mutations.ts so both the activity
 * log and the audit trail are written on every change.
 */

interface StoreState {
  merchants: Merchant[];
  loaded: boolean;
}

const state: StoreState = {
  merchants: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.merchants = structuredClone(mockMerchants);
  state.loaded = true;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToMerchantStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getMerchants(): Merchant[] {
  ensureLoaded();
  return state.merchants;
}

export function getMerchantById(id: string): Merchant | undefined {
  ensureLoaded();
  return state.merchants.find((m) => m.id === id);
}

/* ------------------------------ Writes -------------------------------- */

/**
 * Internal. Called by merchant-mutations.ts. Passes the current merchant
 * to the updater and replaces it with the return value.
 */
export function applyMerchantPatch(
  id: string,
  updater: (current: Merchant) => Merchant
): Merchant | null {
  ensureLoaded();
  let next: Merchant | null = null;
  state.merchants = state.merchants.map((m) => {
    if (m.id !== id) return m;
    next = updater(m);
    return next;
  });
  if (next) notify();
  return next;
}

/**
 * Internal. Called by merchant-mutations.ts when onboarding.
 */
export function addMerchantToStore(merchant: Merchant): void {
  ensureLoaded();
  state.merchants = [merchant, ...state.merchants];
  notify();
}

/**
 * Test-only. Not called at runtime.
 */
export function resetMerchantStoreForTest(): void {
  state.merchants = [];
  state.loaded = false;
  notify();
}