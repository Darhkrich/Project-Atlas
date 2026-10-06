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
  type RbacSubject,
  type PermissionDiff,
} from "./access";

export {
  CurrentAdminProvider,
  useCurrentAdmin,
  useCurrentAdminReady,
  useSetCurrentAdminRole,
  useResetCurrentAdminRole,
  type CurrentAdmin,
} from "./context";

export { Can, CanAny, useCan, useCanAny } from "./can";