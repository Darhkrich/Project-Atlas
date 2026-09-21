import type { PlanCode } from "@/config/subscription-plans";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const PLAN_CODE_LABEL: Record<PlanCode, string> = {
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

export const PLAN_PIE_COLORS: Record<PlanCode, string> = {
  starter: "#94a3b8",
  growth: "#3b82f6",
  pro: "#166e59",
  enterprise: "#a16207",
};