import type { AtlasIconName } from "@/components/atlas/icons";

export type CustomerNavItem = {
  label: string;
  href: string;
  section: "primary" | "secondary";
  exact?: boolean;
  mobilePrimary?: boolean;
  icon: AtlasIconName;
};

export const customerNavItems: CustomerNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    section: "primary",
    exact: true,
    mobilePrimary: true,
    icon: "home",
  },
  {
    label: "Services",
    href: "/customer/services",
    section: "primary",
    exact: false,
    mobilePrimary: true,
    icon: "briefcase",
  },
  {
    label: "Wallet",
    href: "/customer/wallet",
    section: "primary",
    exact: true,
    mobilePrimary: true,
    icon: "wallet",
  },
  {
    label: "Orders",
    href: "/customer/orders",
    section: "primary",
    exact: false,
    mobilePrimary: true,
    icon: "receipt",
  },
  {
    label: "Transactions",
    href: "/customer/transactions",
    section: "primary",
    exact: false,
    mobilePrimary: false,
    icon: "repeat",
  },
  {
    label: "Beneficiaries",
    href: "/customer/beneficiaries",
    section: "primary",
    exact: false,
    mobilePrimary: false,
    icon: "list",
  },
  {
    label: "Favorites",
    href: "/customer/favorites",
    section: "primary",
    exact: false,
    mobilePrimary: false,
    icon: "star",
  },
  {
    label: "Referrals",
    href: "/customer/referrals",
    section: "primary",
    exact: false,
    mobilePrimary: false,
    icon: "link",
  },
  {
    label: "Notifications",
    href: "/customer/notifications",
    section: "secondary",
    exact: true,
    mobilePrimary: false,
    icon: "bell",
  },
  {
    label: "Support",
    href: "/customer/support",
    section: "secondary",
    exact: false,
    mobilePrimary: false,
    icon: "help-circle",
  },
  {
    label: "Settings",
    href: "/customer/settings",
    section: "secondary",
    exact: false,
    mobilePrimary: false,
    icon: "settings",
  },
];