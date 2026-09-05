import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantNavItem = {
  label: string;
  href: string;
  icon: AtlasIconName;
  group: "overview" | "business" | "store" | "billing" | "support";
};

export const merchantNavItems: MerchantNavItem[] = [
  // Overview
  {
    label: "Dashboard",
    href: "/merchant/dashboard",
    icon: "dashboard",
    group: "overview",
  },
  {
    label: "Notifications",
    href: "/merchant/notifications",
    icon: "bell",
    group: "overview",
  },
  // Business
  {
    label: "Products",
    href: "/merchant/products",
    icon: "package",
    group: "business",
  },
  {
    label: "Orders",
    href: "/merchant/orders",
    icon: "orders",
    group: "business",
  },
  {
    label: "Customers",
    href: "/merchant/customers",
    icon: "users",
    group: "business",
  },
  {
    label: "Analytics",
    href: "/merchant/analytics",
    icon: "bar-chart",
    group: "business",
  },
  // Store
  {
    label: "Storefront",
    href: "/merchant/storefront",
    icon: "store",
    group: "store",
  },
  // Billing & Payments
  {
    label: "Wallet",
    href: "/merchant/wallet",
    icon: "wallet",
    group: "billing",
  },
  {
    label: "Billing",
    href: "/merchant/billing",
    icon: "billing",
    group: "billing",
  },
  {
    label: "Transactions",
    href: "/merchant/transactions",
    icon: "receipt",
    group: "billing",
  },
  // Support & Settings
  {
    label: "Settings",
    href: "/merchant/settings",
    icon: "settings",
    group: "support",
  },
  {
    label: "Support",
    href: "/merchant/support",
    icon: "support",
    group: "support",
  },
];