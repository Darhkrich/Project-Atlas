// lib/admin/types/security.ts

import type { AtlasSection } from "./settings";

export type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "password_change"
  | "role_change"
  | "permission_change"
  | "wallet_adjustment"
  | "api_key_change"
  | "suspicious_activity"
  | "ip_blocked"
  | "ip_unblocked";

export type SecurityStatus = "normal" | "warning" | "critical";

export type SecuritySeverity = "info" | "warning" | "critical";

export type SecurityResourceKind =
  | "admin_user"
  | "settings"
  | "wallet"
  | "api_key"
  | "session"
  | "transaction";

export type SessionUserType = "admin" | "reseller" | "merchant" | "customer";

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  user: string;
  actorId?: string;
  actorName?: string;
  ip: string;
  countryCode?: string;
  userAgent?: string;
  timestamp: string;
  details?: string;
  section?: AtlasSection;
  resourceKind?: SecurityResourceKind;
  resourceId?: string;
  note?: string;
  handled?: boolean;
}

export interface SecuritySummary {
  activeSessions: number;
  failedLogins24h: number;
  suspiciousActivities24h: number;
  blockedIPs: number;
  allowlistedIPs: number;
  twoFactorEnabled: number;
  twoFactorMissing: number;
  lockedAccounts: number;
  suspiciousCountries: number;
  lastSecurityScan: string;
  status: SecurityStatus;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical";
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedById?: string;
  acknowledgedByName?: string;
  eventIds?: string[];
  section?: AtlasSection;
}

export interface BlockedIP {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  blockedById?: string;
  expiresAt?: string;
  permanent: boolean;
  countryCode?: string;
  attemptCount?: number;
  lastAttemptAt?: string;
}

export interface ActiveSession {
  id: string;
  user: string;
  actorId?: string;
  actorName?: string;
  userType?: SessionUserType;
  ip: string;
  countryCode?: string;
  device: string;
  startedAt: string;
  lastActive: string;
  current: boolean;
}

export interface AllowlistedIP {
  id: string;
  ip: string;
  label: string;
  addedBy: string;
  addedAt: string;
  countryCode?: string;
}

export interface TwoFactorStatus {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  enabled: boolean;
  enrolledAt?: string;
  lastVerifiedAt?: string;
}

export interface LockedAccount {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  lockedAt: string;
  unlocksAt: string;
  attemptCount: number;
  lastAttemptFrom: string;
  countryCode?: string;
}

export interface SecurityPolicySummary {
  passwordMinLength: number;
  require2FA: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}