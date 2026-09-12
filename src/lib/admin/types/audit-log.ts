// lib/admin/types/audit-log.ts

import type { AtlasSection } from "./settings";

export type AuditResult = "success" | "failure";

export type AuditResourceKind =
  | "admin_user"
  | "settings"
  | "wallet"
  | "api_key"
  | "session"
  | "service"
  | "product"
  | "order"
  | "reseller"
  | "merchant"
  | "transaction"
  | "role"
  | "template"
  | "webhook";

export type AuditActionKind =
  | "role_change"
  | "permission_change"
  | "wallet_adjustment"
  | "merchant_suspend"
  | "merchant_reactivate"
  | "price_change"
  | "settings_change"
  | "api_key_create"
  | "api_key_revoke"
  | "webhook_add"
  | "webhook_remove"
  | "template_reset"
  | "refund_issue"
  | "manual_payout"
  | "kyc_approve"
  | "kyc_reject"
  | "login_force_logout";

export type AuditSource =
  | "settings"
  | "security"
  | "services"
  | "resellers"
  | "ecommerce"
  | "support"
  | "api";

export interface AuditLogEntry {
  id: string;
  timestamp: string;

  actorId?: string;
  actorName?: string;
  admin: string;

  action: AuditActionKind;
  resourceKind: AuditResourceKind;
  resource: string;
  resourceId: string;

  section?: AtlasSection;
  source?: AuditSource;

  ip: string;
  userAgent?: string;

  result: AuditResult;
  previousValue?: string;
  newValue?: string;
  reason?: string;

  sessionId?: string;
  relatedSecurityEventId?: string;
}