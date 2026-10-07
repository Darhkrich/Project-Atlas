// lib/merchant/subscription/labels.ts

import type { SubscriptionStatus, BillingCycle } from "./types";

type Variant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Payment due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const SUBSCRIPTION_STATUS_VARIANT: Record<SubscriptionStatus, Variant> =
  {
    trialing: "info",
    active: "success",
    past_due: "warning",
    cancelled: "neutral",
    expired: "danger",
  };

export const SUBSCRIPTION_STATUS_HELP: Record<SubscriptionStatus, string> = {
  trialing: "Your trial is running. No charge until it ends.",
  active: "Your subscription renews at the end of each cycle.",
  past_due:
    "A charge did not go through. Update your payment method to avoid losing access.",
  cancelled: "Your subscription is cancelled but runs to the end of the period.",
  expired: "Your subscription has ended. Choose a plan to restart.",
};

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Monthly",
  annual: "Annual",
};

export function describeSubscriptionLifecycle(
  status: SubscriptionStatus,
  periodEnd: string,
  nowMs: number
): string {
  const endMs = new Date(periodEnd).getTime();
  if (!Number.isFinite(endMs)) return SUBSCRIPTION_STATUS_HELP[status];

  const days = Math.max(0, Math.ceil((endMs - nowMs) / 86_400_000));

  if (status === "trialing") {
    return days === 1
      ? "Trial ends in 1 day."
      : "Trial ends in " + days + " days.";
  }
  if (status === "active") {
    return days === 1
      ? "Renews in 1 day."
      : "Renews in " + days + " days.";
  }
  if (status === "past_due") {
    return days === 1
      ? "Cycle ends in 1 day. Update payment now."
      : "Cycle ends in " + days + " days. Update payment now.";
  }
  if (status === "cancelled") {
    return days === 1
      ? "Access ends in 1 day."
      : "Access ends in " + days + " days.";
  }
  return SUBSCRIPTION_STATUS_HELP.expired;
}