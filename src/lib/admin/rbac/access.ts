// lib/admin/rbac/access.ts

import type { Permission } from "./permissions";
import { rolePermissions, type Role } from "./roles";

export interface RbacSubject {
  role: Role;
  extraPermissions?: Permission[];
}

export function effectivePermissions(subject: RbacSubject | null): Permission[] {
  if (!subject) return [];
  const base = rolePermissions(subject.role);
  const extra = subject.extraPermissions ?? [];
  const set = new Set<Permission>([...base, ...extra]);
  return Array.from(set);
}

export function hasPermission(
  subject: RbacSubject | null,
  permission: Permission
): boolean {
  if (!subject) return false;
  return effectivePermissions(subject).includes(permission);
}

export function hasAnyPermission(
  subject: RbacSubject | null,
  permissions: Permission[]
): boolean {
  if (!subject || permissions.length === 0) return false;
  const set = new Set(effectivePermissions(subject));
  return permissions.some((p) => set.has(p));
}

export function hasAllPermissions(
  subject: RbacSubject | null,
  permissions: Permission[]
): boolean {
  if (!subject || permissions.length === 0) return false;
  const set = new Set(effectivePermissions(subject));
  return permissions.every((p) => set.has(p));
}

export interface PermissionDiff {
  added: Permission[];
  removed: Permission[];
}

export function diffPermissions(
  before: Permission[],
  after: Permission[]
): PermissionDiff {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  return {
    added: after.filter((p) => !beforeSet.has(p)).sort(),
    removed: before.filter((p) => !afterSet.has(p)).sort(),
  };
}

export function isPrivilegeEscalation(
  before: Permission[],
  after: Permission[]
): boolean {
  const diff = diffPermissions(before, after);
  return diff.added.length > diff.removed.length;
}

export interface AdminPageDefinition {
  path: string;
  label: string;
  requiredPermission: Permission;
}

export const ADMIN_PAGES: AdminPageDefinition[] = [
  {
    path: "/admin",
    label: "Dashboard",
    requiredPermission: "analytics:view" as Permission,
  },
  {
    path: "/admin/support",
    label: "Support",
    requiredPermission: "support:view" as Permission,
  },
  {
    path: "/admin/notifications",
    label: "Notifications",
    requiredPermission: "notifications:view" as Permission,
  },
  {
    path: "/admin/analytics",
    label: "Analytics",
    requiredPermission: "analytics:view" as Permission,
  },
  {
    path: "/admin/reports",
    label: "Reports",
    requiredPermission: "reports:view" as Permission,
  },
  {
    path: "/admin/audit-logs",
    label: "Audit logs",
    requiredPermission: "audit_logs:view" as Permission,
  },
  {
    path: "/admin/security",
    label: "Security center",
    requiredPermission: "security:view" as Permission,
  },
  {
    path: "/admin/settings",
    label: "Settings",
    requiredPermission: "settings:view" as Permission,
  },
  {
    path: "/admin/accounts/admin-users",
    label: "Admin users",
    requiredPermission: "admin_users:view" as Permission,
  },
  {
    path: "/admin/customers",
    label: "Customers",
    requiredPermission: "customers:view" as Permission,
  },
  {
    path: "/admin/resellers",
    label: "Resellers",
    requiredPermission: "resellers:view" as Permission,
  },
  {
    path: "/admin/merchants",
    label: "Merchants",
    requiredPermission: "merchants:view" as Permission,
  },
  {
    path: "/admin/providers",
    label: "Providers",
    requiredPermission: "providers:view" as Permission,
  },
  {
    path: "/admin/services",
    label: "Services",
    requiredPermission: "services:view" as Permission,
  },
  {
    path: "/admin/orders",
    label: "Orders",
    requiredPermission: "orders:view" as Permission,
  },
  {
    path: "/admin/wallets",
    label: "Wallets",
    requiredPermission: "wallets:view" as Permission,
  },
  {
    path: "/admin/commissions",
    label: "Commissions",
    requiredPermission: "commissions:view" as Permission,
  },
  {
    path: "/admin/ecommerce/storefronts",
    label: "Storefronts",
    requiredPermission: "storefronts:view" as Permission,
  },
];

export function pagesForPermissions(
  permissions: Permission[]
): AdminPageDefinition[] {
  const set = new Set(permissions);
  return ADMIN_PAGES.filter((page) => set.has(page.requiredPermission));
}

export function pagesForRole(role: Role): AdminPageDefinition[] {
  return pagesForPermissions(rolePermissions(role));
}