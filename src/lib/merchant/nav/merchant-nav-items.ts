import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantNavItem = {
  label: string;
  href: string;
  icon: AtlasIconName;
  group: "overview" | "business" | "store" | "billing" | "support";
};

export const MERCHANT_NAV_GROUP_ORDER: MerchantNavItem["group"][] = [
  "overview",
  "business",
  "store",
  "billing",
  "support",
];

export const MERCHANT_NAV_GROUP_LABELS: Record<
  MerchantNavItem["group"],
  string
> = {
  overview: "Overview",
  business: "Business",
  store: "Store",
  billing: "Billing",
  support: "Support",
};

export const merchantNavItems: MerchantNavItem[] = [
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
    label: "Discounts",
    href: "/merchant/discounts",
    icon: "tag",
    group: "business",
  },
  {
    label: "Emails",
    href: "/merchant/emails",
    icon: "mail",
    group: "business",
  },
  {
    label: "Run promo",
    href: "/merchant/promos",
    icon: "star",
    group: "business",
  },
  {
    label: "Analytics",
    href: "/merchant/analytics",
    icon: "bar-chart",
    group: "business",
  },
  {
    label: "Storefront",
    href: "/merchant/storefront",
    icon: "store",
    group: "store",
  },
  {
    label: "Pages",
    href: "/merchant/pages",
    icon: "file-text",
    group: "store",
  },
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
    icon: "transactions",
    group: "billing",
  },
  {
    label: "Team",
    href: "/merchant/team",
    icon: "users",
    group: "support",
  },
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