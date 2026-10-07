// lib/merchant/subscription/constants.ts

import type { BillingCycle } from "./types";

export const DEFAULT_PLAN_CODE = "growth";

export const TRIAL_PLAN_CODE = "pro";
export const TRIAL_PLAN_NAME = "Pro";

export const DEFAULT_BILLING_CYCLE: BillingCycle = "monthly";

export const DEFAULT_TRIAL_DAYS = 7;

export const DEFAULT_GRACE_PERIOD_DAYS = 7;

export const MAX_CHARGE_ATTEMPTS = 3;

export const RETRY_COOLDOWN_HOURS = 24;

export const DAY_MS = 86_400_000;

export const BILLING_CYCLE_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  annual: 365,
};

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Monthly",
  annual: "Annual",
};

export const BILLING_CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: "/mo",
  annual: "/yr",
};

export const SUBSCRIPTION_STORAGE_KEY = "atlas-merchant-subscriptions-v2";

export const AUDIT_SUBSCRIPTION_START = "subscription.merchant.start" as const;
export const AUDIT_SUBSCRIPTION_CHANGE_PLAN =
  "subscription.merchant.change_plan" as const;
export const AUDIT_SUBSCRIPTION_CHANGE_CYCLE =
  "subscription.merchant.change_cycle" as const;
export const AUDIT_SUBSCRIPTION_CANCEL =
  "subscription.merchant.cancel" as const;
export const AUDIT_SUBSCRIPTION_REACTIVATE =
  "subscription.merchant.reactivate" as const;
export const AUDIT_SUBSCRIPTION_CHARGE_SUCCESS =
  "subscription.merchant.charge_success" as const;
export const AUDIT_SUBSCRIPTION_CHARGE_FAILURE =
  "subscription.merchant.charge_failure" as const;
export const AUDIT_SUBSCRIPTION_PAST_DUE =
  "subscription.merchant.past_due" as const;