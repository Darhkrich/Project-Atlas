// lib/admin/hooks/permissions.ts
// Compatibility shim. Re-exports from @/lib/admin/rbac.
// Slated for removal once all consumers migrate.

import type { Permission, Role } from "@/lib/admin/rbac";

export {
  PERMISSIONS,
  type Permission,
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
} from "@/lib/admin/rbac";

export const ROLES_COMPAT = {
  SUPER_ADMIN: "super_admin",
  ATLAS_OPS: "operations_admin",
  FINANCE: "finance_admin",
  SUPPORT: "support_admin",
  VIEWER: "viewer",
} as const;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  extraPermissions?: Permission[];
}