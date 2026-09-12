// lib/admin/audit-logs/constants.ts

import type {
  AuditActionKind,
  AuditResourceKind,
  AuditResult,
  AuditSource,
} from "@/lib/admin/types/audit-log";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const ACTION_LABEL: Record<AuditActionKind, string> = {
  role_change: "Role changed",
  permission_change: "Permission changed",
  wallet_adjustment: "Wallet adjusted",
  merchant_suspend: "Merchant suspended",
  merchant_reactivate: "Merchant reactivated",
  price_change: "Price changed",
  settings_change: "Settings changed",
  api_key_create: "API key created",
  api_key_revoke: "API key revoked",
  webhook_add: "Webhook added",
  webhook_remove: "Webhook removed",
  template_reset: "Template reset",
  refund_issue: "Refund issued",
  manual_payout: "Manual payout",
  kyc_approve: "KYC approved",
  kyc_reject: "KYC rejected",
  login_force_logout: "Forced logout",
};

export const RESOURCE_KIND_LABEL: Record<AuditResourceKind, string> = {
  admin_user: "Admin user",
  settings: "Settings",
  wallet: "Wallet",
  api_key: "API key",
  session: "Session",
  service: "Service",
  product: "Product",
  order: "Order",
  reseller: "Reseller",
  merchant: "Merchant",
  transaction: "Transaction",
  role: "Role",
  template: "Template",
  webhook: "Webhook",
};

export const SOURCE_LABEL: Record<AuditSource, string> = {
  settings: "Settings",
  security: "Security center",
  services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
  support: "Support",
  api: "API",
};

export const SOURCE_PATH: Record<AuditSource, string | null> = {
  settings: "/admin/settings",
  security: "/admin/security",
  services: "/admin/services",
  resellers: "/admin/resellers",
  ecommerce: "/admin/ecommerce",
  support: "/admin/support",
  api: null,
};

export const RESULT_LABEL: Record<AuditResult, string> = {
  success: "Success",
  failure: "Failure",
};

export const RESULT_VARIANT: Record<AuditResult, BadgeVariant> = {
  success: "success",
  failure: "danger",
};

export const ALL_ACTIONS: AuditActionKind[] = [
  "role_change",
  "permission_change",
  "wallet_adjustment",
  "merchant_suspend",
  "merchant_reactivate",
  "price_change",
  "settings_change",
  "api_key_create",
  "api_key_revoke",
  "webhook_add",
  "webhook_remove",
  "template_reset",
  "refund_issue",
  "manual_payout",
  "kyc_approve",
  "kyc_reject",
  "login_force_logout",
];

export const ALL_RESOURCE_KINDS: AuditResourceKind[] = [
  "admin_user",
  "settings",
  "wallet",
  "api_key",
  "session",
  "service",
  "product",
  "order",
  "reseller",
  "merchant",
  "transaction",
  "role",
  "template",
  "webhook",
];

export const ALL_RESULTS: AuditResult[] = ["success", "failure"];

export type AuditTimeRange = "1h" | "24h" | "7d" | "30d" | "all";

export const TIME_RANGE_LABEL: Record<AuditTimeRange, string> = {
  "1h": "Last hour",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export const TIME_RANGE_MS: Record<AuditTimeRange, number | null> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: null,
};

export const ALL_TIME_RANGES: AuditTimeRange[] = [
  "1h",
  "24h",
  "7d",
  "30d",
  "all",
];

export function actionLabel(action: AuditActionKind): string {
  return ACTION_LABEL[action] ?? action;
}

export function resourceKindLabel(kind: AuditResourceKind): string {
  return RESOURCE_KIND_LABEL[kind] ?? kind;
}

export function sourceLabel(source: AuditSource): string {
  return SOURCE_LABEL[source] ?? source;
}