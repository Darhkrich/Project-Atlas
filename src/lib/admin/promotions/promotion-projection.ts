import type {
  Promotion,
  PromotionAudience,
  PromotionConditions,
  PromotionStatus,
} from "@/lib/admin/types/promotion";
import { PROMOTION_SERVICE_LABEL } from "./promotion-labels";

/* ------------------------------ Status -------------------------------- */

export function promotionStatus(
  promo: Promotion,
  now: number
): PromotionStatus {
  if (promo.endedAt) return "ended";
  const start = new Date(promo.startDate).getTime();
  const end = new Date(promo.endDate).getTime();
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

/* ------------------------------ Conditions ---------------------------- */

export function conditionSummary(conditions: PromotionConditions): string {
  const parts: string[] = [];

  if (conditions.firstOrderOnly) {
    parts.push("First order only");
  }
  if (typeof conditions.minOrders === "number") {
    parts.push(
      "After " +
        conditions.minOrders +
        " order" +
        (conditions.minOrders === 1 ? "" : "s")
    );
  }
  if (
    typeof conditions.minSpendGHS === "number" &&
    typeof conditions.maxSpendGHS === "number"
  ) {
    parts.push(
      "Spend GHS " +
        conditions.minSpendGHS +
        "–" +
        conditions.maxSpendGHS
    );
  } else if (typeof conditions.minSpendGHS === "number") {
    parts.push("Spend GHS " + conditions.minSpendGHS + " or more");
  } else if (typeof conditions.maxSpendGHS === "number") {
    parts.push("Spend up to GHS " + conditions.maxSpendGHS);
  }

  if (conditions.serviceScope && conditions.serviceScope.length > 0) {
    parts.push(
      conditions.serviceScope
        .map((s) => PROMOTION_SERVICE_LABEL[s])
        .join(", ")
    );
  }
  if (conditions.tierIds && conditions.tierIds.length > 0) {
    parts.push(
      conditions.tierIds.length +
        " tier" +
        (conditions.tierIds.length === 1 ? "" : "s")
    );
  }
  if (conditions.audienceTargets && conditions.audienceTargets.length > 0) {
    parts.push(
      conditions.audienceTargets.length +
        " selected " +
        (conditions.audienceTargets.length === 1 ? "account" : "accounts")
    );
  }

  if (parts.length === 0) return "No conditions. Applies to everyone.";
  return parts.join(" · ");
}

/* ------------------------------ Summary ------------------------------- */

export interface PromotionSummary {
  total: number;
  active: number;
  scheduled: number;
  expiringSoon: number;
  expired: number;
  ended: number;
  generalCount: number;
  resellerCount: number;
}

const SEVEN_DAYS = 7 * 86_400_000;

export function projectPromotionSummary(
  promos: Promotion[],
  resellerBoostCount: number,
  now: number
): PromotionSummary {
  let active = 0;
  let scheduled = 0;
  let expiringSoon = 0;
  let expired = 0;
  let ended = 0;

  for (const p of promos) {
    const status = promotionStatus(p, now);
    if (status === "active") {
      active += 1;
      const end = new Date(p.endDate).getTime();
      if (end - now <= SEVEN_DAYS && end >= now) expiringSoon += 1;
    } else if (status === "scheduled") scheduled += 1;
    else if (status === "expired") expired += 1;
    else if (status === "ended") ended += 1;
  }

  return {
    total: promos.length + resellerBoostCount,
    active,
    scheduled,
    expiringSoon,
    expired,
    ended,
    generalCount: promos.length,
    resellerCount: resellerBoostCount,
  };
}

/* ------------------------------ Filters ------------------------------- */

export interface PromotionFilters {
  q: string;
  status: string;
  audience: string;
  mechanic: string;
  view: string;
}

export function filterPromotions(
  promos: Promotion[],
  filters: PromotionFilters,
  now: number
): Promotion[] {
  const q = filters.q.trim().toLowerCase();
  return promos.filter((p) => {
    if (q) {
      const hay = (p.name + " " + p.description).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.status && promotionStatus(p, now) !== filters.status) {
      return false;
    }
    if (filters.audience && p.audience !== filters.audience) return false;
    if (filters.mechanic && p.mechanic.kind !== filters.mechanic) return false;
    if (filters.view === "expiring") {
      if (promotionStatus(p, now) !== "active") return false;
      const end = new Date(p.endDate).getTime();
      if (end - now > SEVEN_DAYS || end < now) return false;
    }
    return true;
  });
}

export function sortPromotions(
  promos: Promotion[],
  now: number
): Promotion[] {
  const weight: Record<PromotionStatus, number> = {
    active: 0,
    scheduled: 1,
    expired: 2,
    ended: 3,
  };
  return [...promos].sort((a, b) => {
    const wa = weight[promotionStatus(a, now)];
    const wb = weight[promotionStatus(b, now)];
    if (wa !== wb) return wa - wb;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
}

/* ------------------------------ Audience filter ----------------------- */

export function audienceCount(
  promos: Promotion[],
  audience: PromotionAudience
): number {
  return promos.filter((p) => p.audience === audience).length;
}