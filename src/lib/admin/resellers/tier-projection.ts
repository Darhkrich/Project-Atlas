// lib/admin/resellers/tier-projection.ts

import type {
  ResellerTier,
  ServiceCategory,
} from "@/lib/admin/types/commission";
import type { Reseller } from "@/lib/admin/types/reseller";
import { SERVICE_CATEGORY_LABEL } from "./tier-labels";
import { UNASSIGNED_TIER_ID } from "./tier-constants";

export interface TierSummary {
  tierCount: number;
  assignedResellers: number;
  totalResellers: number;
  extraCutRange: { min: number; max: number };
  airtimeRateRange: { min: number; max: number };
}

export function projectTierCounts(
  tiers: ResellerTier[],
  resellers: Reseller[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tier of tiers) counts[tier.id] = 0;
  for (const r of resellers) {
    const tierId = r.tierId ?? UNASSIGNED_TIER_ID;
    if (counts[tierId] === undefined) counts[tierId] = 0;
    counts[tierId] += 1;
  }
  return counts;
}

export function projectTierSummary(
  tiers: ResellerTier[],
  resellers: Reseller[]
): TierSummary {
  const counts = projectTierCounts(tiers, resellers);
  const assigned = Object.entries(counts)
    .filter(([id]) => id !== UNASSIGNED_TIER_ID)
    .reduce((sum, [, n]) => sum + n, 0);

  if (tiers.length === 0) {
    return {
      tierCount: 0,
      assignedResellers: assigned,
      totalResellers: resellers.length,
      extraCutRange: { min: 0, max: 0 },
      airtimeRateRange: { min: 0, max: 0 },
    };
  }

  const extraCuts = tiers.map((t) => t.extraCutPercent);
  const airtimeRates = tiers.map((t) => t.baseCommissionRates.airtime);

  return {
    tierCount: tiers.length,
    assignedResellers: assigned,
    totalResellers: resellers.length,
    extraCutRange: {
      min: Math.min(...extraCuts),
      max: Math.max(...extraCuts),
    },
    airtimeRateRange: {
      min: Math.min(...airtimeRates),
      max: Math.max(...airtimeRates),
    },
  };
}

const RATE_ORDER: ServiceCategory[] = [
  "data",
  "airtime",
  "bills",
  "tv",
  "exam_pins",
  "other",
];

export function projectRateRows(
  tier: ResellerTier
): { key: ServiceCategory; label: string; value: string }[] {
  return RATE_ORDER.map((key) => ({
    key,
    label: SERVICE_CATEGORY_LABEL[key],
    value: `${tier.baseCommissionRates[key].toFixed(2)}%`,
  }));
}