// Slugs the platform reserves. A merchant cannot claim these.
export const RESERVED_SLUGS: string[] = [
  "admin",
  "api",
  "app",
  "billing",
  "dashboard",
  "login",
  "logout",
  "onboarding",
  "orders",
  "preview",
  "products",
  "settings",
  "storefront",
  "support",
  "wallet",
  "welcome",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}