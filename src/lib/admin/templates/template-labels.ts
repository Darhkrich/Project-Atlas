import type { TemplateCategory } from "@/lib/admin/types/ecommerce-template";
import { getPlans } from "@/lib/domains/subscriptions";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const TEMPLATE_CATEGORY_LABEL: Record<TemplateCategory, string> = {
  general: "General",
  beauty: "Beauty",
  fashion: "Fashion",
  electronics: "Electronics",
  home: "Home",
  food: "Food",
  sports: "Sports",
  health: "Health",
  garden: "Garden",
  accessories: "Accessories",
  other: "Other",
};

export const ALL_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "general",
  "beauty",
  "fashion",
  "electronics",
  "home",
  "food",
  "sports",
  "health",
  "garden",
  "accessories",
  "other",
];

// Subscription plan codes are runtime strings. These maps lose key
// exhaustiveness by design. Read via planCodeLabelFor / planCodeVariantFor
// so a new plan without a hardcoded entry falls back cleanly.

export const PLAN_CODE_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const PLAN_CODE_VARIANT: Record<string, BadgeVariant> = {
  starter: "neutral",
  growth: "info",
  pro: "brand",
  enterprise: "success",
};

export function planCodeLabelFor(code: string): string {
  return PLAN_CODE_LABEL[code] ?? code;
}

export function planCodeVariantFor(code: string): BadgeVariant {
  return PLAN_CODE_VARIANT[code] ?? "neutral";
}

/**
 * Live list of plan codes. Derived from the store. Replaces the earlier
 * hardcoded ALL_PLAN_CODES array, which did not update when plans were
 * created or deleted.
 */
export function getAllPlanCodes(): string[] {
  return getPlans().map((p) => p.code);
}

export const TEMPLATE_STATUS_LABEL = {
  active: "Active",
  inactive: "Inactive",
} as const;

export const TEMPLATE_STATUS_VARIANT: Record<
  "active" | "inactive",
  BadgeVariant
> = {
  active: "success",
  inactive: "neutral",
};

/**
 * Component names must match a PascalCase React export in the storefront
 * runtime. Free text with this shape is accepted; anything else is
 * rejected at the editor.
 */
export const COMPONENT_NAME_REGEX = /^[A-Z][A-Za-z0-9]*$/;