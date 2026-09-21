import type { PlanCode } from "@/config/subscription-plans";
import type { TemplateCategory } from "@/lib/admin/types/ecommerce-template";

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

export const PLAN_CODE_LABEL: Record<PlanCode, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const PLAN_CODE_VARIANT: Record<PlanCode, BadgeVariant> = {
  starter: "neutral",
  growth: "info",
  pro: "brand",
  enterprise: "success",
};

export const ALL_PLAN_CODES: PlanCode[] = [
  "starter",
  "growth",
  "pro",
  "enterprise",
];

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