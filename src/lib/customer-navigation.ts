export type CustomerNavItem = {
  label: string;
  href: string;
  section: "primary" | "secondary";
  exact?: boolean;
  mobilePrimary?: boolean;
  icon: string; // key for NavIcon mapping
};

export const customerNavItems: CustomerNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    section: "primary",
    exact: true,
    mobilePrimary: true,
    icon: "dashboard",
  },
  {
    label: "Services",
    href: "/services",
    section: "primary",
    exact: false,
    mobilePrimary: true,
    icon: "services",
  },
  {
    label: "Orders",
    href: "/orders",
    section: "primary",
    exact: false,
    mobilePrimary: true,
    icon: "orders",
  },
  {
    label: "Wallet",
    href: "/wallet",
    section: "primary",
    exact: true,
    mobilePrimary: true,
    icon: "wallet",
  },
  {
    label: "Transactions",
    href: "/transactions",
    section: "primary",
    exact: false,
    // Not in bottom bar; accessible from More menu.
    icon: "transactions",
  },
  {
    label: "Notifications",
    href: "/notifications",
    section: "secondary",
    exact: true,
    icon: "notifications",
  },
  {
    label: "Support",
    href: "/support",
    section: "secondary",
    exact: false,
    icon: "support",
  },
  {
    label: "Settings",
    href: "/settings",
    section: "secondary",
    exact: false,
    icon: "settings",
  },
];