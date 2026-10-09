import type { MenuItem } from "@/types/merchant-storefront";

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { label: "Home", href: "/", order: 0, visible: true },
  { label: "Products", href: "/products", order: 1, visible: true },
  { label: "About", href: "/about", order: 2, visible: true },
  { label: "Contact", href: "/contact", order: 3, visible: true },
];

export const MAX_MENU_ITEMS = 6;
export const MENU_LABEL_MAX = 20;
export const MENU_HREF_MAX = 120;

// Layout consumes only visible items, in order. When nothing is set, the
// default menu is served so a fresh store has working navigation.
export function menuForRender(raw: MenuItem[] | undefined): MenuItem[] {
  if (!raw || raw.length === 0) return DEFAULT_MENU_ITEMS;
  const visible = raw.filter((m) => m.visible !== false);
  if (visible.length === 0) return DEFAULT_MENU_ITEMS;
  return visible.slice().sort((a, b) => a.order - b.order);
}

// Editor shows every item including hidden ones, sorted by order.
export function menuForEditor(raw: MenuItem[] | undefined): MenuItem[] {
  if (!raw || raw.length === 0) return DEFAULT_MENU_ITEMS;
  return raw.slice().sort((a, b) => a.order - b.order);
}

// Resolves the merchant-typed href into a storefront URL.
// Absolute http(s) hrefs pass through unchanged. Relative hrefs are
// prefixed with the store slug.
export function resolveMenuHref(href: string, slug: string): string {
  const trimmed = href.trim();
  if (trimmed.length === 0) return "/ecommerce-stores/" + slug;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed === "/") return "/ecommerce-stores/" + slug;
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
  return "/ecommerce-stores/" + slug + withLeadingSlash;
}