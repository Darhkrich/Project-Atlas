import type { Merchant } from "@/lib/admin/types/merchant";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type { SubscriptionPlan } from "@/config/subscription-plans";
import {
  ALL_SUBSCRIPTION_STATUSES,
  formatCohortMonth,
  type SubscriptionHealthStatus,
  type VelocityTrend,
  type VerificationStatus,
} from "./analytics-labels";

/* ------------------------------ Types --------------------------------- */

export interface CohortPoint {
  key: string;
  label: string;
  count: number;
  lifetimeRevenue: number;
}

export interface SubscriptionHealthRow {
  planCode: string;
  planName: string;
  active: number;
  past_due: number;
  expired: number;
  cancelled: number;
  total: number;
}

export interface VerificationRow {
  status: VerificationStatus;
  count: number;
  percent: number;
}

export interface VelocityRow {
  id: string;
  name: string;
  lifetimeRevenue: number;
  revenue30d: number;
  monthsActive: number;
  ratio: number | null;
  trend: VelocityTrend;
  href: string;
}

export interface EcommerceAnalyticsSummary {
  totalMerchants: number;
  newThisMonth: number;
  atRisk: number;
  pastDue: number;
  expired: number;
  avgLifetimeRevenue: number;
  verifiedCount: number;
  pendingCount: number;
}

/* ------------------------------ Helpers ------------------------------- */

function monthsBetween(fromIso: string, now: number): number {
  const diff = now - new Date(fromIso).getTime();
  const months = diff / (1000 * 60 * 60 * 24 * 30.44);
  return Math.max(1, Math.round(months));
}

function isSameUtcMonth(iso: string, now: number): boolean {
  const a = new Date(iso);
  const b = new Date(now);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

/* ------------------------------ Cohorts ------------------------------- */

export function projectCohorts(
  merchants: Merchant[]
): CohortPoint[] {
  const map = new Map<string, CohortPoint>();
  for (const m of merchants) {
    const key = formatCohortMonth(m.createdAt);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.lifetimeRevenue += m.totalRevenue;
    } else {
      map.set(key, {
        key,
        label: key,
        count: 1,
        lifetimeRevenue: m.totalRevenue,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const [aMon, aYear] = a.key.split(" ");
    const [bMon, bYear] = b.key.split(" ");
    const aDate = new Date(`${aMon} 1, ${aYear}`).getTime();
    const bDate = new Date(`${bMon} 1, ${bYear}`).getTime();
    return aDate - bDate;
  });
}

/* --------------------------- Subscription health --------------------- */

export function projectSubscriptionHealth(
  merchants: Merchant[],
  plans: SubscriptionPlan[]
): SubscriptionHealthRow[] {
  const rows: SubscriptionHealthRow[] = plans.map((p) => ({
    planCode: p.code,
    planName: p.name,
    active: 0,
    past_due: 0,
    expired: 0,
    cancelled: 0,
    total: 0,
  }));
  const byCode = new Map(rows.map((r) => [r.planCode, r]));

  for (const m of merchants) {
    const row = byCode.get(m.subscription.planId);
    if (!row) continue;
    const status = m.subscription.status as SubscriptionHealthStatus;
    if (ALL_SUBSCRIPTION_STATUSES.includes(status)) {
      row[status] += 1;
      row.total += 1;
    }
  }

  return rows;
}

/* --------------------------- Verification ---------------------------- */

export function projectVerification(
  merchants: Merchant[]
): VerificationRow[] {
  const counts: Record<VerificationStatus, number> = {
    verified: 0,
    pending: 0,
    not_submitted: 0,
  };

  for (const m of merchants) {
    const status = m.verificationStatus as VerificationStatus;
    if (status in counts) {
      counts[status] += 1;
    }
  }

  const total = merchants.length;
  const out: VerificationRow[] = [];
  const order: VerificationStatus[] = ["verified", "pending", "not_submitted"];
  for (const s of order) {
    out.push({
      status: s,
      count: counts[s],
      percent: total === 0 ? 0 : (counts[s] / total) * 100,
    });
  }
  return out;
}

/* --------------------------- Revenue velocity ------------------------ */

export function projectRevenueVelocity(
  merchants: Merchant[],
  storefronts: UnifiedStorefront[],
  now: number
): VelocityRow[] {
  const byOwner = new Map(
    storefronts
      .filter((sf) => sf.type === "merchant")
      .map((sf) => [sf.ownerId, sf])
  );

  return merchants
    .map((m) => {
      const sf = byOwner.get(m.id);
      const revenue30d = sf?.revenue30d ?? 0;
      const months = monthsBetween(m.createdAt, now);
      const expected30d = m.totalRevenue / months;
      let ratio: number | null = null;
      let trend: VelocityTrend = "unknown";

      if (expected30d > 0) {
        ratio = revenue30d / expected30d;
        if (ratio > 1.2) trend = "accelerating";
        else if (ratio < 0.8) trend = "decelerating";
        else trend = "steady";
      }

      return {
        id: m.id,
        name: m.businessName,
        lifetimeRevenue: m.totalRevenue,
        revenue30d,
        monthsActive: months,
        ratio,
        trend,
        href: "/admin/ecommerce/merchants/" + m.id,
      };
    })
    .sort((a, b) => {
      const ar = a.ratio ?? -1;
      const br = b.ratio ?? -1;
      if (ar !== br) return br - ar;
      return b.lifetimeRevenue - a.lifetimeRevenue;
    });
}

/* --------------------------- Summary -------------------------------- */

export function projectAnalyticsSummary(
  merchants: Merchant[],
  now: number
): EcommerceAnalyticsSummary {
  let newThisMonth = 0;
  let pastDue = 0;
  let expired = 0;
  let verified = 0;
  let pending = 0;
  let revenueSum = 0;

  for (const m of merchants) {
    if (isSameUtcMonth(m.createdAt, now)) newThisMonth += 1;
    if (m.subscription.status === "past_due") pastDue += 1;
    if (m.subscription.status === "expired") expired += 1;
    if (m.verificationStatus === "verified") verified += 1;
    if (m.verificationStatus === "pending") pending += 1;
    revenueSum += m.totalRevenue;
  }

  return {
    totalMerchants: merchants.length,
    newThisMonth,
    atRisk: pastDue + expired,
    pastDue,
    expired,
    avgLifetimeRevenue:
      merchants.length === 0 ? 0 : Math.round(revenueSum / merchants.length),
    verifiedCount: verified,
    pendingCount: pending,
  };
}