import type {
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  MaintenanceSettings,
  ApiKey,
  SystemHealth,
  PaymentGatewaySettings,
  WalletWithdrawalSettings,
  SupportSettings,
  LocalizationSettings,
  DataComplianceSettings,
  WebhookSettings,
  AdminRolePermissions,
} from "../types/settings";

export const mockGeneralSettings: GeneralSettings = {
  platformName: "Atlas",
  supportEmail: "support@atlas.com",
  supportPhone: "+233 20 000 0000",
  currency: "GHS",
  timezone: "Africa/Accra",
  defaultCommissionRate: 5,
  transactionLimitPerDay: 10000,
  maxWithdrawalLimit: 5000,
  lowBalanceThreshold: 500,
};

export const mockNotificationSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: false,
  emailTemplateOrderPlaced: "Thank you for your order! Your order #{{orderId}} has been placed.",
  emailTemplatePaymentFailed: "Payment for order #{{orderId}} failed. Please try again.",
  smsTemplateOrderPlaced: "Atlas: Order #{{orderId}} confirmed.",
};

export const mockSecuritySettings: SecuritySettings = {
  passwordMinLength: 8,
  require2FA: true,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};

export const mockMaintenanceSettings: MaintenanceSettings = {
  enabled: false,
  message: "Atlas is currently under maintenance. We'll be back shortly.",
  expectedDuration: "30 minutes",
  allowedIPs: ["154.160.1.1"],
};

export const mockApiKeys: ApiKey[] = [
  {
    id: "API-001",
    name: "Production Integration",
    key: "ak_live_2f8d...9e1c",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
  },
  {
    id: "API-002",
    name: "Test Integration",
    key: "ak_test_7b1c...3a4e",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastUsedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "active",
  },
  {
    id: "API-003",
    name: "Old Key",
    key: "ak_live_9c2a...6f0b",
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    lastUsedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    status: "revoked",
  },
];

export const mockSystemHealth: SystemHealth = {
  apiStatus: "operational",
  databaseStatus: "operational",
  queueStatus: "operational",
  providerStatus: "degraded",
  lastChecked: new Date(Date.now() - 60000).toISOString(),
};

export const mockPaymentGatewaySettings: PaymentGatewaySettings = {
  methods: [
    { id: "momo", name: "Mobile Money", enabled: true, feePercent: 1.5, fixedFee: 0.5, apiKey: "momo_key", secret: "momo_secret" },
    { id: "card", name: "Card Payment", enabled: true, feePercent: 2.5, fixedFee: 1.0, apiKey: "card_key", secret: "card_secret" },
    { id: "bank", name: "Bank Transfer", enabled: false, feePercent: 1.0, fixedFee: 2.0 },
    { id: "wallet", name: "Wallet", enabled: true, feePercent: 0, fixedFee: 0 },
  ],
};

export const mockWalletWithdrawalSettings: WalletWithdrawalSettings = {
  autoApproveThreshold: 5000,
  dailyWithdrawalLimit: 20000,
  monthlyWithdrawalLimit: 100000,
  minBalanceToWithdraw: 10,
  processingTime: "t1",
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
  backupSchedule: "Daily at 2:00 AM",
};

export const mockWebhookSettings: WebhookSettings = {
  webhooks: [
    { id: "WH-001", event: "order.placed", url: "https://example.com/order", enabled: true },
    { id: "WH-002", event: "payment.received", url: "https://example.com/payment", enabled: false },
  ],
};

export const mockAdminRolePermissions: AdminRolePermissions = {
  roles: [
    { name: "Super Admin", permissions: ["*"] },
    { name: "Operations Admin", permissions: ["orders.view", "transactions.view", "payments.view"] },
    { name: "Support Admin", permissions: ["support.view", "support.manage", "customers.view"] },
    { name: "Finance Admin", permissions: ["wallets.view", "refunds.view", "commissions.manage"] },
  ],
};