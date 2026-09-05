import type { AtlasIconName } from "@/components/atlas/icons";

export type ResellerNavItem = {
  label: string;
  href: string;
  group: "overview" | "business" | "store" | "wallet" | "support";
  exact?: boolean;
  mobilePrimary?: boolean;
  icon: AtlasIconName;
};

export const resellerNavItems: ResellerNavItem[] = [
  {
    label: "Overview",
    href: "/reseller/dashboard",
    group: "overview",
    exact: true,
    mobilePrimary: true,
    icon: "home",
  },
  {
    label: "Analytics",
    href: "/reseller/analytics",
    group: "business",
    exact: false,
    mobilePrimary: false,
    icon: "trending-up",  
  },
  {
    label: "Orders",
    href: "/reseller/orders",
    group: "business",
    exact: false,
    mobilePrimary: false,
    icon: "receipt",
  },
  {
    label: "Customers",
    href: "/reseller/customers",
    group: "business",
    exact: false,
    mobilePrimary: false,
    icon: "users",
  },
  {
    label: "My Storefront",
    href: "/reseller/storefront",
    group: "store",
    exact: true,
    mobilePrimary: true,
    icon: "store",
  },
  {
    label: "Services & Products",
    href: "/reseller/services",
    group: "store",
    exact: false,
    mobilePrimary: true,
    icon: "grid",
  },

 
  {
    label: "Balance",
    href: "/reseller/wallet",
    group: "wallet",
    exact: true,
    mobilePrimary: false,
    icon: "wallet",
  },
 
  {
    label: "Transactions",
    href: "/reseller/transactions",
    group: "wallet",
    exact: false,
    mobilePrimary: false,
    icon: "repeat",
  },
  {
    label: "Notifications",
    href: "/reseller/notifications",
    group: "support",
    exact: false,
    mobilePrimary: false,
    icon: "bell",
  },
  {
    label: "Support",
    href: "/reseller/support",
    group: "support",
    exact: false,
    mobilePrimary: false,
    icon: "help-circle",
  },
  {
    label: "Settings",
    href: "/reseller/settings",
    group: "support",
    exact: false,
    mobilePrimary: false,
    icon: "settings",
  },
  {
    label: "Logout",
    href: "/login",
    group: "support",
    exact: false,
    mobilePrimary: false,
    icon: "x-circle",
  },
];