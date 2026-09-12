// lib/admin/admin-users/constants.ts

import type { AdminUserStatus } from "@/lib/admin/types/admin-user";
import { ROLES, type Role } from "@/lib/admin/rbac";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const ROLE_VARIANT: Record<Role, BadgeVariant> = {
  [ROLES.SUPER_ADMIN]: "brand",
  [ROLES.OPERATIONS_ADMIN]: "info",
  [ROLES.FINANCE_ADMIN]: "warning",
  [ROLES.SUPPORT_ADMIN]: "success",
  [ROLES.SERVICE_ADMIN]: "neutral",
  [ROLES.ANALYST]: "neutral",
  [ROLES.VIEWER]: "neutral",
};

export const STATUS_LABEL: Record<AdminUserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending verification",
};

export const STATUS_VARIANT: Record<AdminUserStatus, BadgeVariant> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
};

export const STATUS_DESCRIPTION: Record<AdminUserStatus, string> = {
  active: "Verified and able to sign in.",
  suspended: "Access revoked. Can be reactivated at any time.",
  pending: "Invitation sent, email not yet verified.",
};

export const INVITE_EXPIRY_DAYS = 7;

export const PAGE_SIZE = 12;

export type SortKey = "name" | "role" | "status" | "lastLogin" | "createdAt";

export const SORT_LABEL: Record<SortKey, string> = {
  name: "Name",
  role: "Role",
  status: "Status",
  lastLogin: "Last login",
  createdAt: "Date added",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "name",
  "role",
  "status",
  "lastLogin",
  "createdAt",
];

export function statusLabel(status: AdminUserStatus): string {
  return STATUS_LABEL[status] ?? status;
}

export function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}