import { MAX_SLUG_LENGTH, MIN_SLUG_LENGTH } from "./constants";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "billing",
  "dashboard",
  "login",
  "onboarding",
  "orders",
  "products",
  "settings",
  "storefront",
  "support",
  "wallet",
  "welcome",
]);

export function deriveSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export type SlugValidationReason = "empty" | "reserved" | "too-short";

export interface SlugValidation {
  ok: boolean;
  reason?: SlugValidationReason;
}

export function validateSlug(slug: string): SlugValidation {
  if (!slug) return { ok: false, reason: "empty" };
  if (slug.length < MIN_SLUG_LENGTH) return { ok: false, reason: "too-short" };
  if (isReservedSlug(slug)) return { ok: false, reason: "reserved" };
  return { ok: true };
}

export function storefrontUrl(slug: string): string {
  const safe = slug || "your-store";
  return "https://" + safe + ".atlas.com";
}