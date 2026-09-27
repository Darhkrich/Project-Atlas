// config/subscription-plans.ts
//
// Compatibility shim. The authoritative subscription plan source is
// lib/domains/subscriptions/. This file re-exports the domain's public
// surface under the names existing consumers already import. Delete this
// shim in a follow-up batch once every consumer migrates to the domain
// module directly.

import {
  getPlans,
  getPlanByCode as domainGetPlanByCode,
  liveSubscriptionPlans,
} from "@/lib/domains/subscriptions";

export type {
  SubscriptionPlan,
  FeatureSet,
  PlanVisibility,
  SupportTier,
  CreatePlanInput,
  UpdatePlanInput,
  PlanMutationResult,
  StorefrontPaymentMethod,
  StorefrontTheme,
} from "@/lib/domains/subscriptions";

/**
 * Plan code is a runtime string. Plans are created, edited, and deleted
 * at runtime. Any code previously narrowed to a four-literal union now
 * reads as string.
 */
export type PlanCode = string;

/**
 * Live array. Same reference across the app. Store mutations repopulate
 * it in place, so consumers reading it directly see fresh data without a
 * subscription.
 */
export const subscriptionPlans = liveSubscriptionPlans;

/**
 * Throws when the code does not resolve. Matches the previous behavior
 * of this function. New code should import the non-throwing
 * getPlanByCode from @/lib/domains/subscriptions.
 */
export function getPlanByCode(code: string) {
  const plan = domainGetPlanByCode(code);
  if (!plan) {
    throw new Error("Unknown plan code: " + code);
  }
  return plan;
}

/**
 * Non-throwing variant. Returns undefined when the code does not
 * resolve. Use this in new code.
 */
export function tryGetPlanByCode(code: string) {
  return domainGetPlanByCode(code);
}

/** Convenience for callers that only need the live count. */
export function getPlanCount(): number {
  return getPlans().length;
}