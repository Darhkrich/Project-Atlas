// lib/admin/rbac/index.ts

export {
  PERMISSIONS,
  PERMISSION_MODULES,
  ALL_PERMISSIONS,
  permissionLabel,
  moduleForPermission,
  type Permission,
  type PermissionModuleGroup,
} from "./permissions";

export {
  ROLES,
  ALL_ROLES,
  ROLE_PERMISSIONS,
  roleLabel,
  roleDescription,
  rolePermissions,
  type Role,
  type RoleDefinition,
} from "./roles";

export {
  effectivePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  diffPermissions,
  isPrivilegeEscalation,
  pagesForPermissions,
  pagesForRole,
  ADMIN_PAGES,
  type RbacSubject,
  type PermissionDiff,
  type AdminPageDefinition,
} from "./access";

export {
  CurrentAdminProvider,
  useCurrentAdmin,
  useCurrentAdminReady,
  type CurrentAdmin,
} from "./context";

export { Can, CanAny, useCan, useCanAny } from "./can";