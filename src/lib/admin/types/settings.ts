// lib/admin/types/settings.ts

import type { NotificationChannel } from "./notification";

export type PlatformEnvironment = "development" | "staging" | "production";

export type AtlasSection =
  | "digital_services"
  | "resellers"
  | "ecommerce"
  | "admin";

export type SettingsTab =
  | "general"
  | "notifications"
  | "security"
  | "maintenance"
  | "health"
  | "api"
  | "payments"
  | "wallet"
  | "support"
  | "localization"
  | "compliance"
  | "webhooks"
  | "roles";

export type HealthStatus = "operational" | "degraded" | "down";

export interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  environment: PlatformEnvironment;
  defaultCommissionRate: number;
  commissionPerSection: Record<AtlasSection, number>;
  transactionLimitPerDay: number;
  maxWithdrawalLimit: number;
  lowBalanceThreshold: number;
  lowBalanceAlertChannels: NotificationChannel[];
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailTemplateOrderPlaced: string;
  emailTemplatePaymentFailed: string;
  smsTemplateOrderPlaced: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  passwordMinLengthMax: number;
  require2FA: boolean;
  sessionTimeoutMinutes: number;
  sessionTimeoutMinutesMax: number;
  maxLoginAttempts: number;
  maxLoginAttemptsMax: number;
  lockoutDurationMinutes: number;
  lockoutDurationMinutesMax: number;
}

export interface MaintenanceWindow {
  startAt: string;
  endAt: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  window?: MaintenanceWindow;
  allowedIPs: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string;
  status: "active" | "revoked";
  revokedAt?: string;
}

export interface SystemHealth {
  apiStatus: HealthStatus;
  databaseStatus: HealthStatus;
  queueStatus: HealthStatus;
  providerStatus: HealthStatus;
  lastChecked: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  feePercent: number;
  fixedFee: number;
  sections: AtlasSection[];
  apiKeyPreview?: string;
  secretSet: boolean;
  secretLastUpdatedAt?: string;
}

export interface PaymentGatewaySettings {
  methods: PaymentMethodConfig[];
}

export interface SectionOverride {
  autoApproveThreshold?: number;
  dailyLimit?: number;
}

export interface WalletWithdrawalSettings {
  autoApproveThreshold: number;
  dailyWithdrawalLimit: number;
  monthlyWithdrawalLimit: number;
  minBalanceToWithdraw: number;
  processingTime: "instant" | "t1";
  perSectionOverrides?: Partial<Record<AtlasSection, SectionOverride>>;
}

export interface SupportSettings {
  slaWarningHours: number;
  slaCriticalHours: number;
  autoAssign: boolean;
  autoAssignRule: "round_robin" | "by_type";
  liveChatEnabled: boolean;
  liveChatHours: string;
}

export interface LocalizationSettings {
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
}

export type BackupFrequency = "daily" | "weekly" | "monthly";

export interface StructuredSchedule {
  frequency: BackupFrequency;
  hour: number;
  minute: number;
  dayOfWeek?: number;
}

export interface DataComplianceSettings {
  auditLogRetentionDays: number;
  dataExportEnabled: boolean;
  dataDeleteEnabled: boolean;
  backupSchedule: StructuredSchedule;
}

export interface Webhook {
  id: string;
  event: string;
  url: string;
  enabled: boolean;
  secretSet?: boolean;
}

export interface WebhookSettings {
  webhooks: Webhook[];
}

export interface RoleDefinition {
  name: string;
  permissions: string[];
}

export interface AdminRolePermissions {
  roles: RoleDefinition[];
}

export interface SettingsAuditEntry {
  id: string;
  tab: SettingsTab;
  field: string;
  previousValue: string;
  newValue: string;
  actorId: string;
  actorName: string;
  at: string;
}