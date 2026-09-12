// lib/admin/storefront-users/helpers.ts

import type {
  StorefrontUser,
  StorefrontUserActivity,
  StorefrontUserAuditEntry,
} from "@/lib/admin/types/storefront-user";
import type { CurrentAdmin } from "@/lib/admin/rbac";

export function buildAuditEntry(input: {
  admin: CurrentAdmin;
  action: string;
}): StorefrontUserAuditEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    admin: input.admin.email,
    action: input.action,
  };
}

export function appendAuditTrail(
  user: StorefrontUser,
  entry: StorefrontUserAuditEntry
): StorefrontUserAuditEntry[] {
  return [...(user.auditTrail ?? []), entry];
}

export function appendActivity(
  user: StorefrontUser,
  action: string
): StorefrontUserActivity[] {
  return [
    ...user.activityLog,
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
    },
  ];
}

export function summarize(user: StorefrontUser): string {
  const orders = `${user.ordersCount} order${user.ordersCount === 1 ? "" : "s"}`;
  const spent = `${user.totalSpent.toFixed(2)} GHS spent`;
  return `${orders} · ${spent}`;
}