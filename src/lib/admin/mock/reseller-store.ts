import type { Reseller } from "../types/reseller";
import { mockResellers } from "./resellers";

/**
 * The single mutable source of truth for reseller records. The seed is
 * cloned on first read so the source catalog is never touched. Every
 * mutation goes through applyResellerPatch or addResellerToStore, both of
 * which notify subscribers.
 *
 * Do not call the patch functions directly from components. Route writes
 * through lib/admin/resellers/reseller-mutations.ts so both the activity
 * log and the audit trail are written on every change.
 */

interface StoreState {
  resellers: Reseller[];
  loaded: boolean;
}

const state: StoreState = {
  resellers: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.resellers = structuredClone(mockResellers);
  state.loaded = true;
}

/* ------------------------------ Subscribe ------------------------------ */

export function subscribeToResellerStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getResellers(): Reseller[] {
  ensureLoaded();
  return state.resellers;
}

export function getResellerById(id: string): Reseller | undefined {
  ensureLoaded();
  return state.resellers.find((r) => r.id === id);
}

/* ------------------------------ Writes -------------------------------- */

/**
 * Internal. Called by reseller-mutations.ts. Passes the current reseller
 * to the updater and replaces it with the return value.
 */
export function applyResellerPatch(
  id: string,
  updater: (current: Reseller) => Reseller
): Reseller | null {
  ensureLoaded();
  let next: Reseller | null = null;
  state.resellers = state.resellers.map((r) => {
    if (r.id !== id) return r;
    next = updater(r);
    return next;
  });
  if (next) notify();
  return next;
}

/**
 * Internal. Called by reseller-mutations.ts when onboarding a new reseller.
 */
export function addResellerToStore(reseller: Reseller): void {
  ensureLoaded();
  state.resellers = [reseller, ...state.resellers];
  notify();
}

/**
 * Test-only. Not called at runtime.
 */
export function resetResellerStoreForTest(): void {
  state.resellers = [];
  state.loaded = false;
  notify();
}