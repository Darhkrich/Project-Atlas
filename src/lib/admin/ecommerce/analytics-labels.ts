import type { PlanCode } from "@/config/subscription-plans";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export type SubscriptionHealthStatus =
  | "active"
  | "past_due"
  | "expired"
  | "cancelled";

export const SUBSCRIPTION_STATUS_LABEL: Record<
  SubscriptionHealthStatus,
  string
> = {
  active: "Active",
  past_due: "Past due",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const SUBSCRIPTION_STATUS_VARIANT: Record<
  SubscriptionHealthStatus,
  BadgeVariant
> = {
  active: "success",
  past_due: "warning",
  expired: "danger",
  cancelled: "neutral",
};

export const SUBSCRIPTION_STATUS_COLOR: Record<
  SubscriptionHealthStatus,
  string
> = {
  active: "#166e59",
  past_due: "#f59e0b",
  expired: "#ef4444",
  cancelled: "#94a3b8",
};

export const ALL_SUBSCRIPTION_STATUSES: SubscriptionHealthStatus[] = [
  "active",
  "past_due",
  "expired",
  "cancelled",
];

export type VerificationStatus = "verified" | "pending" | "not_submitted";

export const VERIFICATION_STATUS_LABEL: Record<
  VerificationStatus,
  string
> = {
  verified: "Verified",
  pending: "Pending",
  not_submitted: "Not submitted",
};

export const VERIFICATION_STATUS_VARIANT: Record<
  VerificationStatus,
  BadgeVariant
> = {
  verified: "success",
  pending: "warning",
  not_submitted: "neutral",
};

export type VelocityTrend = "accelerating" | "steady" | "decelerating" | "unknown";

export const VELOCITY_TREND_LABEL: Record<VelocityTrend, string> = {
  accelerating: "Accelerating",
  steady: "Steady",
  decelerating: "Decelerating",
  unknown: "Unknown",
};

export const VELOCITY_TREND_VARIANT: Record<VelocityTrend, BadgeVariant> = {
  accelerating: "success",
  steady: "neutral",
  decelerating: "warning",
  unknown: "neutral",
};

export const PLAN_PIE_COLORS: Record<string, string> = {
  starter: "#94a3b8",
  growth: "#3b82f6",
  pro: "#166e59",
  enterprise: "#a16207",
};

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCohortMonth(iso: string): string {
  const d = new Date(iso);
  return MONTH_LABELS[d.getUTCMonth()] + " " + d.getUTCFullYear();
}