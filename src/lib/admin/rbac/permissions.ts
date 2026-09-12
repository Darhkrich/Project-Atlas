// lib/admin/rbac/permissions.ts

export const PERMISSIONS = {
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_EDIT: "customers:edit",
  CUSTOMERS_SUSPEND: "customers:suspend",
  CUSTOMERS_WALLET: "customers:wallet",
  CUSTOMERS_REVEAL_PII: "customers:reveal_pii",
  CUSTOMERS_NOTIFY: "customers:notify",

  RESELLERS_VIEW: "resellers:view",
  RESELLERS_EDIT: "resellers:edit",
  RESELLERS_SUSPEND: "resellers:suspend",
  RESELLERS_VERIFY: "resellers:verify",
  RESELLERS_WALLET: "resellers:wallet",
  RESELLERS_TIER: "resellers:tier",
  RESELLERS_STOREFRONT_TOGGLE: "resellers:storefront_toggle",
  RESELLERS_NOTIFY: "resellers:notify",

  MERCHANTS_VIEW: "merchants:view",
  MERCHANTS_EDIT: "merchants:edit",
  MERCHANTS_SUSPEND: "merchants:suspend",
  MERCHANTS_PLAN: "merchants:plan",
  MERCHANTS_STORE_TOGGLE: "merchants:store_toggle",
  MERCHANTS_CONTRACT_MRR: "merchants:contract_mrr",
  MERCHANTS_NOTIFY: "merchants:notify",

  STOREFRONT_USERS_VIEW: "storefront_users:view",
  STOREFRONT_USERS_SUSPEND: "storefront_users:suspend",
  STOREFRONT_USERS_NOTIFY: "storefront_users:notify",
  STOREFRONT_USERS_REVEAL_PII: "storefront_users:reveal_pii",
  STOREFRONT_USERS_COUPON: "storefront_users:coupon",
  STOREFRONT_USERS_SEGMENT: "storefront_users:segment",
  STOREFRONT_USERS_TAG: "storefront_users:tag",
  STOREFRONT_USERS_EXPORT: "storefront_users:export",

  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",
  ORDERS_EXPORT: "orders:export",

  TRANSACTIONS_VIEW: "transactions:view",
  TRANSACTIONS_RETRY: "transactions:retry",
  TRANSACTIONS_REFUND: "transactions:refund",
  TRANSACTIONS_EXPORT: "transactions:export",

  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_REFUND: "payments:refund",
  PAYMENTS_EXPORT: "payments:export",

  REFUNDS_VIEW: "refunds:view",
  REFUNDS_APPROVE: "refunds:approve",
  REFUNDS_REJECT: "refunds:reject",
  REFUNDS_PROCESS: "refunds:process",

  WALLETS_VIEW: "wallets:view",
  WALLETS_ADJUST: "wallets:adjust",

  SERVICES_VIEW: "services:view",
  SERVICES_MANAGE: "services:manage",

  DATA_PLANS_VIEW: "data_plans:view",
  DATA_PLANS_MANAGE: "data_plans:manage",

  PROVIDERS_VIEW: "providers:view",
  PROVIDERS_MANAGE: "providers:manage",

  PRICING_VIEW: "pricing:view",
  PRICING_MANAGE: "pricing:manage",

  COMMISSIONS_VIEW: "commissions:view",
  COMMISSIONS_MANAGE: "commissions:manage",

  STOREFRONTS_VIEW: "storefronts:view",
  STOREFRONTS_MANAGE: "storefronts:manage",

  SUPPORT_VIEW: "support:view",
  SUPPORT_MANAGE: "support:manage",

  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_MANAGE: "notifications:manage",

  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_EXPORT: "analytics:export",

  REPORTS_VIEW: "reports:view",
  REPORTS_EXPORT: "reports:export",

  SECURITY_VIEW: "security:view",
  SECURITY_MANAGE: "security:manage",

  AUDIT_LOGS_VIEW: "audit_logs:view",
  AUDIT_LOGS_EXPORT: "audit_logs:export",

  ADMIN_USERS_VIEW: "admin_users:view",
  ADMIN_USERS_MANAGE: "admin_users:manage",

  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",

  EXPORT: "export:run",
  RESET_SECURITY: "security:reset",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionModuleGroup {
  module: string;
  label: string;
  description: string;
  permissions: { value: Permission; label: string }[];
}

export const PERMISSION_MODULES: PermissionModuleGroup[] = [
  {
    module: "customers",
    label: "Customers",
    description: "Direct Atlas digital-services customers.",
    permissions: [
      { value: PERMISSIONS.CUSTOMERS_VIEW, label: "View customers" },
      { value: PERMISSIONS.CUSTOMERS_EDIT, label: "Edit customers" },
      { value: PERMISSIONS.CUSTOMERS_SUSPEND, label: "Suspend customers" },
      { value: PERMISSIONS.CUSTOMERS_WALLET, label: "Adjust wallet" },
      { value: PERMISSIONS.CUSTOMERS_REVEAL_PII, label: "Reveal PII" },
      { value: PERMISSIONS.CUSTOMERS_NOTIFY, label: "Send notifications" },
    ],
  },
  {
    module: "resellers",
    label: "Resellers",
    description: "Reseller accounts and verification.",
    permissions: [
      { value: PERMISSIONS.RESELLERS_VIEW, label: "View resellers" },
      { value: PERMISSIONS.RESELLERS_EDIT, label: "Edit resellers" },
      { value: PERMISSIONS.RESELLERS_SUSPEND, label: "Suspend resellers" },
      { value: PERMISSIONS.RESELLERS_VERIFY, label: "Verify resellers" },
      { value: PERMISSIONS.RESELLERS_WALLET, label: "Adjust wallet" },
      { value: PERMISSIONS.RESELLERS_TIER, label: "Change tier" },
      {
        value: PERMISSIONS.RESELLERS_STOREFRONT_TOGGLE,
        label: "Toggle storefront",
      },
      { value: PERMISSIONS.RESELLERS_NOTIFY, label: "Send notifications" },
    ],
  },
  {
    module: "merchants",
    label: "Merchants",
    description: "Ecommerce merchant accounts and plans.",
    permissions: [
      { value: PERMISSIONS.MERCHANTS_VIEW, label: "View merchants" },
      { value: PERMISSIONS.MERCHANTS_EDIT, label: "Edit merchants" },
      { value: PERMISSIONS.MERCHANTS_SUSPEND, label: "Suspend merchants" },
      { value: PERMISSIONS.MERCHANTS_PLAN, label: "Change plan" },
      { value: PERMISSIONS.MERCHANTS_STORE_TOGGLE, label: "Toggle store" },
      { value: PERMISSIONS.MERCHANTS_CONTRACT_MRR, label: "Contract MRR" },
      { value: PERMISSIONS.MERCHANTS_NOTIFY, label: "Send notifications" },
    ],
  },
  {
    module: "storefront_users",
    label: "Storefront users",
    description: "Customers shopping on reseller or merchant storefronts.",
    permissions: [
      { value: PERMISSIONS.STOREFRONT_USERS_VIEW, label: "View users" },
      { value: PERMISSIONS.STOREFRONT_USERS_SUSPEND, label: "Suspend users" },
      { value: PERMISSIONS.STOREFRONT_USERS_NOTIFY, label: "Notify users" },
      {
        value: PERMISSIONS.STOREFRONT_USERS_REVEAL_PII,
        label: "Reveal PII",
      },
      { value: PERMISSIONS.STOREFRONT_USERS_COUPON, label: "Issue coupons" },
      { value: PERMISSIONS.STOREFRONT_USERS_SEGMENT, label: "Build segments" },
      { value: PERMISSIONS.STOREFRONT_USERS_TAG, label: "Manage tags" },
      { value: PERMISSIONS.STOREFRONT_USERS_EXPORT, label: "Export users" },
    ],
  },
  {
    module: "orders",
    label: "Orders",
    description: "Order records and fulfillment.",
    permissions: [
      { value: PERMISSIONS.ORDERS_VIEW, label: "View orders" },
      { value: PERMISSIONS.ORDERS_MANAGE, label: "Manage orders" },
      { value: PERMISSIONS.ORDERS_EXPORT, label: "Export orders" },
    ],
  },
  {
    module: "transactions",
    label: "Transactions",
    description: "Transaction records and retries.",
    permissions: [
      { value: PERMISSIONS.TRANSACTIONS_VIEW, label: "View transactions" },
      { value: PERMISSIONS.TRANSACTIONS_RETRY, label: "Retry transactions" },
      { value: PERMISSIONS.TRANSACTIONS_REFUND, label: "Refund transactions" },
      { value: PERMISSIONS.TRANSACTIONS_EXPORT, label: "Export transactions" },
    ],
  },
  {
    module: "payments",
    label: "Payments",
    description: "Payment gateway activity.",
    permissions: [
      { value: PERMISSIONS.PAYMENTS_VIEW, label: "View payments" },
      { value: PERMISSIONS.PAYMENTS_REFUND, label: "Refund payments" },
      { value: PERMISSIONS.PAYMENTS_EXPORT, label: "Export payments" },
    ],
  },
  {
    module: "refunds",
    label: "Refunds",
    description: "Refund approval and processing.",
    permissions: [
      { value: PERMISSIONS.REFUNDS_VIEW, label: "View refunds" },
      { value: PERMISSIONS.REFUNDS_APPROVE, label: "Approve refunds" },
      { value: PERMISSIONS.REFUNDS_REJECT, label: "Reject refunds" },
      { value: PERMISSIONS.REFUNDS_PROCESS, label: "Process refunds" },
    ],
  },
  {
    module: "wallets",
    label: "Wallets",
    description: "Wallet balances and adjustments.",
    permissions: [
      { value: PERMISSIONS.WALLETS_VIEW, label: "View wallets" },
      { value: PERMISSIONS.WALLETS_ADJUST, label: "Adjust balances" },
    ],
  },
  {
    module: "services",
    label: "Services",
    description: "Digital service catalog and category configuration.",
    permissions: [
      { value: PERMISSIONS.SERVICES_VIEW, label: "View services" },
      { value: PERMISSIONS.SERVICES_MANAGE, label: "Manage services" },
    ],
  },
  {
    module: "data_plans",
    label: "Data plans",
    description: "Network data plan catalog.",
    permissions: [
      { value: PERMISSIONS.DATA_PLANS_VIEW, label: "View data plans" },
      { value: PERMISSIONS.DATA_PLANS_MANAGE, label: "Manage data plans" },
    ],
  },
  {
    module: "providers",
    label: "Providers",
    description: "Provider configuration and health.",
    permissions: [
      { value: PERMISSIONS.PROVIDERS_VIEW, label: "View providers" },
      { value: PERMISSIONS.PROVIDERS_MANAGE, label: "Manage providers" },
    ],
  },
  {
    module: "pricing",
    label: "Pricing",
    description: "Pricing rules across services.",
    permissions: [
      { value: PERMISSIONS.PRICING_VIEW, label: "View pricing" },
      { value: PERMISSIONS.PRICING_MANAGE, label: "Manage pricing" },
    ],
  },
  {
    module: "commissions",
    label: "Commissions",
    description: "Reseller commissions and payouts.",
    permissions: [
      { value: PERMISSIONS.COMMISSIONS_VIEW, label: "View commissions" },
      { value: PERMISSIONS.COMMISSIONS_MANAGE, label: "Manage commissions" },
    ],
  },
  {
    module: "storefronts",
    label: "Storefronts",
    description: "Ecommerce storefronts and templates.",
    permissions: [
      { value: PERMISSIONS.STOREFRONTS_VIEW, label: "View storefronts" },
      { value: PERMISSIONS.STOREFRONTS_MANAGE, label: "Manage storefronts" },
    ],
  },
  {
    module: "support",
    label: "Support",
    description: "Ticket inbox and responses.",
    permissions: [
      { value: PERMISSIONS.SUPPORT_VIEW, label: "View tickets" },
      { value: PERMISSIONS.SUPPORT_MANAGE, label: "Manage tickets" },
    ],
  },
  {
    module: "notifications",
    label: "Notifications",
    description: "Platform-wide notification composition.",
    permissions: [
      { value: PERMISSIONS.NOTIFICATIONS_VIEW, label: "View notifications" },
      {
        value: PERMISSIONS.NOTIFICATIONS_MANAGE,
        label: "Compose and send",
      },
    ],
  },
  {
    module: "analytics",
    label: "Analytics",
    description: "Cross-platform metrics.",
    permissions: [
      { value: PERMISSIONS.ANALYTICS_VIEW, label: "View analytics" },
      { value: PERMISSIONS.ANALYTICS_EXPORT, label: "Export analytics" },
    ],
  },
  {
    module: "reports",
    label: "Reports",
    description: "Operational reports.",
    permissions: [
      { value: PERMISSIONS.REPORTS_VIEW, label: "View reports" },
      { value: PERMISSIONS.REPORTS_EXPORT, label: "Generate reports" },
    ],
  },
  {
    module: "security",
    label: "Security",
    description: "Security center and IP management.",
    permissions: [
      { value: PERMISSIONS.SECURITY_VIEW, label: "View security" },
      { value: PERMISSIONS.SECURITY_MANAGE, label: "Manage security" },
    ],
  },
  {
    module: "audit_logs",
    label: "Audit logs",
    description: "Immutable record of admin actions.",
    permissions: [
      { value: PERMISSIONS.AUDIT_LOGS_VIEW, label: "View audit logs" },
      { value: PERMISSIONS.AUDIT_LOGS_EXPORT, label: "Export audit logs" },
    ],
  },
  {
    module: "admin_users",
    label: "Admin users",
    description: "Staff directory and access control.",
    permissions: [
      { value: PERMISSIONS.ADMIN_USERS_VIEW, label: "View admins" },
      { value: PERMISSIONS.ADMIN_USERS_MANAGE, label: "Manage admins" },
    ],
  },
  {
    module: "settings",
    label: "Settings",
    description: "Platform configuration.",
    permissions: [
      { value: PERMISSIONS.SETTINGS_VIEW, label: "View settings" },
      { value: PERMISSIONS.SETTINGS_MANAGE, label: "Manage settings" },
    ],
  },
  {
    module: "global",
    label: "Global actions",
    description: "Cross-cutting actions that apply everywhere.",
    permissions: [
      { value: PERMISSIONS.EXPORT, label: "Run exports" },
      { value: PERMISSIONS.RESET_SECURITY, label: "Reset credentials" },
    ],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_MODULES.flatMap(
  (group) => group.permissions.map((p) => p.value)
);

export function permissionLabel(permission: Permission): string {
  for (const group of PERMISSION_MODULES) {
    const found = group.permissions.find((p) => p.value === permission);
    if (found) return found.label;
  }
  return permission;
}

export function moduleForPermission(permission: Permission): string {
  for (const group of PERMISSION_MODULES) {
    if (group.permissions.some((p) => p.value === permission)) {
      return group.module;
    }
  }
  return "other";
}