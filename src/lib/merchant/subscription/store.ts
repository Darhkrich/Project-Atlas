// lib/merchant/subscription/store.ts

import type {
  MerchantSubscriptionState,
  SubscriptionStoreState,
} from "./types";
import { buildBlankSubscription } from "./seed";
import {
  TRIAL_PLAN_CODE,
  TRIAL_PLAN_NAME,
  DEFAULT_BILLING_CYCLE,
} from "./constants";

type Listener = () => void;

let store: SubscriptionStoreState | null = null;
let version = 0;
const listeners = new Set<Listener>();

function ensureStore(): SubscriptionStoreState {
  if (store === null) store = {};
  return store;
}

function notify() {
  version += 1;
  for (const fn of listeners) fn();
}

export function isSubscriptionStoreLoaded(): boolean {
  return store !== null;
}

export function getSubscriptionStoreVersion(): number {
  return version;
}

export function getSubscriptionForMerchant(
  merchantId: string
): MerchantSubscriptionState | null {
  const s = ensureStore();
  return s[merchantId] ?? null;
}

export function ensureMerchantSubscription(
  merchantId: string
): MerchantSubscriptionState {
  const s = ensureStore();
  const existing = s[merchantId];
  if (existing) return existing;
  const created = buildBlankSubscription(
    merchantId,
    TRIAL_PLAN_CODE,
    TRIAL_PLAN_NAME,
    DEFAULT_BILLING_CYCLE,
    Date.now()
  );
  s[merchantId] = created;
  notify();
  return created;
}

export function getAllSubscriptions(): MerchantSubscriptionState[] {
  const s = ensureStore();
  return Object.values(s);
}

export function subscribeToSubscriptionStore(
  listener: Listener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalUpsertSubscription(
  merchantId: string,
  subscription: MerchantSubscriptionState
): MerchantSubscriptionState {
  const s = ensureStore();
  s[merchantId] = subscription;
  notify();
  return subscription;
}

export function internalPatchSubscription(
  merchantId: string,
  patch: Partial<MerchantSubscriptionState>
): MerchantSubscriptionState | null {
  const s = ensureStore();
  const existing = s[merchantId];
  if (!existing) return null;
  const next = { ...existing, ...patch };
  s[merchantId] = next;
  notify();
  return next;
}

export function resetSubscriptionStoreForTest(): void {
  store = {};
  version = 0;
  notify();
}