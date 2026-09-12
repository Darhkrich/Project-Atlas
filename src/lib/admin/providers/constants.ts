import type {
  ProviderStatus,
  ProviderHealthStatus,
  ProviderType,
  ProviderCapability,
  ProviderPaymentRail,
  RoutingPriority,
  HealthCheckOutcome,
  AlertSeverity,
  SettlementStatus,
  ProviderEnvironment,
} from "@/lib/admin/types/provider";

/**
 * BadgeVariant is duplicated across several constants files. Move to the
 * badge primitive in a dedicated primitives pass. Tracked, not fixed here.
 */
export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

/* ------------------------------ Status -------------------------------- */

export const PROVIDER_STATUS_LABEL: Record<ProviderStatus, string> = {
  enabled: "Enabled",
  disabled: "Disabled",
  maintenance: "Maintenance",
};

export const PROVIDER_STATUS_VARIANT: Record<ProviderStatus, BadgeVariant> = {
  enabled: "success",
  disabled: "neutral",
  maintenance: "info",
};

export const HEALTH_STATUS_LABEL: Record<ProviderHealthStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  unknown: "Unknown",
};

export const HEALTH_STATUS_VARIANT: Record<
  ProviderHealthStatus,
  BadgeVariant
> = {
  healthy: "success",
  warning: "warning",
  critical: "danger",
  unknown: "neutral",
};

/* ------------------------------ Type ---------------------------------- */

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  api: "API",
  aggregator: "Aggregator",
  direct: "Direct",
  internal: "Internal",
  manual: "Manual",
  payment: "Payment",
};

/* --------------------------- Capability / rail ------------------------ */

export const PROVIDER_CAPABILITY_LABEL: Record<ProviderCapability, string> = {
  airtime: "Airtime",
  data: "Data",
  bills: "Bills",
  tv: "TV",
  results: "Exam Results",
  other: "Other",
};

export const PROVIDER_PAYMENT_RAIL_LABEL: Record<
  ProviderPaymentRail,
  string
> = {
  mobile_money: "Mobile Money",
  card_payment: "Card Payment",
  bank_transfer: "Bank Transfer",
  ussd: "USSD",
  wallet: "Wallet",
};

/* ------------------------------ Routing ------------------------------- */

export const ROUTING_PRIORITY_LABEL: Record<RoutingPriority, string> = {
  primary: "Primary",
  secondary: "Secondary",
  fallback: "Fallback",
};

export const ROUTING_PRIORITY_VARIANT: Record<
  RoutingPriority,
  BadgeVariant
> = {
  primary: "brand",
  secondary: "info",
  fallback: "neutral",
};

/* ------------------------------ Health -------------------------------- */

export const HEALTH_OUTCOME_LABEL: Record<HealthCheckOutcome, string> = {
  pass: "Pass",
  warn: "Warn",
  fail: "Fail",
  skip: "Skipped",
};

export const HEALTH_OUTCOME_VARIANT: Record<
  HealthCheckOutcome,
  BadgeVariant
> = {
  pass: "success",
  warn: "warning",
  fail: "danger",
  skip: "neutral",
};

/* ------------------------------ Alerts -------------------------------- */

export const ALERT_SEVERITY_LABEL: Record<AlertSeverity, string> = {
  warning: "Warning",
  critical: "Critical",
};

export const ALERT_SEVERITY_VARIANT: Record<AlertSeverity, BadgeVariant> = {
  warning: "warning",
  critical: "danger",
};

/* ------------------------------ Settlement ---------------------------- */

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  pending: "Pending",
  settled: "Settled",
  failed: "Failed",
};

/* ------------------------------ Environment --------------------------- */

export const ENVIRONMENT_LABEL: Record<ProviderEnvironment, string> = {
  production: "Production",
  sandbox: "Sandbox",
};

export const ENVIRONMENT_VARIANT: Record<ProviderEnvironment, BadgeVariant> = {
  production: "brand",
  sandbox: "warning",
};

/* ------------------------------ Thresholds ---------------------------- */

export const PROVIDER_THRESHOLDS = {
  successRateHealthy: 97,
  successRateWarning: 90,
  latencyHealthyMs: 800,
  latencyWarningMs: 3000,
  lowBalanceRatio: 1.25,
  criticalBalanceRatio: 1.05,
  credentialRotationDueDays: 90,
  maintenanceDefaultMinutes: 60,
} as const;

/* ------------------------------ Sizes --------------------------------- */

export const HEALTH_HISTORY_PAGE_SIZE = 8;
export const TRANSACTIONS_PAGE_SIZE = 8;
export const ACTIVITY_PAGE_SIZE = 10;

/* ------------------------------ Choices ------------------------------- */

export const MAINTENANCE_DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 240, label: "4 hours" },
  { value: 1440, label: "24 hours" },
] as const;

export const ALL_PROVIDER_TYPES: ProviderType[] = [
  "api",
  "aggregator",
  "direct",
  "internal",
  "manual",
  "payment",
];

export const ALL_PROVIDER_STATUSES: ProviderStatus[] = [
  "enabled",
  "disabled",
  "maintenance",
];

export const ALL_PROVIDER_CAPABILITIES: ProviderCapability[] = [
  "airtime",
  "data",
  "bills",
  "tv",
  "results",
  "other",
];