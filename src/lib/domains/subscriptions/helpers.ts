// lib/domains/subscriptions/helpers.ts

import type { SubscriptionPlan, CreatePlanInput } from "./types";
import {
  MAX_CUSTOM_PRICE_GHS,
  MAX_PLAN_DESCRIPTION_LENGTH,
  MAX_PLAN_NAME_LENGTH,
  MIN_PLAN_NAME_LENGTH,
  PLAN_CODE_REGEX,
  RESERVED_PLAN_CODES,
} from "./constants";

export interface PlanDisplayPrices {
  monthly: string;
  annual: string;
}

export function derivePlanDisplayPrices(
  plan: SubscriptionPlan
): PlanDisplayPrices {
  return {
    monthly: formatPlanPrice(plan.monthlyPriceGHS, "monthly"),
    annual: formatPlanPrice(plan.annualPriceGHS, "annual"),
  };
}

function formatPlanPrice(
  value: number | "custom",
  cycle: "monthly" | "annual"
): string {
  if (value === "custom") return "Custom";
  const suffix = cycle === "monthly" ? "/mo" : "/yr";
  return "GH\u20B5 " + value.toLocaleString("en-GH") + suffix;
}

export interface PlanValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof CreatePlanInput | "code", string>>;
}

export function validatePlanInput(
  input: CreatePlanInput,
  existingCodes: Set<string>
): PlanValidationResult {
  const errors: PlanValidationResult["errors"] = {};

  const code = input.code.trim().toLowerCase();
  if (!PLAN_CODE_REGEX.test(code)) {
    errors.code =
      "Use lowercase letters, digits, and dashes. Start with a letter. 3 to 32 characters.";
  } else if (RESERVED_PLAN_CODES.has(code)) {
    errors.code = "That code is reserved.";
  } else if (existingCodes.has(code)) {
    errors.code = "A plan with this code already exists.";
  }

  const name = input.name.trim();
  if (name.length < MIN_PLAN_NAME_LENGTH) {
    errors.name = "Name is too short.";
  } else if (name.length > MAX_PLAN_NAME_LENGTH) {
    errors.name = "Name is too long.";
  }

  if (
    input.description &&
    input.description.length > MAX_PLAN_DESCRIPTION_LENGTH
  ) {
    errors.description = "Description is too long.";
  }

  const monthly = input.monthlyPriceGHS;
  if (
    typeof monthly === "number" &&
    (monthly < 0 || monthly > MAX_CUSTOM_PRICE_GHS)
  ) {
    errors.monthlyPriceGHS = "Monthly price is out of range.";
  }

  const annual = input.annualPriceGHS;
  if (
    typeof annual === "number" &&
    (annual < 0 || annual > MAX_CUSTOM_PRICE_GHS)
  ) {
    errors.annualPriceGHS = "Annual price is out of range.";
  }

  if (
    typeof monthly === "number" &&
    typeof annual === "number" &&
    annual > 0 &&
    annual < monthly
  ) {
    errors.annualPriceGHS =
      "Annual price is less than a single month. Check the value.";
  }

  if (typeof input.maxProducts === "number" && input.maxProducts < 1) {
    errors.maxProducts = "Product limit must be at least 1.";
  }

  if (input.themes.length === 0) {
    errors.themes = "Pick at least one theme.";
  }
  if (input.paymentMethods.length === 0) {
    errors.paymentMethods = "Pick at least one payment method.";
  }
  if (!input.subdomain && !input.customDomain) {
    errors.subdomain = "Every plan must offer at least one domain option.";
  }
  if (input.customDomain && !input.subdomain) {
    // Not an error, but unusual. The admin may intend it. No message.
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function planCodeSetFor(
  plans: SubscriptionPlan[],
  excludeCode?: string
): Set<string> {
  const set = new Set<string>();
  for (const p of plans) {
    if (excludeCode && p.code === excludeCode) continue;
    set.add(p.code);
  }
  return set;
}

export function nextSortOrder(plans: SubscriptionPlan[]): number {
  if (plans.length === 0) return 1;
  return Math.max(...plans.map((p) => p.sortOrder)) + 1;
}

export function sortPlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
}