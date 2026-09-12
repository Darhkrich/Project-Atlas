// lib/admin/admin-users/permissions.ts

import {
  PERMISSION_MODULES,
  rolePermissions,
  type Permission,
  type Role,
} from "@/lib/admin/rbac";

export interface PermissionItemView {
  value: Permission;
  label: string;
  inherited: boolean;
  extra: boolean;
}

export interface PermissionGroupView {
  module: string;
  label: string;
  description: string;
  permissions: PermissionItemView[];
  selectedCount: number;
  inheritedCount: number;
  extraCount: number;
  allSelected: boolean;
}

export function permissionsByModule(
  effective: Permission[],
  inherited: Permission[]
): PermissionGroupView[] {
  const effectiveSet = new Set(effective);
  const inheritedSet = new Set(inherited);

  return PERMISSION_MODULES.map((group) => {
    const permissions = group.permissions.map((p) => ({
      value: p.value,
      label: p.label,
      inherited: inheritedSet.has(p.value),
      extra:
        effectiveSet.has(p.value) && !inheritedSet.has(p.value),
    }));

    const inheritedCount = permissions.filter((p) => p.inherited).length;
    const extraCount = permissions.filter((p) => p.extra).length;
    const selectedCount = inheritedCount + extraCount;

    return {
      module: group.module,
      label: group.label,
      description: group.description,
      permissions,
      selectedCount,
      inheritedCount,
      extraCount,
      allSelected: selectedCount === permissions.length,
    };
  });
}

export function countPermissions(permissions: Permission[]): number {
  return permissions.length;
}

export function countModules(permissions: Permission[]): number {
  const set = new Set(permissions);
  let count = 0;
  for (const group of PERMISSION_MODULES) {
    if (group.permissions.some((p) => set.has(p.value))) count += 1;
  }
  return count;
}

export function summarizePermissions(permissions: Permission[]): string {
  const count = permissions.length;
  const modules = countModules(permissions);
  return `${count} permission${count === 1 ? "" : "s"} across ${modules} module${
    modules === 1 ? "" : "s"
  }`;
}

export function summarizeRole(role: Role): {
  count: number;
  modules: number;
} {
  const permissions = rolePermissions(role);
  return {
    count: permissions.length,
    modules: countModules(permissions),
  };
}

export function inheritedPermissionsFor(role: Role): Permission[] {
  return rolePermissions(role);
}