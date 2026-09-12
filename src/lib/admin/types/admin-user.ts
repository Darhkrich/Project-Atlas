// lib/admin/types/admin-user.ts

import type { SupportUserType } from "./support";
import type { Permission, Role } from "@/lib/admin/rbac";

export type AdminUserStatus = "active" | "suspended" | "pending";

export interface AdminActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  resource?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;

  role: Role;
  extraPermissions: Permission[];
  status: AdminUserStatus;

  queueIds: string[];
  handles: SupportUserType[];

  emailVerified: boolean;
  emailVerifiedAt?: string;
  invitedAt?: string;
  invitedBy?: string;

  createdAt: string;
  lastLogin: string | null;
  lastLoginFrom?: string;

  activityLog: AdminActivityEntry[];
}

export interface AdminInvite {
  id: string;
  email: string;
  name: string;
  role: Role;
  extraPermissions: Permission[];
  queueIds: string[];
  handles: SupportUserType[];
  message?: string;
  invitedAt: string;
  invitedById: string;
  expiresAt: string;
  emailVerified: false;
}