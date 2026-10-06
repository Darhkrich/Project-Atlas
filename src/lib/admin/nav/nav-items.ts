// lib/admin/nav/nav-items.ts
//
// Sidebar navigation structure. Item permissions are typed against the
// RBAC Permission union so a typo becomes a compile error. Extracted
// from admin-sidebar.tsx so the data is importable by other consumers.

import type { AtlasIconName } from "@/components/atlas/icons";
import { PERMISSIONS, type Permission } from "@/lib/admin/rbac/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: AtlasIconName;
  badge?: string | number;
  permission?: Permission;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

export const navGroups: NavGroup[] = [
  {
    label: "Main",
    collapsible: false,
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: "orders",
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        label: "Transactions",
        href: "/admin/transactions",
        icon: "transactions",
        permission: PERMISSIONS.TRANSACTIONS_VIEW,
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: "credit-card",
        permission: PERMISSIONS.PAYMENTS_VIEW,
      },
      {
        label: "Refunds",
        href: "/admin/refunds",
        icon: "receipt",
        permission: PERMISSIONS.REFUNDS_VIEW,
      },
      {
        label: "Domains",
        href: "/admin/domains",
        icon: "globe",
        permission: PERMISSIONS.DOMAINS_VIEW,
      },
    ],
  },
  {
    label: "Users",
    items: [
      {
        label: "Customers",
        href: "/admin/customers",
        icon: "user",
        permission: PERMISSIONS.CUSTOMERS_VIEW,
      },
      {
        label: "Reseller Accounts",
        href: "/admin/resellers",
        icon: "users",
        permission: PERMISSIONS.RESELLERS_VIEW,
      },
      {
        label: "Merchant Accounts",
        href: "/admin/ecommerce/merchants",
        icon: "briefcase",
        permission: PERMISSIONS.MERCHANTS_VIEW,
      },
      {
        label: "Reported Accounts",
        href: "/admin/reported-accounts",
        icon: "alert",
        permission: PERMISSIONS.CUSTOMERS_VIEW,
      },
      {
        label: "Admin Users",
        href: "/admin/admin-users",
        icon: "shield",
        permission: PERMISSIONS.ADMIN_USERS_VIEW,
      },
      {
        label: "Reseller Storefront Users",
        href: "/admin/resellers/storefront-users",
        icon: "users",
        permission: PERMISSIONS.STOREFRONT_USERS_VIEW,
      },
      {
        label: "Merchant Storefront Users",
        href: "/admin/ecommerce/storefront-users",
        icon: "users",
        permission: PERMISSIONS.STOREFRONT_USERS_VIEW,
      },
    ],
  },
  {
    label: "Resellers",
    items: [
      {
        label: "Reseller Dashboard",
        href: "/admin/resellers/dashboard",
        icon: "sales",
        permission: PERMISSIONS.RESELLERS_VIEW,
      },
      {
        label: "Commission Wallets",
        href: "/admin/resellers/commission-wallets",
        icon: "wallet",
        permission: PERMISSIONS.COMMISSIONS_VIEW,
      },
      {
        label: "Analytics",
        href: "/admin/resellers/analytics",
        icon: "bar-chart",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        label: "Tiers",
        href: "/admin/resellers/tiers",
        icon: "star",
        permission: PERMISSIONS.RESELLERS_TIER,
      },
      {
        label: "Verification Queue",
        href: "/admin/resellers/verification-queue",
        icon: "shield",
        permission: PERMISSIONS.RESELLERS_VERIFY,
      },
      {
        label: "Support Tickets",
        href: "/admin/resellers/support-tickets",
        icon: "support",
        permission: PERMISSIONS.SUPPORT_VIEW,
      },
      {
        label: "Promotions",
        href: "/admin/resellers/promotions",
        icon: "gift",
        permission: PERMISSIONS.RESELLERS_PROMOTIONS_MANAGE,
      },
      {
        label: "Storefronts",
        href: "/admin/resellers/storefronts",
        icon: "store",
        permission: PERMISSIONS.RESELLERS_STOREFRONT_TOGGLE,
      },
    ],
  },
  {
    label: "E-commerce",
    items: [
      {
        label: "E-commerce Dashboard",
        href: "/admin/ecommerce/dashboard",
        icon: "sales",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        label: "Subscriptions",
        href: "/admin/ecommerce/subscriptions",
        icon: "repeat",
        permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
      },
      {
        label: "Templates",
        href: "/admin/ecommerce/templates",
        icon: "file-text",
        permission: PERMISSIONS.TEMPLATES_VIEW,
      },
      {
        label: "Payments",
        href: "/admin/ecommerce/payments",
        icon: "credit-card",
        permission: PERMISSIONS.ECOMMERCE_PAYMENTS_VIEW,
      },
      {
        label: "Support",
        href: "/admin/ecommerce/support",
        icon: "support",
        permission: PERMISSIONS.SUPPORT_VIEW,
      },
      {
        label: "Analytics",
        href: "/admin/ecommerce/analytics",
        icon: "bar-chart",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    label: "Financial",
    items: [
      {
        label: "Treasury",
        href: "/admin/treasury",
        icon: "wallet",
        permission: PERMISSIONS.TREASURY_VIEW,
      },
      {
        label: "Wallets",
        href: "/admin/wallets",
        icon: "wallet",
        permission: PERMISSIONS.WALLETS_VIEW,
      },
      {
        label: "Revenue",
        href: "/admin/revenue",
        icon: "trending-up",
        permission: PERMISSIONS.REVENUE_VIEW,
      },
      {
        label: "Commissions",
        href: "/admin/commissions",
        icon: "percent",
        permission: PERMISSIONS.COMMISSIONS_VIEW,
      },
      {
        label: "Pricing",
        href: "/admin/pricing",
        icon: "price",
        permission: PERMISSIONS.PRICING_VIEW,
      },
      {
        label: "Promotions",
        href: "/admin/promotions",
        icon: "gift",
        permission: PERMISSIONS.PROMOTIONS_VIEW,
      },
    ],
  },
  {
    label: "Services",
    items: [
      {
        label: "Services",
        href: "/admin/services",
        icon: "grid",
        permission: PERMISSIONS.SERVICES_VIEW,
      },
      {
        label: "Data Plans",
        href: "/admin/data-plans",
        icon: "wifi",
        permission: PERMISSIONS.DATA_PLANS_VIEW,
      },
      {
        label: "Providers",
        href: "/admin/providers",
        icon: "server",
        permission: PERMISSIONS.PROVIDERS_VIEW,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Storefronts",
        href: "/admin/storefronts",
        icon: "store",
        permission: PERMISSIONS.STOREFRONTS_VIEW,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Support",
        href: "/admin/support",
        icon: "support",
        permission: PERMISSIONS.SUPPORT_VIEW,
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: "bell",
        permission: PERMISSIONS.NOTIFICATIONS_VIEW,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: "bar-chart",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: "file-text",
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    label: "Security",
    items: [
      {
        label: "Security Center",
        href: "/admin/security",
        icon: "lock",
        permission: PERMISSIONS.SECURITY_VIEW,
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: "list",
        permission: PERMISSIONS.AUDIT_LOGS_VIEW,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];