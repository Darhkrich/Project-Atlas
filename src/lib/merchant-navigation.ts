import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantNavItem = {
  label: string;
  href: string;
  icon: AtlasIconName;
  group: "overview" | "business" | "store" | "billing" | "support";
};

export const merchantNavItems: MerchantNavItem[] = [
  {
    label: "Dashboard",
    href: "/merchant/dashboard",
    icon: "grid",
    group: "overview",
  },
  {
    label: "Products",
    href: "/merchant/products",
    icon: "briefcase",
    group: "business",
  },
  {
    label: "Orders",
    href: "/merchant/orders",
    icon: "briefcase",
    group: "business",
  },
  {
    label: "Customers",
    href: "/merchant/customers",
    icon: "users",
    group: "business",
  },
  {
    label: "Storefront",
    href: "/merchant/storefront",
    icon: "store",
    group: "store",
  },
  {
    label: "Billing",
    href: "/merchant/billing",
    icon: "wallet",
    group: "billing",
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
    icon: "headphones",
    group: "support",
  },
];