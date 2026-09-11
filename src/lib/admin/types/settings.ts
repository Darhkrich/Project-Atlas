export interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  defaultCommissionRate: number;
  transactionLimitPerDay: number;
  maxWithdrawalLimit: number;
  lowBalanceThreshold: number;
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
  require2FA: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  expectedDuration: string;
  allowedIPs: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  status: "active" | "revoked";
}

export interface SystemHealth {
  apiStatus: "operational" | "degraded" | "down";
  databaseStatus: "operational" | "degraded" | "down";
  queueStatus: "operational" | "degraded" | "down";
  providerStatus: "operational" | "degraded" | "down";
  lastChecked: string;
}

export interface PaymentGatewaySettings {
  methods: {
    id: string;
    name: string;
    enabled: boolean;
    feePercent: number;
    fixedFee: number;
    apiKey?: string;
    secret?: string;
  }[];
}

export interface WalletWithdrawalSettings {
  autoApproveThreshold: number;
  dailyWithdrawalLimit: number;
  monthlyWithdrawalLimit: number;
  minBalanceToWithdraw: number;
  processingTime: "instant" | "t1";
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

export interface DataComplianceSettings {
  auditLogRetentionDays: number;
  dataExportEnabled: boolean;
  dataDeleteEnabled: boolean;
  backupSchedule: string;
}

export interface WebhookSettings {
  webhooks: {
    id: string;
    event: string;
    url: string;
    enabled: boolean;
  }[];
}

export interface AdminRolePermissions {
  roles: {
    name: string;
    permissions: string[];
  }[];
}