import type { Reseller } from "@/lib/admin/types/reseller";
import { TIER_ORDER } from "./dashboard-labels";
import type { CommissionTotals } from "./helpers";

export interface RevenueByResellerRow {
  id: string;
  name: string;
  revenue: number;
  commissions: number;
  tier: string;
  tierId: string;
  status: Reseller["status"];
  href: string;
}

export interface RevenueByTierRow {
  tier: string;
  tierId: string;
  revenue: number;
  count: number;
}

export interface VerificationCount {
  status: Reseller["verificationStatus"];
  count: number;
}

export interface TierCount {
  tier: string;
  tierId: string;
  count: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalCommissionsEarned: number;
  totalCommissionsPaid: number;
  effectiveRatePercent: number;
  activeCount: number;
  totalCount: number;
  tierCounts: TierCount[];
  currency: string;
}

const ZERO_TOTALS: CommissionTotals = { earned: 0, pending: 0, paid: 0 };

/* ------------------------------ Projections --------------------------- */

export function projectRevenueByReseller(
  resellers: Reseller[],
  limit: number,
  commissionTotalsById: Map<string, CommissionTotals>
): RevenueByResellerRow[] {
  return [...resellers]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      name: r.businessName,
      revenue: r.totalRevenue,
      commissions:
        (commissionTotalsById.get(r.id) ?? ZERO_TOTALS).earned,
      tier: r.tierName ?? "",
      tierId: r.tierId ?? "",
      status: r.status,
      href: `/admin/resellers/${r.id}`,
    }));
}

export function projectRevenueByTier(
  resellers: Reseller[]
): RevenueByTierRow[] {
  const map = new Map<string, RevenueByTierRow>();
  for (const r of resellers) {
    const existing = map.get(r.tierId);
    if (existing) {
      existing.revenue += r.totalRevenue;
      existing.count += 1;
    } else {
      map.set(r.tierId, {
        tier: r.tierName,
        tierId: r.tierId,
        revenue: r.totalRevenue,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99)
  );
}

export function projectByVerification(
  resellers: Reseller[]
): VerificationCount[] {
  const order: Reseller["verificationStatus"][] = [
    "verified",
    "pending",
    "not_submitted",
    "rejected",
  ];
  const counts = new Map<Reseller["verificationStatus"], number>();
  for (const status of order) counts.set(status, 0);
  for (const r of resellers) {
    counts.set(
      r.verificationStatus,
      (counts.get(r.verificationStatus) ?? 0) + 1
    );
  }
  return order.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

export function projectAnalyticsSummary(
  resellers: Reseller[],
  commissionTotalsById: Map<string, CommissionTotals>
): AnalyticsSummary {
  let revenue = 0;
  let earned = 0;
  let paid = 0;
  let active = 0;

  for (const r of resellers) {
    revenue += r.totalRevenue;
    const totals = commissionTotalsById.get(r.id) ?? ZERO_TOTALS;
    earned += totals.earned;
    paid += totals.paid;
    if (r.status === "active") active += 1;
  }

  const tiers = new Map<string, TierCount>();
  for (const r of resellers) {
    const existing = tiers.get(r.tierId);
    if (existing) existing.count += 1;
    else
      tiers.set(r.tierId, {
        tier: r.tierName,
        tierId: r.tierId,
        count: 1,
      });
  }

  return {
    totalRevenue: revenue,
    totalCommissionsEarned: earned,
    totalCommissionsPaid: paid,
    effectiveRatePercent: revenue > 0 ? (earned / revenue) * 100 : 0,
    activeCount: active,
    totalCount: resellers.length,
    tierCounts: Array.from(tiers.values()).sort(
      (a, b) => (TIER_ORDER[b.tier] ?? 0) - (TIER_ORDER[a.tier] ?? 0)
    ),
    currency: "GHS",
  };
}