export const routes = {
  // Customers
  customers: "/admin/customers",
  customerDetail: (id: string) => "/admin/customers/" + id,

  // Resellers
  resellers: "/admin/resellers",
  resellerDetail: (id: string) => "/admin/resellers/" + id,
  resellerStorefronts: "/admin/resellers/storefronts",
  resellerStorefrontDetail: (id: string) => "/admin/resellers/storefronts/" + id,
  resellerStorefrontUsers: "/admin/resellers/storefront-users",

  // Merchants
  merchants: "/admin/ecommerce/merchants",
  merchantDetail: (id: string) => "/admin/ecommerce/merchants/" + id,
  merchantStorefronts: "/admin/ecommerce/storefronts",
  merchantStorefrontDetail: (id: string) => "/admin/ecommerce/storefronts/" + id,
  merchantStorefrontUsers: "/admin/ecommerce/storefront-users",

  // Other sections
  orders: "/admin/orders",
  orderDetail: (id: string) => "/admin/orders?order=" + encodeURIComponent(id),
  transactions: "/admin/transactions",
  transactionDetail: (id: string) =>
    "/admin/transactions?txn=" + encodeURIComponent(id),
  orderRefunds: "/admin/refunds",
  orderRefundDetail: (id: string) =>
    "/admin/refunds?refund=" + encodeURIComponent(id),
  products: "/admin/products",
  support: "/admin/support",
  services: "/admin/services",

  treasury: "/admin/treasury",
  treasuryDetail: (id: string) =>
    "/admin/treasury?event=" + encodeURIComponent(id),

  // Wallets
  wallets: "/admin/wallets",
  walletDetail: (id: string) => "/admin/wallets/" + id,

  // Notifications
  notifications: "/admin/notifications",

  // Payments
  payments: "/admin/payments",

  // Revenue
  revenue: "/admin/revenue",

  // Analytics
  analytics: "/admin/analytics",

  // Audit logs
  auditLogs: "/admin/audit-logs",

  // Security
  security: "/admin/security",

  // Providers
  providers: "/admin/providers",
  providerDetail: (id: string) => "/admin/providers/" + id,

  // Ecommerce support
  ecommerceSupport: "/admin/ecommerce/support",

  // Admin users
  adminUsers: "/admin/admin-users",

  // Settings
  settings: "/admin/settings",
} as const;