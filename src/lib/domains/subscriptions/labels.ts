// lib/domains/subscriptions/labels.ts

import type { PlanVisibility, SupportTier } from "./types";
import type {
  StorefrontPaymentMethod,
  StorefrontTheme,
} from "./constants";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const SUPPORT_TIER_LABEL: Record<SupportTier, string> = {
  email: "Email support",
  priority_email: "Priority email support",
  chat: "Chat and email support",
  dedicated: "Dedicated account manager",
};

export const SUPPORT_TIER_VARIANT: Record<SupportTier, BadgeVariant> = {
  email: "neutral",
  priority_email: "info",
  chat: "info",
  dedicated: "success",
};

export const PLAN_VISIBILITY_LABEL: Record<PlanVisibility, string> = {
  public: "Public",
  hidden: "Hidden",
  legacy: "Legacy",
};

export const PLAN_VISIBILITY_VARIANT: Record<PlanVisibility, BadgeVariant> = {
  public: "success",
  hidden: "neutral",
  legacy: "warning",
};

export const PLAN_VISIBILITY_HELP: Record<PlanVisibility, string> = {
  public: "Shows in the plan picker for new merchants.",
  hidden: "Hidden from the picker, still assignable from the admin.",
  legacy:
    "Existing merchants stay. New merchants cannot pick this plan.",
};

export const PAYMENT_METHOD_LABEL: Record<StorefrontPaymentMethod, string> = {
  momo: "Mobile Money",
  card: "Card",
  bank: "Bank Transfer",
  wallet: "Atlas Wallet",
};

// Theme labels live in lib/merchant/storefront/themes via themeLabel(id).
// This map is retained only for consumers that render a label from the
// union without importing the theme module. Values must match themeLabel.
export const THEME_LABEL: Record<StorefrontTheme, string> = {
  airy: "Airy",
  editorial: "Editorial",
  studio: "Studio",
  statement: "Statement",
};

export const DOMAIN_SUBDOMAIN_LABEL = "Atlas subdomain";
export const DOMAIN_SUBDOMAIN_HELP =
  "Merchant storefront lives at slug.atlas.store. Available on every plan.";

export const DOMAIN_CUSTOM_LABEL = "Custom domain";
export const DOMAIN_CUSTOM_HELP =
  "Merchant connects their own domain. Atlas verifies ownership and issues SSL.";

/**
 * Fallback label for plan codes without a hardcoded entry. New plans get
 * their name from the store; the code is only the fallback.
 */
export function planCodeLabel(code: string, name?: string): string {
  if (name && name.trim()) return name;
  return code
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}