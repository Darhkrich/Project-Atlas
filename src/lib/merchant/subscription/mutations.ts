/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/merchant/subscription/mutations.ts

import type {
  SubscriptionActor,
  SubscriptionMutationResult,
  MerchantSubscriptionState,
  BillingCycle,
} from "./types";
import {
  getSubscriptionForMerchant,
  internalPatchSubscription,
  internalUpsertSubscription,
} from "./store";
import { buildBlankSubscription } from "./seed";
import { BILLING_CYCLE_DAYS, DAY_MS } from "./constants";
import { appendAuditEntry } from "@/lib/domains/audit";

function actorForAudit(actor: SubscriptionActor) {
  return { id: actor.id, name: actor.name, email: actor.email };
}

export function startSubscription(
  merchantId: string,
  planCode: string,
  planName: string,
  cycle: BillingCycle,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const existing = getSubscriptionForMerchant(merchantId);
  if (existing) {
    return { ok: true, subscription: existing };
  }
  const nowMs = Date.now();
  const created = buildBlankSubscription(
    merchantId,
    planCode,
    planName,
    cycle,
    nowMs
  );
  internalUpsertSubscription(merchantId, created);

  appendAuditEntry({
    action: "subscription.merchant.start",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { planCode, planName, cycle },
  });

  return { ok: true, subscription: created };
}

export interface PlanChangePeriod {
  periodStart: string;
  periodEnd: string;
}

export function applyImmediatePlanChange(
  merchantId: string,
  newPlanCode: string,
  newPlanName: string,
  newCycle: BillingCycle,
  period: PlanChangePeriod,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }
  const nowIso = new Date().toISOString();

  // The period is caller-supplied. Mid-cycle upgrade keeps the existing
  // period end; trial conversion starts a fresh cycle. The charge has
  // already been debited by the caller.
  const next = internalPatchSubscription(merchantId, {
    planCode: newPlanCode,
    planName: newPlanName,
    billingCycle: newCycle,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    trialEndsAt: null,
    status: "active",
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
    chargeAttempts: 0,
    lastChargeAt: nowIso,
    nextRetryAt: null,
  });
  if (!next) {
    return { ok: false, error: "Subscription not found." };
  }

  appendAuditEntry({
    action: "subscription.merchant.change_plan",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: {
      fromPlan: current.planCode,
      toPlan: newPlanCode,
      fromCycle: current.billingCycle,
      toCycle: newCycle,
      periodEnd: period.periodEnd,
      mode: "immediate",
    },
  });

  return { ok: true, subscription: next };
}

export function scheduleDowngrade(
  merchantId: string,
  newPlanCode: string,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }

  const next = internalPatchSubscription(merchantId, {
    pendingPlanCode: newPlanCode,
    pendingChangeEffectiveAt: current.periodEnd,
  });
  if (!next) {
    return { ok: false, error: "Subscription not found." };
  }

  appendAuditEntry({
    action: "subscription.merchant.change_plan",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: {
      fromPlan: current.planCode,
      toPlan: newPlanCode,
      mode: "scheduled",
      effectiveAt: current.periodEnd,
    },
  });

  return { ok: true, subscription: next };
}

export function applyScheduledChange(
  merchantId: string,
  newPlanName: string,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }
  if (!current.pendingPlanCode) {
    return { ok: false, error: "No scheduled change." };
  }

  const nowMs = Date.now();
  const durationDays = BILLING_CYCLE_DAYS[current.billingCycle];
  const periodEndIso = new Date(
    nowMs + durationDays * DAY_MS
  ).toISOString();

  const previousPlan = current.planCode;
  const next = internalPatchSubscription(merchantId, {
    planCode: current.pendingPlanCode,
    planName: newPlanName,
    periodStart: new Date(nowMs).toISOString(),
    periodEnd: periodEndIso,
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
    chargeAttempts: 0,
  });
  if (!next) {
    return { ok: false, error: "Subscription not found." };
  }

  appendAuditEntry({
    action: "subscription.merchant.change_plan",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: {
      fromPlan: previousPlan,
      toPlan: current.pendingPlanCode,
      mode: "scheduled_applied",
    },
  });

  return { ok: true, subscription: next };
}

export function cancelScheduledChange(
  merchantId: string,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }

  const next = internalPatchSubscription(merchantId, {
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.change_plan",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { mode: "scheduled_cancelled" },
  });

  return { ok: true, subscription: next };
}

export function cancelSubscription(
  merchantId: string,
  reason: string,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }
  if (current.status === "cancelled") {
    return { ok: true, subscription: current };
  }

  const trimmed = reason.trim();
  const nowIso = new Date().toISOString();
  const next = internalPatchSubscription(merchantId, {
    status: "cancelled",
    cancelledAt: nowIso,
    cancellationReason: trimmed || "Cancelled by merchant",
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.cancel",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { reason: trimmed, periodEnd: current.periodEnd },
  });

  return { ok: true, subscription: next };
}

export function reactivateSubscription(
  merchantId: string,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }
  if (current.status !== "cancelled" && current.status !== "expired") {
    return { ok: false, error: "Subscription is not cancelled." };
  }

  const nowMs = Date.now();
  const periodEndMs = new Date(current.periodEnd).getTime();
  const periodEndIso =
    periodEndMs > nowMs
      ? current.periodEnd
      : new Date(
          nowMs + BILLING_CYCLE_DAYS[current.billingCycle] * DAY_MS
        ).toISOString();

  const next = internalPatchSubscription(merchantId, {
    status: "active",
    cancelledAt: null,
    cancellationReason: null,
    periodStart:
      periodEndMs > nowMs
        ? current.periodStart
        : new Date(nowMs).toISOString(),
    periodEnd: periodEndIso,
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.reactivate",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { newPeriodEnd: periodEndIso },
  });

  return { ok: true, subscription: next };
}

export function markSubscriptionPastDue(
  merchantId: string,
  reason: string,
  retryAt: string | null,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }

  const next = internalPatchSubscription(merchantId, {
    status: "past_due",
    nextRetryAt: retryAt,
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.past_due",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { reason, retryAt },
  });

  return { ok: true, subscription: next };
}

export function markSubscriptionActive(
  merchantId: string,
  invoiceId: string | null,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }

  const nowIso = new Date().toISOString();
  const next = internalPatchSubscription(merchantId, {
    status: "active",
    chargeAttempts: 0,
    lastChargeAt: nowIso,
    lastChargeInvoiceId: invoiceId,
    nextRetryAt: null,
    trialEndsAt: null,
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.charge_success",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { invoiceId, planCode: current.planCode },
  });

  return { ok: true, subscription: next };
}

export function recordChargeFailure(
  merchantId: string,
  reason: string,
  retryAt: string | null,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }

  const attempts = current.chargeAttempts + 1;
  const next = internalPatchSubscription(merchantId, {
    chargeAttempts: attempts,
    nextRetryAt: retryAt,
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.charge_failure",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: {
      reason,
      attempt: attempts,
      retryAt,
    },
  });

  return { ok: true, subscription: next };
}

export function markSubscriptionExpired(
  merchantId: string,
  actor: SubscriptionActor
): SubscriptionMutationResult {
  const current = getSubscriptionForMerchant(merchantId);
  if (!current) {
    return { ok: false, error: "Subscription not found." };
  }
  if (current.status === "expired") {
    return { ok: true, subscription: current };
  }

  const next = internalPatchSubscription(merchantId, {
    status: "expired",
  });
  if (!next) return { ok: false, error: "Subscription not found." };

  appendAuditEntry({
    action: "subscription.merchant.past_due",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: actorForAudit(actor),
    metadata: { reason: "subscription_expired" },
  });

  return { ok: true, subscription: next };
}