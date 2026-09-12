// lib/admin/rbac/can.tsx
"use client";

import { type ReactNode } from "react";
import { hasPermission, hasAnyPermission } from "./access";
import { useCurrentAdmin } from "./context";
import type { Permission } from "./permissions";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const admin = useCurrentAdmin();
  return hasPermission(admin, permission) ? <>{children}</> : <>{fallback}</>;
}

interface CanAnyProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAny({
  permissions,
  children,
  fallback = null,
}: CanAnyProps) {
  const admin = useCurrentAdmin();
  return hasAnyPermission(admin, permissions) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  );
}

export function useCan(permission: Permission): boolean {
  const admin = useCurrentAdmin();
  return hasPermission(admin, permission);
}

export function useCanAny(permissions: Permission[]): boolean {
  const admin = useCurrentAdmin();
  return hasAnyPermission(admin, permissions);
}