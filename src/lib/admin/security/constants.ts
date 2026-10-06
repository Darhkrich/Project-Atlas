// lib/admin/security/constants.ts

import type { AtlasIconName } from "@/components/atlas/icons";
import type {
  SecurityEventType,
  SecurityResourceKind,
  SecuritySeverity,
  SessionUserType,
} from "@/lib/admin/types/security";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const EVENT_TYPE_LABEL: Record<SecurityEventType, string> = {
  login_success: "Login success",
  login_failure: "Login failure",
  logout: "Logout",
  password_change: "Password change",
  role_change: "Role change",
  permission_change: "Permission change",
  wallet_adjustment: "Wallet adjustment",
  api_key_change: "API key change",
  suspicious_activity: "Suspicious activity",
  ip_blocked: "IP blocked",
  ip_unblocked: "IP unblocked",
};

export const EVENT_TYPE_ICON: Record<SecurityEventType, AtlasIconName> = {
  login_success: "check-circle",
  login_failure: "x-circle",
  logout: "disconnect",
  password_change: "lock",
  role_change: "shield",
  permission_change: "shield",
  wallet_adjustment: "wallet",
  api_key_change: "lock",
  suspicious_activity: "alert-triangle",
  ip_blocked: "lock",
  ip_unblocked: "shield",
};

export const SEVERITY_LABEL: Record<SecuritySeverity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

export const SEVERITY_VARIANT: Record<SecuritySeverity, BadgeVariant> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

export const RESOURCE_KIND_LABEL: Record<SecurityResourceKind, string> = {
  admin_user: "Admin user",
  settings: "Settings",
  wallet: "Wallet",
  api_key: "API key",
  session: "Session",
  transaction: "Transaction",
};

export const SESSION_USER_TYPE_LABEL: Record<SessionUserType, string> = {
  admin: "Admin",
  reseller: "Reseller",
  merchant: "Merchant",
  customer: "Customer",
};

export type SecurityTimeRange = "1h" | "24h" | "7d" | "30d" | "all";

export const TIME_RANGE_LABEL: Record<SecurityTimeRange, string> = {
  "1h": "Last hour",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export const TIME_RANGE_MS: Record<SecurityTimeRange, number | null> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: null,
};

export const ALL_TIME_RANGES: SecurityTimeRange[] = [
  "1h",
  "24h",
  "7d",
  "30d",
  "all",
];

export const ALL_SEVERITIES: SecuritySeverity[] = [
  "info",
  "warning",
  "critical",
];

export const ALL_EVENT_TYPES: SecurityEventType[] = [
  "login_success",
  "login_failure",
  "logout",
  "password_change",
  "role_change",
  "permission_change",
  "wallet_adjustment",
  "api_key_change",
  "suspicious_activity",
  "ip_blocked",
  "ip_unblocked",
];

export function eventTypeLabel(type: SecurityEventType): string {
  return EVENT_TYPE_LABEL[type] ?? type;
}

export function isBlockableEvent(type: SecurityEventType): boolean {
  return (
    type === "login_failure" ||
    type === "suspicious_activity" ||
    type === "ip_blocked"
  );
}