// lib/domains/subscriptions/projection.ts

import type { SubscriptionPlan } from "./types";
import { derivePlanDisplayPrices } from "./helpers";
import {
  PAYMENT_METHOD_LABEL,
  PLAN_VISIBILITY_LABEL,
  SUPPORT_TIER_LABEL,
  THEME_LABEL,
  planCodeLabel,
} from "./labels";

export interface PlanPickerOption {
  code: string;
  label: string;
}

/**
 * Options for a plan select. Public plans only, in sort order. Used by
 * the merchant onboarding picker and the admin filter dropdown.
 */
export function projectPlanPickerOptions(
  plans: SubscriptionPlan[]
): PlanPickerOption[] {
  return plans
    .filter((p) => p.visibility === "public")
    .map((p) => ({ code: p.code, label: planCodeLabel(p.code, p.name) }));
}

export interface PlanRowSummary {
  code: string;
  name: string;
  monthlyLabel: string;
  annualLabel: string;
  visibilityLabel: string;
  themesLabel: string;
  paymentMethodsLabel: string;
  supportLabel: string;
  domainLabel: string;
}

export function projectPlanRowSummary(
  plan: SubscriptionPlan
): PlanRowSummary {
  const prices = derivePlanDisplayPrices(plan);
  const domainParts: string[] = [];
  if (plan.subdomain) domainParts.push("Atlas subdomain");
  if (plan.customDomain) domainParts.push("Custom domain");

  return {
    code: plan.code,
    name: plan.name,
    monthlyLabel: prices.monthly,
    annualLabel: prices.annual,
    visibilityLabel: PLAN_VISIBILITY_LABEL[plan.visibility],
    themesLabel: plan.themes.map((t) => THEME_LABEL[t]).join(", "),
    paymentMethodsLabel: plan.paymentMethods
      .map((m) => PAYMENT_METHOD_LABEL[m])
      .join(", "),
    supportLabel: SUPPORT_TIER_LABEL[plan.supportTier],
    domainLabel: domainParts.join(" \u00B7 "),
  };
}

export interface PlanTotals {
  total: number;
  publicCount: number;
  hiddenCount: number;
  legacyCount: number;
}

export function projectPlanTotals(plans: SubscriptionPlan[]): PlanTotals {
  let publicCount = 0;
  let hiddenCount = 0;
  let legacyCount = 0;
  for (const p of plans) {
    if (p.visibility === "public") publicCount += 1;
    else if (p.visibility === "hidden") hiddenCount += 1;
    else legacyCount += 1;
  }
  return {
    total: plans.length,
    publicCount,
    hiddenCount,
    legacyCount,
  };
}