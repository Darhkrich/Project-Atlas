// lib/admin/hooks/use-current-user.ts
// Compatibility shim. Backed by the RBAC current-admin context.

"use client";

import type { AdminUser } from "@/lib/admin/hooks/permissions";
import { useCurrentAdmin } from "@/lib/admin/rbac";

const FALLBACK: AdminUser = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
  role: "operations_admin",
  extraPermissions: [],
};

export function useCurrentUser(): AdminUser {
  const admin = useCurrentAdmin();
  if (!admin) return FALLBACK;
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    extraPermissions: admin.extraPermissions,
  };
}