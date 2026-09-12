// lib/admin/mock/settings.ts

import type {
  AdminRolePermissions,
  ApiKey,
  DataComplianceSettings,
  GeneralSettings,
  LocalizationSettings,
  MaintenanceSettings,
  NotificationSettings,
  PaymentGatewaySettings,
  SecuritySettings,
  SupportSettings,
  SystemHealth,
  WalletWithdrawalSettings,
  WebhookSettings,
} from "../types/settings";

export const mockGeneralSettings: GeneralSettings = {
  platformName: "Atlas",
  supportEmail: "support@atlas.com",
  supportPhone: "+233 20 000 0000",
  currency: "GHS",
  timezone: "Africa/Accra",
  environment: "production",
  defaultCommissionRate: 5,
  commissionPerSection: {
    digital_services: 5,
    resellers: 3.5,
    ecommerce: 4,
    admin: 0,
  },
  transactionLimitPerDay: 10_000,
  maxWithdrawalLimit: 5000,
  lowBalanceThreshold: 500,
  lowBalanceAlertChannels: ["email", "in_app"],
};

export const mockNotificationSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: false,
  emailTemplateOrderPlaced:
    "Thank you for your order. Order #{{orderId}} has been placed and is being processed.",
  emailTemplatePaymentFailed:
    "Payment for order #{{orderId}} failed. Please try again or contact support.",
  smsTemplateOrderPlaced: "Atlas: Order #{{orderId}} confirmed.",
};

export const mockSecuritySettings: SecuritySettings = {
  passwordMinLength: 8,
  passwordMinLengthMax: 64,
  require2FA: true,
  sessionTimeoutMinutes: 30,
  sessionTimeoutMinutesMax: 1440,
  maxLoginAttempts: 5,
  maxLoginAttemptsMax: 20,
  lockoutDurationMinutes: 15,
  lockoutDurationMinutesMax: 1440,
};

export const mockMaintenanceSettings: MaintenanceSettings = {
  enabled: false,
  message: "Atlas is currently under maintenance. We will be back shortly.",
  window: undefined,
  allowedIPs: ["154.160.1.1"],
};

export const mockApiKeys: ApiKey[] = [
  {
    id: "API-001",
    name: "Production integration",
    keyPreview: "ak_live_•••••••9e1c",
    createdAt: new Date(Date.now() - 86_400_000 * 30).toISOString(),
    lastUsedAt: new Date(Date.now() - 3_600_000).toISOString(),
    status: "active",
  },
  {
    id: "API-002",
    name: "Staging integration",
    keyPreview: "ak_test_•••••••3a4e",
    createdAt: new Date(Date.now() - 86_400_000 * 10).toISOString(),
    lastUsedAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    status: "active",
  },
  {
    id: "API-003",
    name: "Legacy payout worker",
    keyPreview: "ak_live_•••••••6f0b",
    createdAt: new Date(Date.now() - 86_400_000 * 120).toISOString(),
    lastUsedAt: new Date(Date.now() - 86_400_000 * 60).toISOString(),
    status: "revoked",
    revokedAt: new Date(Date.now() - 86_400_000 * 15).toISOString(),
  },
];

export const mockSystemHealth: SystemHealth = {
  apiStatus: "operational",
  databaseStatus: "operational",
  queueStatus: "operational",
  providerStatus: "degraded",
  lastChecked: new Date(Date.now() - 60_000).toISOString(),
};

export const mockPaymentGatewaySettings: PaymentGatewaySettings = {
  methods: [
    {
      id: "momo",
      name: "Mobile money",
      enabled: true,
      feePercent: 1.5,
      fixedFee: 0.5,
      sections: ["digital_services", "resellers", "ecommerce"],
      apiKeyPreview: "momo_••••••a4f2",
      secretSet: true,
      secretLastUpdatedAt: new Date(Date.now() - 86_400_000 * 45).toISOString(),
    },
    {
      id: "card",
      name: "Card payment",
      enabled: true,
      feePercent: 2.5,
      fixedFee: 1,
      sections: ["digital_services", "ecommerce"],
      apiKeyPreview: "card_••••••b7c1",
      secretSet: true,
      secretLastUpdatedAt: new Date(Date.now() - 86_400_000 * 30).toISOString(),
    },
    {
      id: "bank",
      name: "Bank transfer",
      enabled: false,
      feePercent: 1,
      fixedFee: 2,
      sections: ["ecommerce"],
      secretSet: false,
    },
    {
      id: "wallet",
      name: "Atlas wallet",
      enabled: true,
      feePercent: 0,
      fixedFee: 0,
      sections: ["digital_services", "resellers", "ecommerce"],
      secretSet: false,
    },
  ],
};

export const mockWalletWithdrawalSettings: WalletWithdrawalSettings = {
  autoApproveThreshold: 5000,
  dailyWithdrawalLimit: 20_000,
  monthlyWithdrawalLimit: 100_000,
  minBalanceToWithdraw: 10,
  processingTime: "t1",
  perSectionOverrides: {
    resellers: {
      autoApproveThreshold: 3000,
      dailyLimit: 15_000,
    },
    ecommerce: {
      dailyLimit: 25_000,
    },
  },
};

export const mockSupportSettings: SupportSettings = {
  slaWarningHours: 8,
  slaCriticalHours: 24,
  autoAssign: true,
  autoAssignRule: "round_robin",
  liveChatEnabled: true,
  liveChatHours: "8:00 - 20:00",
};

export const mockLocalizationSettings: LocalizationSettings = {
  defaultLanguage: "English",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12-hour",
};

export const mockDataComplianceSettings: DataComplianceSettings = {
  auditLogRetentionDays: 365,
  dataExportEnabled: true,
  dataDeleteEnabled: true,
  backupSchedule: {
    frequency: "daily",
    hour: 2,
    minute: 0,
  },
};

export const mockWebhookSettings: WebhookSettings = {
  webhooks: [
    {
      id: "WH-001",
      event: "order.placed",
      url: "https://integrations.atlas.example.com/order",
      enabled: true,
      secretSet: true,
    },
    {
      id: "WH-002",
      event: "payment.received",
      url: "https://integrations.atlas.example.com/payment",
      enabled: false,
      secretSet: true,
    },
  ],
};

export const mockAdminRolePermissions: AdminRolePermissions = {
  roles: [
    { name: "Super admin", permissions: ["*"] },
    {
      name: "Operations admin",
      permissions: ["orders.view", "transactions.view", "payments.view"],
    },
    {
      name: "Support admin",
      permissions: ["support.view", "support.manage", "customers.view"],
    },
    {
      name: "Finance admin",
      permissions: ["wallets.view", "refunds.view", "commissions.manage"],
    },
  ],
};