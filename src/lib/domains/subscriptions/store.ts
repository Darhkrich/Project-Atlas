// lib/domains/subscriptions/store.ts
//
// Single mutable source of truth for subscription plans. Subscribers are
// notified after any mutation. The exported live array is the same
// reference the config shim re-exports, so existing consumers reading
// `subscriptionPlans` see fresh data without a subscription.

import type { SubscriptionPlan } from "./types";
import { seedSubscriptionPlans } from "./seed";
import { sortPlans } from "./helpers";

type Listener = () => void;

let plans: SubscriptionPlan[] | null = null;
const listeners = new Set<Listener>();

// Live array. Mutated in place so external references stay current.
export const liveSubscriptionPlans: SubscriptionPlan[] = [];

function ensureLoaded(): SubscriptionPlan[] {
  if (plans === null) {
    plans = sortPlans(seedSubscriptionPlans());
    syncLiveArray();
  }
  return plans;
}

function syncLiveArray(): void {
  liveSubscriptionPlans.length = 0;
  for (const plan of plans ?? []) {
    liveSubscriptionPlans.push(plan);
  }
}

export function getPlans(): SubscriptionPlan[] {
  return [...ensureLoaded()];
}

export function getActivePlans(): SubscriptionPlan[] {
  return ensureLoaded().filter((p) => p.visibility === "public");
}

export function getPlanByCode(code: string): SubscriptionPlan | undefined {
  return ensureLoaded().find((p) => p.code === code);
}

export function subscribeToPlanStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyPlanStore(): void {
  listeners.forEach((l) => l());
}

export function isPlanStoreLoaded(): boolean {
  return plans !== null;
}

export function resetPlansForTest(): void {
  plans = sortPlans(seedSubscriptionPlans());
  syncLiveArray();
  notifyPlanStore();
}

export function internalAppendPlan(plan: SubscriptionPlan): void {
  const list = ensureLoaded();
  list.push(plan);
  plans = sortPlans(list);
  syncLiveArray();
}

export function internalReplacePlan(
  code: string,
  next: SubscriptionPlan
): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((p) => p.code === code);
  if (idx === -1) return false;
  const nextList = [...list];
  nextList[idx] = next;
  plans = sortPlans(nextList);
  syncLiveArray();
  return true;
}

export function internalRemovePlan(code: string): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((p) => p.code === code);
  if (idx === -1) return false;
  plans = list.filter((p) => p.code !== code);
  syncLiveArray();
  return true;
}