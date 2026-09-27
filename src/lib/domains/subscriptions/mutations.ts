// lib/domains/subscriptions/mutations.ts

import type {
  SubscriptionPlan,
  SubscriptionPlanActor,
  CreatePlanInput,
  UpdatePlanInput,
  PlanMutationResult,
} from "./types";
import {
  getPlans,
  getPlanByCode,
  internalAppendPlan,
  internalReplacePlan,
  internalRemovePlan,
  notifyPlanStore,
} from "./store";
import {
  nextSortOrder,
  planCodeSetFor,
  validatePlanInput,
} from "./helpers";
import { appendAuditEntry } from "@/lib/domains/audit";

function actorForAudit(actor: SubscriptionPlanActor) {
  return { id: actor.id, name: actor.name, email: actor.email };
}

export function createSubscriptionPlan(
  input: CreatePlanInput,
  actor: SubscriptionPlanActor
): PlanMutationResult {
  const existing = getPlans();
  const existingCodes = planCodeSetFor(existing);

  const validation = validatePlanInput(input, existingCodes);
  if (!validation.ok) {
    const firstError = Object.values(validation.errors)[0];
    return { ok: false, error: firstError ?? "Invalid plan input." };
  }

  const code = input.code.trim().toLowerCase();
  const now = nextSortOrder(existing);

  const plan: SubscriptionPlan = {
    code,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    monthlyPriceGHS: input.monthlyPriceGHS,
    annualPriceGHS: input.annualPriceGHS,
    maxProducts: input.maxProducts,
    themes: [...input.themes],
    paymentMethods: [...input.paymentMethods],
    subdomain: input.subdomain,
    customDomain: input.customDomain,
    supportTier: input.supportTier,
    featureFlags: {},
    aiAssistant: input.aiAssistant,
    visibility: input.visibility,
    sortOrder: now,
    highlighted: input.highlighted,
  };

  internalAppendPlan(plan);

  appendAuditEntry({
    action: "subscription.plan.create",
    resourceType: "subscription_plan",
    resourceId: code,
    actor: actorForAudit(actor),
    metadata: {
      name: plan.name,
      monthlyPriceGHS: plan.monthlyPriceGHS,
      annualPriceGHS: plan.annualPriceGHS,
    },
  });

  notifyPlanStore();
  return { ok: true, plan };
}

export function updateSubscriptionPlan(
  code: string,
  patch: UpdatePlanInput,
  actor: SubscriptionPlanActor
): PlanMutationResult {
  const current = getPlanByCode(code);
  if (!current) return { ok: false, error: "Plan not found." };

  const merged: CreatePlanInput = {
    code: current.code,
    name: patch.name ?? current.name,
    description:
      patch.description !== undefined ? patch.description : current.description,
    monthlyPriceGHS:
      patch.monthlyPriceGHS !== undefined
        ? patch.monthlyPriceGHS
        : current.monthlyPriceGHS,
    annualPriceGHS:
      patch.annualPriceGHS !== undefined
        ? patch.annualPriceGHS
        : current.annualPriceGHS,
    maxProducts:
      patch.maxProducts !== undefined ? patch.maxProducts : current.maxProducts,
    themes: patch.themes ?? current.themes,
    paymentMethods: patch.paymentMethods ?? current.paymentMethods,
    subdomain:
      patch.subdomain !== undefined ? patch.subdomain : current.subdomain,
    customDomain:
      patch.customDomain !== undefined
        ? patch.customDomain
        : current.customDomain,
    supportTier: patch.supportTier ?? current.supportTier,
    aiAssistant:
      patch.aiAssistant !== undefined ? patch.aiAssistant : current.aiAssistant,
    visibility: patch.visibility ?? current.visibility,
    highlighted:
      patch.highlighted !== undefined
        ? patch.highlighted
        : current.highlighted,
  };

  const existingCodes = planCodeSetFor(getPlans(), code);
  const validation = validatePlanInput(merged, existingCodes);
  if (!validation.ok) {
    const firstError = Object.values(validation.errors)[0];
    return { ok: false, error: firstError ?? "Invalid plan input." };
  }

  const next: SubscriptionPlan = {
    ...current,
    ...merged,
    code: current.code,
    description: merged.description?.trim() || undefined,
    name: merged.name.trim(),
    themes: [...merged.themes],
    paymentMethods: [...merged.paymentMethods],
  };

  if (!internalReplacePlan(code, next)) {
    return { ok: false, error: "Plan not found." };
  }

  appendAuditEntry({
    action: "subscription.plan.update",
    resourceType: "subscription_plan",
    resourceId: code,
    actor: actorForAudit(actor),
    metadata: { fields: Object.keys(patch) },
  });

  notifyPlanStore();
  return { ok: true, plan: next };
}

export function deleteSubscriptionPlan(
  code: string,
  merchantCount: number,
  actor: SubscriptionPlanActor
): PlanMutationResult {
  const current = getPlanByCode(code);
  if (!current) return { ok: false, error: "Plan not found." };

  if (merchantCount > 0) {
    return {
      ok: false,
      error:
        merchantCount +
        " merchant" +
        (merchantCount === 1 ? " is" : "s are") +
        " on this plan. Move them to another plan first, or mark this plan legacy.",
    };
  }

  const remaining = getPlans().filter((p) => p.code !== code);
  if (remaining.length === 0) {
    return { ok: false, error: "Cannot delete the only plan." };
  }

  if (!internalRemovePlan(code)) {
    return { ok: false, error: "Plan not found." };
  }

  appendAuditEntry({
    action: "subscription.plan.delete",
    resourceType: "subscription_plan",
    resourceId: code,
    actor: actorForAudit(actor),
    metadata: { name: current.name },
  });

  notifyPlanStore();
  return { ok: true, plan: current };
}

export function toggleSubscriptionPlanVisibility(
  code: string,
  actor: SubscriptionPlanActor
): PlanMutationResult {
  const current = getPlanByCode(code);
  if (!current) return { ok: false, error: "Plan not found." };

  const nextVisibility =
    current.visibility === "public" ? "hidden" : "public";

  const next: SubscriptionPlan = {
    ...current,
    visibility: nextVisibility,
  };

  if (!internalReplacePlan(code, next)) {
    return { ok: false, error: "Plan not found." };
  }

  appendAuditEntry({
    action: "subscription.plan.toggle",
    resourceType: "subscription_plan",
    resourceId: code,
    actor: actorForAudit(actor),
    metadata: { from: current.visibility, to: nextVisibility },
  });

  notifyPlanStore();
  return { ok: true, plan: next };
}

export function reorderSubscriptionPlan(
  code: string,
  direction: "up" | "down",
  actor: SubscriptionPlanActor
): PlanMutationResult {
  const plans = getPlans();
  const idx = plans.findIndex((p) => p.code === code);
  if (idx === -1) return { ok: false, error: "Plan not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= plans.length) {
    return { ok: false, error: "Plan is already at the edge." };
  }

  const current = plans[idx];
  const swap = plans[swapIdx];

  const nextCurrent: SubscriptionPlan = {
    ...current,
    sortOrder: swap.sortOrder,
  };
  const nextSwap: SubscriptionPlan = {
    ...swap,
    sortOrder: current.sortOrder,
  };

  internalReplacePlan(current.code, nextCurrent);
  internalReplacePlan(swap.code, nextSwap);

  appendAuditEntry({
    action: "subscription.plan.reorder",
    resourceType: "subscription_plan",
    resourceId: code,
    actor: actorForAudit(actor),
    metadata: { direction },
  });

  notifyPlanStore();
  return { ok: true, plan: nextCurrent };
}