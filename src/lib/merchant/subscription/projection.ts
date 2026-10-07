// lib/merchant/subscription/projection.ts

import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import { derivePlanDisplayPrices } from "@/lib/domains/subscriptions";
import type {
  MerchantSubscriptionState,
  BillingCycle,
  ChargePreview,
  RenewalStatusView,
  SubscriptionDisplayView,
} from "./types";
import { BILLING_CYCLE_DAYS, DAY_MS } from "./constants";
import {
  SUBSCRIPTION_STATUS_LABEL,
  SUBSCRIPTION_STATUS_VARIANT,
  SUBSCRIPTION_STATUS_HELP,
  describeSubscriptionLifecycle,
} from "./labels";

function planPriceGHS(
  plan: SubscriptionPlan,
  cycle: BillingCycle
): number | "custom" {
  return cycle === "monthly" ? plan.monthlyPriceGHS : plan.annualPriceGHS;
}

export function projectSubscriptionDisplayView(
  subscription: MerchantSubscriptionState,
  plan: SubscriptionPlan | undefined
): SubscriptionDisplayView {
  if (!plan) {
    return {
      subscription,
      planUnavailable: true,
      planName: subscription.planName,
      planDescription: null,
      monthlyLabel: "Unavailable",
      annualLabel: "Unavailable",
      currentCyclePriceGHS: 0,
      supportedPaymentMethods: [],
      supportedThemes: [],
      maxProducts: 0,
      customDomain: false,
    };
  }
  const prices = derivePlanDisplayPrices(plan);
  const raw = planPriceGHS(plan, subscription.billingCycle);
  return {
    subscription,
    planUnavailable: false,
    planName: plan.name,
    planDescription: plan.description ?? null,
    monthlyLabel: prices.monthly,
    annualLabel: prices.annual,
    currentCyclePriceGHS: typeof raw === "number" ? raw : 0,
    supportedPaymentMethods: plan.paymentMethods,
    supportedThemes: plan.themes,
    maxProducts: plan.maxProducts,
    customDomain: plan.customDomain,
  };
}

export function projectRenewalStatus(
  subscription: MerchantSubscriptionState,
  plan: SubscriptionPlan | undefined,
  nowMs: number
): RenewalStatusView {
  const periodEndMs = new Date(subscription.periodEnd).getTime();
  const daysUntilRenewal = Math.max(
    0,
    Math.ceil((periodEndMs - nowMs) / DAY_MS)
  );

  const rawAmount = plan
    ? planPriceGHS(plan, subscription.billingCycle)
    : 0;
  const nextChargeAmountGHS =
    typeof rawAmount === "number" ? rawAmount : null;

  const isCancelled = subscription.status === "cancelled";

  return {
    nextChargeAt: isCancelled ? null : subscription.periodEnd,
    nextChargeAmountGHS: isCancelled ? null : nextChargeAmountGHS,
    daysUntilRenewal,
    willAutoRenew:
      subscription.status === "active" ||
      subscription.status === "trialing",
    isTrialing: subscription.status === "trialing",
    isPastDue: subscription.status === "past_due",
    isCancelled,
    effectivePlanCode: subscription.pendingPlanCode ?? subscription.planCode,
  };
}

export function projectCurrentChargePreview(
  subscription: MerchantSubscriptionState,
  targetPlan: SubscriptionPlan,
  targetCycle: BillingCycle,
  currentPlan: SubscriptionPlan | undefined,
  nowMs: number
): ChargePreview {
  const targetRaw = planPriceGHS(targetPlan, targetCycle);
  const targetPrice = typeof targetRaw === "number" ? targetRaw : 0;

  const currentRaw = currentPlan
    ? planPriceGHS(currentPlan, subscription.billingCycle)
    : 0;
  const currentPrice = typeof currentRaw === "number" ? currentRaw : 0;

  const periodEndMs = new Date(subscription.periodEnd).getTime();
  const remainingDays = Math.max(0, periodEndMs - nowMs) / DAY_MS;

  const isTrialing = subscription.status === "trialing";
  const isActive =
    subscription.status === "active" || subscription.status === "past_due";

  const currentDaily =
    currentPrice / BILLING_CYCLE_DAYS[subscription.billingCycle];
  const targetDaily = targetPrice / BILLING_CYCLE_DAYS[targetCycle];
  const dailyDiff = Math.max(0, targetDaily - currentDaily);

  const isUpgrade = isActive && dailyDiff > 0 && remainingDays > 0;

  let amountGHS = 0;
  if (isTrialing) {
    amountGHS = targetPrice;
  } else if (isUpgrade) {
    amountGHS = Math.round(dailyDiff * remainingDays * 100) / 100;
  }

  let periodStart: string;
  let periodEnd: string;
  if (isTrialing) {
    periodStart = new Date(nowMs).toISOString();
    periodEnd = new Date(
      nowMs + BILLING_CYCLE_DAYS[targetCycle] * DAY_MS
    ).toISOString();
  } else {
    periodStart = subscription.periodStart;
    periodEnd = subscription.periodEnd;
  }

  const discountPercent = subscription.discountPercent ?? 0;
  const discountAmountGHS =
    discountPercent > 0
      ? Math.round((amountGHS * discountPercent * 100) / 100) / 100
      : 0;

  return {
    amountGHS: Math.max(0, amountGHS - discountAmountGHS),
    discountAmountGHS,
    periodStart,
    periodEnd,
    isProrated: isUpgrade,
    cycle: targetCycle,
    planCode: targetPlan.code,
    planName: targetPlan.name,
  };
}

export type ChangeMode =
  | "none"
  | "upgrade"
  | "downgrade"
  | "cycle_switch"
  | "custom";

export function projectChangeMode(
  currentPlan: SubscriptionPlan | undefined,
  currentCycle: BillingCycle,
  targetPlan: SubscriptionPlan | undefined,
  targetCycle: BillingCycle
): ChangeMode {
  if (!targetPlan) return "none";
  if (typeof targetPlan.monthlyPriceGHS !== "number") return "custom";

  if (currentPlan && targetPlan.code === currentPlan.code) {
    if (currentCycle === targetCycle) return "none";
    return "cycle_switch";
  }

  if (!currentPlan) return "upgrade";

  const currentRaw = planPriceGHS(currentPlan, currentCycle);
  const targetRaw = planPriceGHS(targetPlan, targetCycle);
  if (typeof currentRaw !== "number") return "upgrade";
  if (typeof targetRaw !== "number") return "upgrade";
  if (targetRaw > currentRaw) return "upgrade";
  if (targetRaw < currentRaw) return "downgrade";
  return "none";
}

export function projectLifecycleSummary(
  subscription: MerchantSubscriptionState,
  nowMs: number
): string {
  return describeSubscriptionLifecycle(
    subscription.status,
    subscription.periodEnd,
    nowMs
  );
}

export function projectStatusLabel(
  subscription: MerchantSubscriptionState
): string {
  return SUBSCRIPTION_STATUS_LABEL[subscription.status];
}

export function projectStatusVariant(
  subscription: MerchantSubscriptionState
): "success" | "warning" | "danger" | "info" | "neutral" | "brand" {
  return SUBSCRIPTION_STATUS_VARIANT[subscription.status];
}

export function projectStatusHelp(
  subscription: MerchantSubscriptionState
): string {
  return SUBSCRIPTION_STATUS_HELP[subscription.status];
}