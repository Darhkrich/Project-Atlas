// lib/domains/subscriptions/constants.ts

import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

export type StorefrontPaymentMethod = "momo" | "card" | "bank" | "wallet";
export type StorefrontTheme = MerchantStorefrontTheme;

export const ALL_PAYMENT_METHODS: StorefrontPaymentMethod[] = [
  "momo",
  "card",
  "bank",
  "wallet",
];

export const ALL_THEMES: StorefrontTheme[] = [
  "airy",
  "editorial",
  "studio",
  "statement",
];

// Plan code rules. Lowercase, starts with a letter, dash allowed,
// 3 to 32 chars. Reserved words cannot be used.
export const PLAN_CODE_REGEX = /^[a-z][a-z0-9-]{2,31}$/;

export const RESERVED_PLAN_CODES = new Set([
  "all",
  "none",
  "custom",
  "any",
  "default",
  "new",
]);

export const MIN_PLAN_NAME_LENGTH = 2;
export const MAX_PLAN_NAME_LENGTH = 40;
export const MAX_PLAN_DESCRIPTION_LENGTH = 160;
export const MAX_CUSTOM_PRICE_GHS = 1_000_000;

export const DEFAULT_VISIBILITY: "public" | "hidden" | "legacy" = "public";