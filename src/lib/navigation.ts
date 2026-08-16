export type AtlasNavItem = {
  label: string;
  href: string;
  exact?: boolean;
  external?: boolean;
};

export const publicNavItems: AtlasNavItem[] = [
  {
    label: "Services",
    href: "/services",
    // Matches /services and any service sub-route
    exact: false,
  },
  {
    label: "How It Works",
    href: "/how-it-works",
    exact: true,
  },
  {
    label: "About",
    href: "/about",
    exact: true,
  },
];