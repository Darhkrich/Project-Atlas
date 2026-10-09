// Bridge. The tier catalog lives in the admin section. The reseller
// overview reads it through this one file so the isolation break is
// explicit and isolated. When the catalog moves to the domain layer,
// only this file changes.
import {
  getTierById,
  getTiers,
} from "@/lib/admin/mock/reseller-tier-store";
import type { ResellerTier } from "@/lib/admin/types/commission";

export function readTierCatalog(): ResellerTier[] {
  return getTiers().sort((a, b) => a.minMonthlySales - b.minMonthlySales);
}

export function readTier(tierId: string): ResellerTier | undefined {
  return getTierById(tierId);
}

export function readNextTier(tierId: string): ResellerTier | undefined {
  const tiers = readTierCatalog();
  const idx = tiers.findIndex((t) => t.id === tierId);
  if (idx === -1 || idx === tiers.length - 1) return undefined;
  return tiers[idx + 1];
}