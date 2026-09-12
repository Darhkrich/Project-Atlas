export const routes = {
  // Customers
  customers: "/admin/customers",
  customerDetail: (id: string) => `/admin/customers/${id}`,

  // Resellers
  resellers: "/admin/resellers",
  resellerDetail: (id: string) => `/admin/resellers/${id}`,
  resellerStorefronts: "/admin/resellers/storefronts",
  resellerStorefrontDetail: (id: string) => `/admin/resellers/storefronts/${id}`,
  resellerStorefrontUsers: "/admin/resellers/storefront-users",

  // Merchants
  merchants: "/admin/merchants",
  merchantDetail: (id: string) => `/admin/merchants/${id}`,
  merchantStorefronts: "/admin/ecommerce/storefronts",
  merchantStorefrontDetail: (id: string) => `/admin/ecommerce/storefronts/${id}`,
  merchantStorefrontUsers: "/admin/ecommerce/storefront-users",

  // Other sections
  orders: "/admin/orders",
  products: "/admin/products",
  support: "/admin/support",
  services: "/admin/services",
} as const;