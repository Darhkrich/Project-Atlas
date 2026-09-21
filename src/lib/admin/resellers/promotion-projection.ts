import type {
  PromotionServiceCategory,
  PromotionStatus,
  ResellerPromotion,
} from "@/lib/admin/types/reseller-promotion";
import type { ResellerTier } from "@/lib/admin/types/commission";
import type { Reseller } from "@/lib/admin/types/reseller";

/* ------------------------------ Status -------------------------------- */

export function promotionStatus(
  promo: ResellerPromotion,
  now: number
): PromotionStatus {
  if (promo.endedAt) return "ended";
  const start = new Date(promo.startDate).getTime();
  const end = new Date(promo.endDate).getTime();
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

export function promotionStatusAt(
  promo: ResellerPromotion,
  at: number
): PromotionStatus {
  return promotionStatus(promo, at);
}

/* ------------------------------ Scope --------------------------------- */

export function affectedServices(
  promo: ResellerPromotion
): PromotionServiceCategory[] {
  if (promo.scope === "service") return promo.serviceCategories ?? [];
  return ["data", "airtime", "bills", "tv", "exam_pins", "other"];
}

export function appliesToReseller(
  promo: ResellerPromotion,
  reseller: Reseller
): boolean {
  if (promo.scope === "all") return true;
  if (promo.scope === "service") return true;
  if (promo.scope === "tier") return reseller.tierId === promo.tierId;
  if (promo.scope === "resellers") {
    return (promo.resellerIds ?? []).includes(reseller.id);
  }
  return false;
}

export function affectedResellers(
  promo: ResellerPromotion,
  resellers: Reseller[]
): Reseller[] {
  return resellers.filter((r) => appliesToReseller(promo, r));
}

export function affectedTiers(
  promo: ResellerPromotion,
  tiers: ResellerTier[],
  resellers: Reseller[]
): ResellerTier[] {
  if (promo.scope === "all" || promo.scope === "service") return tiers;
  if (promo.scope === "tier") {
    return tiers.filter((t) => t.id === promo.tierId);
  }
  const tierIds = new Set(
    affectedResellers(promo, resellers).map((r) => r.tierId)
  );
  return tiers.filter((t) => tierIds.has(t.id));
}

/* ------------------------------ Impact preview ------------------------ */

export interface ImpactRow {
  tierId: string;
  tierName: string;
  service: PromotionServiceCategory;
  baseRate: number;
  boostedRate: number;
}

export interface ImpactPreview {
  affectedResellerCount: number;
  affectedTierCount: number;
  rows: ImpactRow[];
}

export function previewImpact(
  promo: ResellerPromotion,
  tiers: ResellerTier[],
  resellers: Reseller[]
): ImpactPreview {
  const services = affectedServices(promo);
  const tierList = affectedTiers(promo, tiers, resellers);
  const resellersAffected = affectedResellers(promo, resellers);

  const rows: ImpactRow[] = [];
  for (const tier of tierList) {
    for (const service of services) {
      const baseRate = tier.baseCommissionRates[service];
      rows.push({
        tierId: tier.id,
        tierName: tier.name,
        service,
        baseRate,
        boostedRate: Math.round((baseRate + promo.boostPercentPoints) * 100) / 100,
      });
    }
  }

  return {
    affectedResellerCount: resellersAffected.length,
    affectedTierCount: tierList.length,
    rows,
  };
}

/* ------------------------------ Conflicts ----------------------------- */

export function conflictingPromotions(
  promo: ResellerPromotion,
  all: ResellerPromotion[],
  now: number
): ResellerPromotion[] {
  const start = new Date(promo.startDate).getTime();
  const end = new Date(promo.endDate).getTime();

  return all.filter((other) => {
    if (other.id === promo.id) return false;
    const otherStatus = promotionStatus(other, now);
    if (otherStatus === "expired" || otherStatus === "ended") return false;

    const otherStart = new Date(other.startDate).getTime();
    const otherEnd = new Date(other.endDate).getTime();
    const overlaps = start <= otherEnd && end >= otherStart;
    if (!overlaps) return false;

    const sameServices = affectedServices(promo).some((s) =>
      affectedServices(other).includes(s)
    );
    return sameServices;
  });
}

/* ------------------------------ Summary ------------------------------- */

export interface PromotionSummary {
  total: number;
  active: number;
  scheduled: number;
  expiringSoon: number;
  expired: number;
  ended: number;
}

export function projectPromotionSummary(
  promos: ResellerPromotion[],
  now: number
): PromotionSummary {
  let active = 0;
  let scheduled = 0;
  let expiringSoon = 0;
  let expired = 0;
  let ended = 0;

  const sevenDays = 7 * 86_400_000;

  for (const p of promos) {
    const status = promotionStatus(p, now);
    if (status === "active") {
      active += 1;
      const end = new Date(p.endDate).getTime();
      if (end - now <= sevenDays && end >= now) expiringSoon += 1;
    } else if (status === "scheduled") scheduled += 1;
    else if (status === "expired") expired += 1;
    else if (status === "ended") ended += 1;
  }

  return {
    total: promos.length,
    active,
    scheduled,
    expiringSoon,
    expired,
    ended,
  };
}

/* ------------------------------ Filtering ----------------------------- */

export interface PromotionFilters {
  q: string;
  status: string;
  scope: string;
  view: string;
}

export function filterPromotions(
  promos: ResellerPromotion[],
  filters: PromotionFilters,
  now: number
): ResellerPromotion[] {
  const q = filters.q.trim().toLowerCase();
  return promos.filter((p) => {
    if (q) {
      const hay = (p.name + " " + p.description).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.status && promotionStatus(p, now) !== filters.status) {
      return false;
    }
    if (filters.scope && p.scope !== filters.scope) return false;
    if (filters.view === "expiring") {
      const status = promotionStatus(p, now);
      if (status !== "active") return false;
      const end = new Date(p.endDate).getTime();
      if (end - now > 7 * 86_400_000 || end < now) return false;
    }
    return true;
  });
}

export function sortPromotions(
  promos: ResellerPromotion[],
  now: number
): ResellerPromotion[] {
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