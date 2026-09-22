import type { Reseller } from "@/lib/admin/types/reseller";
import type {
  PendingCommissionPoint,
  RecentActivity,
  ResellerDashboardSummary,
  ResellerGrowthPoint,
  TierCommissionPoint,
  TopReseller,
} from "@/lib/admin/types/reseller-dashboard";
import { TIER_ORDER } from "./dashboard-labels";
import type { CommissionTotals } from "./helpers";

/**
 * Every function here is pure. Commission totals come in as a map.
 * No module state, no cached results, no fabricated data.
 */

const ZERO_TOTALS: CommissionTotals = { earned: 0, pending: 0, paid: 0 };

/* ------------------------------ Summary ------------------------------- */

export function projectSummary(
  resellers: Reseller[],
  commissionTotalsById: Map<string, CommissionTotals>
): ResellerDashboardSummary {
  let active = 0;
  let pending = 0;
  let suspended = 0;
  let commissionsPaid = 0;

  for (const r of resellers) {
    if (r.status === "active") active += 1;
    else if (r.status === "pending") pending += 1;
    else if (r.status === "suspended") suspended += 1;
    commissionsPaid += (commissionTotalsById.get(r.id) ?? ZERO_TOTALS).paid;
  }

  return {
    totalResellers: resellers.length,
    activeResellers: active,
    pendingVerification: pending,
    suspendedResellers: suspended,
    totalCommissionsPaid: Math.round(commissionsPaid * 100) / 100,
    asOf: new Date().toISOString(),
  };
}

/* ------------------------------ Growth -------------------------------- */

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function projectGrowth(
  resellers: Reseller[],
  months = 8
): ResellerGrowthPoint[] {
  const counts = new Map<string, number>();

  for (const r of resellers) {
    const d = new Date(r.joinedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const out: ResellerGrowthPoint[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    out.push({
      month: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      newResellers: counts.get(key) ?? 0,
    });
  }

  return out;
}

/* ------------------------------ Top resellers ------------------------- */

export function projectTopResellers(
  resellers: Reseller[],
  commissionTotalsById: Map<string, CommissionTotals>,
  limit = 5
): TopReseller[] {
  return [...resellers]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      name: r.businessName,
      tier: r.tierName ?? "Unassigned",
      tierId: r.tierId ?? "unassigned",
      revenue: r.totalRevenue,
      commissions: (commissionTotalsById.get(r.id) ?? ZERO_TOTALS).earned,
      status: r.status,
      verificationStatus: r.verificationStatus,
      href: `/admin/resellers/${r.id}`,
    }));
}

/* ------------------------------ Tier commissions ---------------------- */

export function projectCommissionsByTier(
  resellers: Reseller[],
  commissionTotalsById: Map<string, CommissionTotals>
): TierCommissionPoint[] {
  const map = new Map<string, TierCommissionPoint>();

  for (const r of resellers) {
    const tierId = r.tierId ?? "unassigned";
    const tierName = r.tierName ?? "Unassigned";
    const totals = commissionTotalsById.get(r.id) ?? ZERO_TOTALS;
    const existing = map.get(tierId);

    if (existing) {
      existing.paid += totals.paid;
      existing.pending += totals.pending;
    } else {
      map.set(tierId, {
        tier: tierName,
        tierId,
        paid: totals.paid,
        pending: totals.pending,
      });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99)
  );
}

/* ------------------------------ Top pending --------------------------- */

export function projectTopPendingCommissions(
  resellers: Reseller[],
  commissionTotalsById: Map<string, CommissionTotals>,
  limit = 5
): PendingCommissionPoint[] {
  return [...resellers]
    .map((r) => ({
      r,
      totals: commissionTotalsById.get(r.id) ?? ZERO_TOTALS,
    }))
    .filter(({ totals }) => totals.pending > 0)
    .sort((a, b) => b.totals.pending - a.totals.pending)
    .slice(0, limit)
    .map(({ r, totals }) => ({
      id: r.id,
      name: r.businessName,
      tier: r.tierName ?? "Unassigned",
      pending: totals.pending,
      href: `/admin/resellers/${r.id}`,
    }));
}

/* ------------------------------ Activity ------------------------------ */

function activityTypeFromAction(action: string): RecentActivity["type"] {
  const lower = action.toLowerCase();
  if (lower.includes("verif")) return "verification";
  if (
    lower.includes("storefront") ||
    lower.includes("pricing") ||
    lower.includes("theme")
  ) {
    return "storefront";
  }
  if (lower.includes("commission") || lower.includes("payout")) {
    return "commission";
  }
  if (lower.includes("wallet") || lower.includes("withdraw")) {
    return "wallet";
  }
  return "registration";
}

export function projectRecentActivity(
  resellers: Reseller[],
  limit = 10
): RecentActivity[] {
  const out: RecentActivity[] = [];

  for (const r of resellers) {
    const activityEntries = r.activityLog ?? [];
    const auditEntries = r.auditTrail ?? [];

    for (const entry of activityEntries) {
      out.push({
        id: `a-${entry.id}`,
        type: activityTypeFromAction(entry.action),
        description: entry.action,
        timestamp: entry.timestamp,
        resellerId: r.id,
        resellerName: r.businessName,
        href: `/admin/resellers/${r.id}`,
        source: "activity",
      });
    }
    for (const entry of auditEntries) {
      out.push({
        id: `at-${entry.id}`,
        type: activityTypeFromAction(entry.action),
        description: entry.action,
        timestamp: entry.timestamp,
        resellerId: r.id,
        resellerName: r.businessName,
        actor: entry.admin,
        href: `/admin/resellers/${r.id}`,
        source: "audit",
      });
    }
  }

  return out
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
}