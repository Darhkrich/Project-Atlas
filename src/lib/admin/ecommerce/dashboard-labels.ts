type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

// Subscription plan codes are runtime strings. These maps lose key
// exhaustiveness by design. Read via planCodeLabelFor / planPieColorFor
// so a new plan without a hardcoded entry falls back cleanly.

export const PLAN_CODE_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
  enterprise: "Enterprise",
};

export type ActivityKind = "activity" | "admin" | "order";

export const ACTIVITY_KIND_LABEL: Record<ActivityKind, string> = {
  activity: "Merchant",
  admin: "Admin",
  order: "Order",
};

export const ACTIVITY_KIND_VARIANT: Record<ActivityKind, BadgeVariant> = {
  activity: "info",
  admin: "neutral",
  order: "success",
};

export const PLAN_PIE_COLORS: Record<string, string> = {
  starter: "#94a3b8",
  growth: "#3b82f6",
  pro: "#166e59",
  enterprise: "#a16207",
};

const FALLBACK_PIE_COLOR = "#94a3b8";

export function planCodeLabelFor(code: string): string {
  return PLAN_CODE_LABEL[code] ?? code;
}

export function planPieColorFor(code: string): string {
  return PLAN_PIE_COLORS[code] ?? FALLBACK_PIE_COLOR;
}