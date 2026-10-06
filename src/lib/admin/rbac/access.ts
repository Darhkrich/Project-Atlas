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