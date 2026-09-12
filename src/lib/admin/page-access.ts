// lib/admin/page-access.ts
// Compatibility shim. Re-exports from @/lib/admin/rbac.
// Slated for removal once all consumers migrate.

export {
  ADMIN_PAGES,
  pagesForPermissions,
  pagesForRole,
  type AdminPageDefinition,
} from "@/lib/admin/rbac";

import { rolePermissions, type Role } from "@/lib/admin/rbac";

export function defaultPermissionsForRole(role: Role): string[] {
  return rolePermissions(role);
}