export const DAY_MS = 86_400_000;

export const RECENT_ORDERS_LIMIT = 5;
export const TOP_SERVICES_LIMIT = 5;
export const FAILED_ORDERS_WINDOW_MS = DAY_MS;

export const ROUTES = {
  dashboard: "/reseller/dashboard",
  orders: "/reseller/orders",
  ordersFailed: "/reseller/orders?status=failed",
  wallet: "/reseller/wallet",
  storefront: "/reseller/storefront",
  services: "/reseller/services",
  settings: "/reseller/settings",
} as const;