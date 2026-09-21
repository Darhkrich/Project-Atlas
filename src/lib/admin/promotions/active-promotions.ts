import type {
  Promotion,
  PromotionAudience,
  PromotionContext,
  PromotionSurface,
} from "@/lib/admin/types/promotion";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import { getPromotions } from "@/lib/admin/mock/promotion-store";
import { getPromotions as getResellerBoosts } from "@/lib/admin/mock/reseller-promotion-store";
import {
  promotionStatus,
} from "@/lib/admin/promotions/promotion-projection";
import { promotionStatus as resellerBoostStatus } from "@/lib/admin/resellers/promotion-projection";

/**
 * The read contract for the Atlas storefronts and dashboards. Consumer
 * surfaces call these functions to discover which promotions apply to a
 * given context. The admin pages are the writer; this file is the reader.
 *
 * Swap the underlying imports here when the promotion store moves to a
 * real API. Every consumer keeps the same function signatures.
 */

/* ------------------------------ Filters ------------------------------- */

/**
 * Every promotion that is active on the given surface and audience,
 * evaluated against dates only. Does not check conditions. Cache the
 * result for a minute or two and re-run `conditionApplies` per request.
 */
export function activePromotionsForSurface(
  surface: PromotionSurface,
  audience: PromotionAudience,
  now: number = Date.now()
): Promotion[] {
  return getPromotions().filter((p) => {
    if (p.audience !== audience) return false;
    if (!p.surfaces.includes(surface)) return false;
    return promotionStatus(p, now) === "active";
  });
}

/**
 * Whether a promotion's conditions match the caller's context. Missing
 * fields on the context cause the corresponding condition to fail closed
 * (returns false) rather than pass through. Consumers must supply enough
 * context to make a decision.
 */
export function conditionApplies(
  promo: Promotion,
  context: PromotionContext
): boolean {
  const c = promo.conditions;

  if (c.firstOrderOnly) {
    if (typeof context.ordersCount !== "number") return false;
    if (context.ordersCount !== 0) return false;
  }

  if (typeof c.minOrders === "number") {
    if (typeof context.ordersCount !== "number") return false;
    if (context.ordersCount < c.minOrders) return false;
  }

  if (typeof c.minSpendGHS === "number") {
    const spend = context.windowSpendGHS ?? context.lifetimeSpendGHS;
    if (typeof spend !== "number") return false;
    if (spend < c.minSpendGHS) return false;
  }

  if (typeof c.maxSpendGHS === "number") {
    const spend = context.windowSpendGHS ?? context.lifetimeSpendGHS;
    if (typeof spend !== "number") return false;
    if (spend > c.maxSpendGHS) return false;
  }

  if (c.serviceScope && c.serviceScope.length > 0) {
    if (!context.serviceCategory) return false;
    if (!c.serviceScope.includes(context.serviceCategory)) return false;
  }

  if (c.tierIds && c.tierIds.length > 0) {
    if (!context.tierId) return false;
    if (!c.tierIds.includes(context.tierId)) return false;
  }

  if (c.audienceTargets && c.audienceTargets.length > 0) {
    if (!context.audienceId) return false;
    if (!c.audienceTargets.includes(context.audienceId)) return false;
  }

  return true;
}

/**
 * Composition of the two functions above. Returns every promotion that is
 * active on the surface and whose conditions match the caller's context.
 */
export function applicablePromotions(
  surface: PromotionSurface,
  audience: PromotionAudience,
  context: PromotionContext,
  now: number = Date.now()
): Promotion[] {
  return activePromotionsForSurface(surface, audience, now).filter((p) =>
    conditionApplies(p, context)
  );
}

/* ------------------------------ Reseller boosts ----------------------- */

/**
 * Every commission boost that applies to a specific reseller. Used by the
 * reseller dashboard to preview the reseller's effective commission rate
 * for the current window.
 */
export function activeResellerBoostsFor(
  resellerId: string,
  tierId: string | undefined,
  now: number = Date.now()
): ResellerPromotion[] {
  return getResellerBoosts().filter((p) => {
    if (resellerBoostStatus(p, now) !== "active") return false;
    if (p.scope === "all") return true;
    if (p.scope === "service") return true;
    if (p.scope === "tier") return tierId === p.tierId;
    if (p.scope === "resellers") {
      return (p.resellerIds ?? []).includes(resellerId);
    }
    return false;
  });
}

/**
 * Adds every applicable boost's percentage points to a base rate. Boosts
 * stack additively. If multiple boosts cover the same service, they all
 * apply.
 */
export function effectiveCommissionRate(
  baseRate: number,
  boosts: ResellerPromotion[],
  serviceCategory?: ResellerPromotion["serviceCategories"] extends
    | (infer S)[]
    | undefined
    ? S
    : never
): number {
  let total = baseRate;
  for (const b of boosts) {
    if (serviceCategory && b.scope === "service") {
      const scopes = b.serviceCategories ?? [];
      if (scopes.length > 0 && !scopes.includes(serviceCategory)) continue;
    }
    total += b.boostPercentPoints;
  }
  return Math.round(total * 100) / 100;
}