import type {
  StorefrontStatus,
  UnifiedStorefront,
} from "@/lib/admin/types/storefront";
import type { Reseller } from "@/lib/admin/types/reseller";

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
  live: number;
  pending: number;
  disabled: number;
  totalUsers: number;
  totalRevenue30d: number;
  resellerCount: number;
}

export interface StorefrontRow {
  storefront: UnifiedStorefront;
  owner: Reseller | undefined;
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

export function projectResellerStorefronts(
  storefronts: UnifiedStorefront[],
  resellers: Reseller[],
  snapshot: StorefrontStatusSnapshot
): StorefrontRow[] {
  const overlaid = overlayStorefrontStatus(storefronts, snapshot);
  const resellerById = new Map(resellers.map((r) => [r.id, r]));

  return overlaid
    .filter((sf) => sf.type === "reseller")
    .map((sf) => ({
      storefront: sf,
      owner: resellerById.get(sf.ownerId),
    }))
    .sort(
      (a, b) =>
        new Date(b.storefront.createdAt).getTime() -
        new Date(a.storefront.createdAt).getTime()
    );
}

export function projectStorefrontSummary(
  rows: StorefrontRow[],
  resellerCount: number
): StorefrontSummary {
  let live = 0;
  let pending = 0;
  let disabled = 0;
  let totalUsers = 0;
  let totalRevenue = 0;

  for (const row of rows) {
    if (row.storefront.status === "live") live += 1;
    else if (row.storefront.status === "pending") pending += 1;
    else if (row.storefront.status === "disabled") disabled += 1;
    totalUsers += row.storefront.usersCount;
    totalRevenue += row.storefront.revenue30d;
  }

  return {
    total: rows.length,
    live,
    pending,
    disabled,
    totalUsers,
    totalRevenue30d: totalRevenue,
    resellerCount,
  };
}

/* ------------------------------ Capability checks --------------------- */

export function canApproveStorefront(
  storefront: UnifiedStorefront
): boolean {
  return storefront.status === "pending";
}

export function canDisableStorefront(
  storefront: UnifiedStorefront
): boolean {
  return storefront.status === "live";
}

export function canReactivateStorefront(
  storefront: UnifiedStorefront
): boolean {
  return storefront.status === "disabled";
}

/* ------------------------------ Warnings ------------------------------ */

export interface StorefrontOperationWarning {
  kind: "reseller-status" | "verification" | "no-storefront-users";
  message: string;
}

export function warningsForApprove(
  owner: Reseller | undefined
): StorefrontOperationWarning[] {
  const out: StorefrontOperationWarning[] = [];
  if (!owner) return out;
  if (owner.status === "suspended") {
    out.push({
      kind: "reseller-status",
      message:
        "The reseller's account is suspended. The storefront will be visible but customers will not be able to place orders until the account is reactivated.",
    });
  }
  if (owner.status === "pending") {
    out.push({
      kind: "reseller-status",
      message:
        "The reseller's account is still pending. The storefront will be visible immediately.",
    });
  }
  if (owner.verificationStatus !== "verified") {
    out.push({
      kind: "verification",
      message:
        "The reseller's verification is not approved. Publishing the storefront may present an unverified seller to customers.",
    });
  }
  return out;
}

export function warningsForReactivate(
  owner: Reseller | undefined
): StorefrontOperationWarning[] {
  const out: StorefrontOperationWarning[] = [];
  if (!owner) return out;
  if (owner.status === "suspended") {
    out.push({
      kind: "reseller-status",
      message:
        "The reseller's account is suspended. Reactivating the storefront will make it visible, but customers will not be able to place orders until the account is reactivated.",
    });
  }
  return out;
}