 // lib/admin/resellers/helpers.ts

import {
  mockResellerCommissions,
  mockResellerTiers,
} from "@/lib/admin/mock/commissions";
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

/* ------------------------------ Tiers ----------------------------------- */

export function tierByName(
  name: string | undefined
): ResellerTier | undefined {
  if (!name) return undefined;
  return mockResellerTiers.find((t) => t.name === name);
}

export function tierById(id: string | undefined): ResellerTier | undefined {
  if (!id) return undefined;
  return mockResellerTiers.find((t) => t.id === id);
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