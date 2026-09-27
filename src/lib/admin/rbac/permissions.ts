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
  RESELLERS_WALLET_CONFIG: "resellers:wallet_config",
  RESELLERS_WITHDRAWALS_APPROVE: "resellers:withdrawals_approve",
  RESELLERS_TIER: "resellers:tier",
  RESELLERS_STOREFRONT_TOGGLE: "resellers:storefront_toggle",
  RESELLERS_NOTIFY: "resellers:notify",
  RESELLERS_PROMOTIONS_MANAGE: "resellers:promotions_manage",
  
  
  REVENUE_VIEW: "revenue:view",
  REVENUE_EXPORT: "revenue:export",



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

  REFUNDS_VIEW: "refunds:view",
  REFUNDS_APPROVE: "refunds:approve",
  REFUNDS_REJECT: "refunds:reject",
  REFUNDS_PROCESS: "refunds:process",

  DOMAINS_VIEW: "domains:view",
  DOMAINS_MANAGE: "domains:manage",
  WALLETS_VIEW: "wallets:view",
  WALLETS_ADJUST: "wallets:adjust",
  WALLETS_WITHDRAWALS_APPROVE: "wallets:withdrawals_approve",
  WALLETS_CONFIG: "wallets:config",

  TREASURY_VIEW: "treasury:view",
  TREASURY_MANAGE: "treasury:manage",
  TREASURY_APPROVE: "treasury:approve",
  TREASURY_FUND: "treasury:fund",
  TREASURY_CONFIG: "treasury:config",
  TREASURY_PROVIDER_PAYOUT: "treasury:provider_payout",
  TREASURY_PROVIDER_PAYOUT_APPROVE: "treasury:provider_payout_approve",

  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_REFUND: "payments:refund",
  PAYMENTS_EXPORT: "payments:export",
  PAYMENTS_WITHDRAWALS_APPROVE: "payments:withdrawals_approve",
  PAYMENTS_CONFIG: "payments:config",
  PAYMENTS_RECONCILE: "payments:reconcile",
  PAYMENTS_FLAG: "payments:flag",

  ECOMMERCE_PAYMENTS_VIEW: "ecommerce_payments:view",

  SERVICES_VIEW: "services:view",
  SERVICES_MANAGE: "services:manage",

  DATA_PLANS_VIEW: "data_plans:view",
  DATA_PLANS_MANAGE: "data_plans:manage",

  PROVIDERS_VIEW: "providers:view",
  PROVIDERS_MANAGE: "providers:manage",

  PROMOTIONS_VIEW: "promotions:view",
  PROMOTIONS_MANAGE: "promotions:manage",


  SUBSCRIPTIONS_VIEW: "subscriptions:view",
  SUBSCRIPTIONS_MANAGE: "subscriptions:manage",


  PRICING_VIEW: "pricing:view",
  PRICING_MANAGE: "pricing:manage",

  COMMISSIONS_VIEW: "commissions:view",
  COMMISSIONS_MANAGE: "commissions:manage",

  TEMPLATES_VIEW: "templates:view",
  TEMPLATES_MANAGE: "templates:manage",

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
      {
        value: PERMISSIONS.RESELLERS_WALLET_CONFIG,
        label: "Configure withdrawal threshold",
      },
      {
        value: PERMISSIONS.RESELLERS_WITHDRAWALS_APPROVE,
        label: "Approve or reject withdrawals",
      },
      { value: PERMISSIONS.RESELLERS_TIER, label: "Change tier" },
      {
        value: PERMISSIONS.RESELLERS_STOREFRONT_TOGGLE,
        label: "Toggle storefront",
      },
      { value: PERMISSIONS.RESELLERS_NOTIFY, label: "Send notifications" },
      {
        value: PERMISSIONS.RESELLERS_PROMOTIONS_MANAGE,
        label: "Manage reseller promotions",
      },
    ],
  },


  {
    module: "revenue",
    label: "Revenue",
    description: "Platform flows and financial health across all streams.",
    permissions: [
      { value: PERMISSIONS.REVENUE_VIEW, label: "View revenue" },
      { value: PERMISSIONS.REVENUE_EXPORT, label: "Export revenue" },
    ],
  },

 {
    module: "payments",
    label: "Payments",
    description: "Payment gateway activity.",
    permissions: [
      { value: PERMISSIONS.PAYMENTS_VIEW, label: "View payments" },
      {
        value: PERMISSIONS.PAYMENTS_REFUND,
        label: "Refund customer wallet payments (non-ecommerce)",
      },
      { value: PERMISSIONS.PAYMENTS_EXPORT, label: "Export payments" },
      {
        value: PERMISSIONS.PAYMENTS_WITHDRAWALS_APPROVE,
        label: "Approve or reject merchant withdrawals",
      },
      {
        value: PERMISSIONS.PAYMENTS_CONFIG,
        label: "Configure withdrawal auto-approve rules",
      },
      {
        value: PERMISSIONS.PAYMENTS_RECONCILE,
        label: "Reconcile payment records with providers",
      },
      {
        value: PERMISSIONS.PAYMENTS_FLAG,
        label: "Flag payment records for review",
      },
    ],
  },
  {
    module: "ecommerce_payments",
    label: "Ecommerce payments",
    description:
      "Merchant money flows: plan billing, storefront sales, refunds, withdrawals.",
    permissions: [
      {
        value: PERMISSIONS.ECOMMERCE_PAYMENTS_VIEW,
        label: "View ecommerce payments",
      },
    ],
  },

{
    module: "subscriptions",
    label: "Subscriptions",
    description: "Merchant subscription plans, billing, and lifecycle.",
    permissions: [
      { value: PERMISSIONS.SUBSCRIPTIONS_VIEW, label: "View subscriptions" },
      { value: PERMISSIONS.SUBSCRIPTIONS_MANAGE, label: "Manage subscriptions" },
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
    module: "templates",
    label: "Templates",
    description: "Ecommerce storefront templates and plan assignments.",
    permissions: [
      { value: PERMISSIONS.TEMPLATES_VIEW, label: "View templates" },
      { value: PERMISSIONS.TEMPLATES_MANAGE, label: "Manage templates" },
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
    module: "domains",
    label: "Domains",
    description: "Storefront subdomains and custom domain verification.",
    permissions: [
      { value: PERMISSIONS.DOMAINS_VIEW, label: "View domains" },
      { value: PERMISSIONS.DOMAINS_MANAGE, label: "Manage domains" },
    ],
  },
{
    module: "wallets",
    label: "Wallets",
    description:
      "Atlas customer and reseller storefront user wallets, funding, and withdrawal approvals.",
    permissions: [
      { value: PERMISSIONS.WALLETS_VIEW, label: "View wallets" },
      { value: PERMISSIONS.WALLETS_ADJUST, label: "Adjust balances" },
      {
        value: PERMISSIONS.WALLETS_WITHDRAWALS_APPROVE,
        label: "Approve or reject wallet withdrawals",
      },
      {
        value: PERMISSIONS.WALLETS_CONFIG,
        label: "Configure wallet withdrawal rules",
      },
      { value: PERMISSIONS.TREASURY_PROVIDER_PAYOUT, label: "Create provider payout batches" },
      { value: PERMISSIONS.TREASURY_PROVIDER_PAYOUT_APPROVE, label: "Approve provider payout batches" },
    ],
  },

{
    module: "treasury",
    label: "Treasury",
    description:
      "Platform cash account. Inflows, outflows, liability coverage, and reconciliation.",
    permissions: [
      { value: PERMISSIONS.TREASURY_VIEW, label: "View treasury" },
      { value: PERMISSIONS.TREASURY_MANAGE, label: "Create adjustments and settle outbound" },
      { value: PERMISSIONS.TREASURY_APPROVE, label: "Approve outbound as second admin" },
      { value: PERMISSIONS.TREASURY_FUND, label: "Fund treasury" },
      { value: PERMISSIONS.TREASURY_CONFIG, label: "Configure thresholds and reserve floor" },
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
    module: "promotions",
    label: "Promotions",
    description: "Cross-audience discount, cashback, and points campaigns.",
    permissions: [
      { value: PERMISSIONS.PROMOTIONS_VIEW, label: "View promotions" },
      { value: PERMISSIONS.PROMOTIONS_MANAGE, label: "Manage promotions" },
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