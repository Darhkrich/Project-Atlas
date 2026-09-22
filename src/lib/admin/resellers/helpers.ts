// lib/admin/resellers/helpers.ts
import { mockResellerCommissions } from "@/lib/admin/mock/commission-seed";
import { getTiers } from "@/lib/admin/mock/reseller-tier-store";
import type {
  ResellerCommission,
  ResellerTier,
} from "@/lib/admin/types/commission";
import type {
  Reseller,
  ResellerActivityEntry,
  ResellerAuditEntry,
} from "@/lib/admin/types/reseller";
import type { CurrentAdmin } from "@/lib/admin/rbac";

/* ------------------------------ Commissions ----------------------------- */

export interface CommissionTotals {
  earned: number;
  pending: number;
  paid: number;
}

export function computeCommissionTotals(
  resellerId: string,
  commissions: ResellerCommission[] = mockResellerCommissions
): CommissionTotals {
  let pending = 0;
  let paid = 0;

  for (const c of commissions) {
    if (c.resellerId !== resellerId) continue;
    if (c.status === "paid") paid += c.totalCommission;
    else if (c.status === "pending") pending += c.totalCommission;
  }

  return {
    earned: round2(paid + pending),
    pending: round2(pending),
    paid: round2(paid),
  };
}

/**
 * One-pass build of commission totals for every reseller. Callers pass
 * the live commission array from the store. Missing resellers are not
 * present in the map; readers use `?? { earned: 0, pending: 0, paid: 0 }`.
 */
export function buildCommissionTotalsMap(
  commissions: ResellerCommission[]
): Map<string, CommissionTotals> {
  const map = new Map<string, CommissionTotals>();
  const pendingById = new Map<string, number>();
  const paidById = new Map<string, number>();

  for (const c of commissions) {
    if (c.status === "paid") {
      paidById.set(
        c.resellerId,
        (paidById.get(c.resellerId) ?? 0) + c.totalCommission
      );
    } else if (c.status === "pending") {
      pendingById.set(
        c.resellerId,
        (pendingById.get(c.resellerId) ?? 0) + c.totalCommission
      );
    }
  }

  const ids = new Set<string>([
    ...pendingById.keys(),
    ...paidById.keys(),
  ]);
  for (const id of ids) {
    const pending = round2(pendingById.get(id) ?? 0);
    const paid = round2(paidById.get(id) ?? 0);
    map.set(id, {
      earned: round2(paid + pending),
      pending,
      paid,
    });
  }
  return map;
}

/* ------------------------------ Tiers ----------------------------------- */

export function tierByName(
  name: string | undefined
): ResellerTier | undefined {
  if (!name) return undefined;
  return getTiers().find((t) => t.name === name);
}

export function tierById(id: string | undefined): ResellerTier | undefined {
  if (!id) return undefined;
  return getTiers().find((t) => t.id === id);
}

export interface TierDelta {
  fromAvgRate: number;
  toAvgRate: number;
  deltaRate: number;
  extraCutDelta: number;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return round2(nums.reduce((s, n) => s + n, 0) / nums.length);
}

/**
 * Compares two tiers on the average of their six percent rates, plus the
 * extra-cut percentage. All rates are percentages of order value.
 */
export function commissionDeltaForTier(
  fromName: string | undefined,
  toName: string | undefined
): TierDelta | null {
  const fromTier = tierByName(fromName);
  const toTier = tierByName(toName);
  if (!fromTier || !toTier) return null;

  const fromAvgRate = avg(Object.values(fromTier.baseCommissionRates));
  const toAvgRate = avg(Object.values(toTier.baseCommissionRates));

  return {
    fromAvgRate,
    toAvgRate,
    deltaRate: round2(toAvgRate - fromAvgRate),
    extraCutDelta: toTier.extraCutPercent - fromTier.extraCutPercent,
  };
}

/* ------------------------------ Audit helpers --------------------------- */

export function buildAuditEntry(input: {
  admin: CurrentAdmin;
  action: string;
}): ResellerAuditEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    admin: input.admin.email,
    action: input.action,
  };
}

export function appendAuditTrail(
  reseller: Reseller,
  entry: ResellerAuditEntry
): ResellerAuditEntry[] {
  return [...(reseller.auditTrail ?? []), entry];
}

export function appendActivity(
  reseller: Reseller,
  action: string
): ResellerActivityEntry[] {
  return [
    ...reseller.activityLog,
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
    },
  ];
}

/* ------------------------------ Formatting ------------------------------ */

export function formatRelativeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) {
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) {
      const minutes = Math.floor(diff / 60_000);
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/* ------------------------------ Internal -------------------------------- */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}