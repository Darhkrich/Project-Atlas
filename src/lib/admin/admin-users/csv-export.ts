// lib/admin/admin-users/csv-export.ts

import type { AdminUser } from "@/lib/admin/types/admin-user";
import { roleLabel } from "@/lib/admin/rbac";
import { STATUS_LABEL } from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function adminUsersToCsv(users: AdminUser[]): string {
  const header = [
    "id",
    "name",
    "email",
    "role",
    "status",
    "emailVerified",
    "extraPermissions",
    "queues",
    "handles",
    "lastLogin",
    "lastLoginFrom",
    "createdAt",
  ];

  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email,
    roleLabel(u.role),
    STATUS_LABEL[u.status] ?? u.status,
    u.emailVerified ? "yes" : "no",
    String(u.extraPermissions.length),
    u.queueIds.join("|"),
    u.handles.join("|"),
    u.lastLogin ?? "",
    u.lastLoginFrom ?? "",
    u.createdAt,
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}