import type {
  StorefrontStatus,
  StorefrontType,
  UnifiedStorefront,
} from "@/lib/admin/types/storefront";

export interface StorefrontStatusSlice {
  id: string;
  status: StorefrontStatus;
  statusReason?: string;
  updatedAt?: string;
}

export interface StorefrontStatusSnapshot {
  slices: Record<string, StorefrontStatusSlice>;
}

export interface StorefrontSummary {
  total: number;
  resellerCount: number;
  merchantCount: number;
  liveCount: number;
  pendingCount: number;
  disabledCount: number;
  totalUsers: number;
  totalRevenue30d: number;
}

export interface StorefrontFilters {
  q: string;
  type: string;
  status: string;
}

export function overlayStorefrontStatus(
  storefronts: UnifiedStorefront[],
  snapshot: StorefrontStatusSnapshot
): UnifiedStorefront[] {
  return storefronts.map((sf) => {
    const slice = snapshot.slices[sf.id];
    if (!slice) return sf;
    return {
      ...sf,
      status: slice.status,
      statusReason: slice.statusReason,
      updatedAt: slice.updatedAt,
    };
  });
}

export function projectAllStorefronts(
  storefronts: UnifiedStorefront[],
  snapshot: StorefrontStatusSnapshot
): UnifiedStorefront[] {
  return overlayStorefrontStatus(storefronts, snapshot).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function projectStorefrontSummary(
  storefronts: UnifiedStorefront[]
): StorefrontSummary {
  let resellerCount = 0;
  let merchantCount = 0;
  let liveCount = 0;
  let pendingCount = 0;
  let disabledCount = 0;
  let totalUsers = 0;
  let totalRevenue = 0;

  for (const sf of storefronts) {
    if (sf.type === "reseller") resellerCount += 1;
    else if (sf.type === "merchant") merchantCount += 1;
    if (sf.status === "live") liveCount += 1;
    else if (sf.status === "pending") pendingCount += 1;
    else if (sf.status === "disabled") disabledCount += 1;
    totalUsers += sf.usersCount;
    totalRevenue += sf.revenue30d;
  }

  return {
    total: storefronts.length,
    resellerCount,
    merchantCount,
    liveCount,
    pendingCount,
    disabledCount,
    totalUsers,
    totalRevenue30d: totalRevenue,
  };
}

export function filterStorefronts(
  storefronts: UnifiedStorefront[],
  filters: StorefrontFilters
): UnifiedStorefront[] {
  const q = filters.q.trim().toLowerCase();
  return storefronts.filter((sf) => {
    if (q) {
      const hay = sf.storeName + " " + sf.ownerName + " " + sf.slug;
      if (!hay.toLowerCase().includes(q)) return false;
    }
    if (filters.type && sf.type !== filters.type) return false;
    if (filters.status && sf.status !== filters.status) return false;
    return true;
  });
}

export function isResellerStorefront(sf: UnifiedStorefront): boolean {
  return sf.type === "reseller";
}

export function isMerchantStorefront(sf: UnifiedStorefront): boolean {
  return sf.type === "merchant";
}

export interface StorefrontTypeCounts {
  reseller: number;
  merchant: number;
}

export function countByType(
  storefronts: UnifiedStorefront[]
): StorefrontTypeCounts {
  let reseller = 0;
  let merchant = 0;
  for (const sf of storefronts) {
    if (sf.type === "reseller") reseller += 1;
    else if (sf.type === "merchant") merchant += 1;
  }
  return { reseller, merchant };
}

export type { StorefrontType };