// lib/admin/settings/constants.ts

import type {
  AtlasSection,
  BackupFrequency,
  PlatformEnvironment,
  SettingsTab,
} from "@/lib/admin/types/settings";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export interface TabConfig {
  key: SettingsTab;
  label: string;
  readOnly: boolean;
}

export const SETTINGS_TABS: TabConfig[] = [
  { key: "general", label: "General", readOnly: false },
  { key: "notifications", label: "Notifications", readOnly: false },
  { key: "security", label: "Security", readOnly: false },
  { key: "maintenance", label: "Maintenance", readOnly: false },
  { key: "health", label: "System health", readOnly: true },
  { key: "api", label: "API keys", readOnly: false },
  { key: "payments", label: "Payment gateway", readOnly: false },
  { key: "wallet", label: "Wallet & withdrawals", readOnly: false },
  { key: "support", label: "Support", readOnly: false },
  { key: "localization", label: "Localization", readOnly: false },
  { key: "compliance", label: "Data & compliance", readOnly: false },
  { key: "webhooks", label: "Webhooks", readOnly: false },
  { key: "roles", label: "Roles & permissions", readOnly: true },
];

export const READ_ONLY_TABS = new Set<SettingsTab>(
  SETTINGS_TABS.filter((t) => t.readOnly).map((t) => t.key)
);

export const ENVIRONMENT_LABEL: Record<PlatformEnvironment, string> = {
  development: "Development",
  staging: "Staging",
  production: "Production",
};

export const ENVIRONMENT_VARIANT: Record<PlatformEnvironment, BadgeVariant> = {
  development: "neutral",
  staging: "warning",
  production: "danger",
};

export const SECTION_LABEL: Record<AtlasSection, string> = {
  digital_services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
  admin: "Admin",
};

export const SECTION_DESCRIPTION: Record<AtlasSection, string> = {
  digital_services: "Direct consumer purchases of airtime, data, bills, and pins.",
  resellers: "Downstream sales made through reseller storefronts.",
  ecommerce: "Merchant storefront orders and subscriptions.",
  admin: "Internal-only operations and compensation flows.",
};

export const ALL_SECTIONS: AtlasSection[] = [
  "digital_services",
  "resellers",
  "ecommerce",
  "admin",
];

export const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2026)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2026)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-12-31)" },
];

export const TIME_FORMAT_OPTIONS = [
  { value: "12-hour", label: "12-hour (2:30 PM)" },
  { value: "24-hour", label: "24-hour (14:30)" },
];

export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Twi", label: "Twi" },
  { value: "Ewe", label: "Ewe" },
  { value: "Ga", label: "Ga" },
];

export const PROCESSING_TIME_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "t1", label: "T+1" },
];

export const AUTO_ASSIGN_RULE_OPTIONS = [
  { value: "round_robin", label: "Round-robin" },
  { value: "by_type", label: "By user type" },
];

export const BACKUP_FREQUENCY_OPTIONS: { value: BackupFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const FIELD_LABELS: Record<string, string> = {
  platformName: "Platform name",
  supportEmail: "Support email",
  supportPhone: "Support phone",
  currency: "Currency",
  timezone: "Timezone",
  environment: "Environment",
  defaultCommissionRate: "Default commission rate",
  commissionPerSection: "Commission rate",
  transactionLimitPerDay: "Daily transaction limit",
  maxWithdrawalLimit: "Max withdrawal limit",
  lowBalanceThreshold: "Low balance threshold",
  lowBalanceAlertChannels: "Low balance alert channels",

  emailEnabled: "Email notifications",
  smsEnabled: "SMS notifications",
  pushEnabled: "Push notifications",
  emailTemplateOrderPlaced: "Order placed email template",
  emailTemplatePaymentFailed: "Payment failed email template",
  smsTemplateOrderPlaced: "Order placed SMS template",

  passwordMinLength: "Password minimum length",
  passwordMinLengthMax: "Password minimum length (upper bound)",
  require2FA: "Require 2FA",
  sessionTimeoutMinutes: "Session timeout",
  sessionTimeoutMinutesMax: "Session timeout (upper bound)",
  maxLoginAttempts: "Max login attempts",
  maxLoginAttemptsMax: "Max login attempts (upper bound)",
  lockoutDurationMinutes: "Lockout duration",
  lockoutDurationMinutesMax: "Lockout duration (upper bound)",

  enabled: "Enabled",
  message: "Message",
  window: "Maintenance window",
  startAt: "Start",
  endAt: "End",
  allowedIPs: "Allowed IPs",

  apiStatus: "API",
  databaseStatus: "Database",
  queueStatus: "Queue",
  providerStatus: "Providers",

  methods: "Payment methods",
  name: "Name",
  feePercent: "Fee percent",
  fixedFee: "Fixed fee",
  sections: "Sections",
  apiKeyPreview: "API key",
  secretSet: "Secret configured",
  secretLastUpdatedAt: "Secret last updated",

  autoApproveThreshold: "Auto-approve threshold",
  dailyWithdrawalLimit: "Daily withdrawal limit",
  monthlyWithdrawalLimit: "Monthly withdrawal limit",
  minBalanceToWithdraw: "Minimum balance to withdraw",
  processingTime: "Processing time",
  perSectionOverrides: "Per-section overrides",
  dailyLimit: "Daily limit",

  slaWarningHours: "SLA warning",
  slaCriticalHours: "SLA critical",
  autoAssign: "Auto-assign",
  autoAssignRule: "Auto-assign rule",
  liveChatEnabled: "Live chat",
  liveChatHours: "Live chat hours",

  defaultLanguage: "Default language",
  dateFormat: "Date format",
  timeFormat: "Time format",

  auditLogRetentionDays: "Audit log retention",
  dataExportEnabled: "Data export",
  dataDeleteEnabled: "Data delete",
  backupSchedule: "Backup schedule",
  frequency: "Frequency",
  hour: "Hour",
  minute: "Minute",
  dayOfWeek: "Day of week",

  webhooks: "Webhooks",
  event: "Event",
  url: "URL",

  roles: "Roles",
  permissions: "Permissions",
};

export function fieldLabel(path: string): string {
  const parts = path.split(".");
  const last = parts[parts.length - 1] ?? path;
  const sectionKey = parts[parts.length - 2];

  if (sectionKey && FIELD_LABELS[sectionKey] && SECTION_LABEL[sectionKey as AtlasSection]) {
    return `${FIELD_LABELS[sectionKey]} · ${SECTION_LABEL[sectionKey as AtlasSection]}`;
  }

  if (last === "value" && parts.length >= 3) {
    const idx = parts[parts.length - 2];
    const rootField = parts[parts.length - 3];
    if (rootField && FIELD_LABELS[rootField]) {
      return `${FIELD_LABELS[rootField]} · ${idx}`;
    }
  }

  return FIELD_LABELS[last] ?? last;
}

export function formatSettingValue(value: unknown): string {
  if (value === null || value === undefined) return "Not set";
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  if (typeof value === "number") return value.toLocaleString("en-GH");
  if (typeof value === "string") return value || "Empty";
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
      .join(", ");
  }
  return JSON.stringify(value);
}