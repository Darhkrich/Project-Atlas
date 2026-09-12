// lib/admin/types/storefront-user.ts

export type StorefrontUserStatus = "active" | "inactive" | "suspended";
export type StorefrontUserRiskLevel = "low" | "medium" | "high";
export type StorefrontUserReportStatus =
  | "pending"
  | "action_taken"
  | "dismissed";
export type StorefrontUserRole = "customer";
export type StorefrontUserSegment = "new" | "repeat" | "vip" | "at_risk";

export type StorefrontUserReportCategory =
  | "fraud"
  | "chargeback"
  | "abuse"
  | "spam"
  | "policy_violation"
  | "other";

export interface StorefrontUserReport {
  id: string;
  reporterType: "reseller" | "merchant";
  reporterId: string;
  reporterName: string;
  category: StorefrontUserReportCategory;
  reason: string;
  details?: string;
  timestamp: string;
  status: StorefrontUserReportStatus;
  actionTaken?: string;
  actionTimestamp?: string;
  adminNote?: string;
  resolvedById?: string;
  resolvedByName?: string;
  resolvedAt?: string;
}

export interface StorefrontUserActivity {
  id: string;
  timestamp: string;
  action: string;
}

export interface StorefrontUserAuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export interface StorefrontUserSecurityEvent {
  id: string;
  timestamp: string;
  event: string;
  ip?: string;
}

export interface StorefrontUserNotificationPreference {
  channel: "email" | "sms" | "push";
  enabled: boolean;
}

export interface StorefrontUser {
  id: string;
  storefrontId: string;
  storefrontType: "reseller" | "merchant";
  storeName: string;
  role: StorefrontUserRole;

  name: string;
  email: string;
  phone: string;
  country?: string;

  status: StorefrontUserStatus;
  segment?: StorefrontUserSegment;
  tags: string[];

  ordersCount: number;
  totalSpent: number;
  totalRefunded?: number;
  lastOrderAt: string | null;
  walletBalance: number;

  joinedAt: string;
  lastActive: string;

  riskScore: number;
  riskLevel: StorefrontUserRiskLevel;
  reports: StorefrontUserReport[];

  referralCode: string | null;
  referredBy: string | null;

  notificationPreferences: StorefrontUserNotificationPreference[];
  activityLog: StorefrontUserActivity[];
  auditTrail?: StorefrontUserAuditEntry[];
  securityEvents: StorefrontUserSecurityEvent[];
}