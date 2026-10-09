import { tryGetPlanByCode } from "@/config/subscription-plans";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

export interface ProductLimitEvaluation {
  planId: string;
  planName: string | null;
  maxProducts: number | "unlimited";
  currentCount: number;
  remaining: number | null;
  percentUsed: number;
  atLimit: boolean;
  nearLimit: boolean;
  isUnlimited: boolean;
  isResolved: boolean;
}

const NEAR_LIMIT_THRESHOLD = 90;
const FALLBACK_PLAN_ID = "starter";

/**
 * Reads the planId off the storefront config. Falls back to starter when
 * the config carries no plan yet. The subscription context holds a second
 * plan reference keyed by user email; that source is not consulted here.
 * Reconcile the two in a follow-up batch.
 */
export function resolveActivePlanId(
  config: MerchantStorefrontConfig
): string {
  return config.planId && config.planId.length > 0
    ? config.planId
    : FALLBACK_PLAN_ID;
}

/**
 * Pure evaluation. Given a plan code and the merchant's current product
 * count, returns the limit verdict. When the plan code does not resolve,
 * the limit is treated as unlimited so a stale plan reference never
 * blocks the merchant. The banner surfaces the missing-plan state.
 */
export function evaluateProductLimit(
  planId: string | undefined,
  currentCount: number
): ProductLimitEvaluation {
  const resolvedId =
    planId && planId.length > 0 ? planId : FALLBACK_PLAN_ID;
  const count = Math.max(0, Math.floor(currentCount));
  const plan = tryGetPlanByCode(resolvedId);

  if (!plan) {
    return {
      planId: resolvedId,
      planName: null,
      maxProducts: "unlimited",
      currentCount: count,
      remaining: null,
      percentUsed: 0,
      atLimit: false,
      nearLimit: false,
      isUnlimited: true,
      isResolved: false,
    };
  }

  if (plan.maxProducts === "unlimited") {
    return {
      planId: resolvedId,
      planName: plan.name,
      maxProducts: "unlimited",
      currentCount: count,
      remaining: null,
      percentUsed: 0,
      atLimit: false,
      nearLimit: false,
      isUnlimited: true,
      isResolved: true,
    };
  }

  const max = plan.maxProducts;
  const remaining = Math.max(0, max - count);
  const percentUsed =
    max > 0 ? Math.min(100, (count / max) * 100) : 100;
  const atLimit = count >= max;
  const nearLimit = !atLimit && percentUsed >= NEAR_LIMIT_THRESHOLD;

  return {
    planId: resolvedId,
    planName: plan.name,
    maxProducts: max,
    currentCount: count,
    remaining,
    percentUsed,
    atLimit,
    nearLimit,
    isUnlimited: false,
    isResolved: true,
  };
}

export interface AddProductGateResult {
  ok: boolean;
  error?: string;
}

export function evaluateAddProductGate(
  evaluation: ProductLimitEvaluation
): AddProductGateResult {
  if (evaluation.isUnlimited) return { ok: true };
  if (!evaluation.atLimit) return { ok: true };
  return {
    ok: false,
    error:
      "Product limit reached on the " +
      (evaluation.planName ?? evaluation.planId) +
      " plan. Upgrade to add more.",
  };
}