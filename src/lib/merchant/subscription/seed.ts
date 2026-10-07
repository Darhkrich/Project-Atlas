// lib/merchant/subscription/seed.ts

import type {
  MerchantSubscriptionState,
  SubscriptionStatus,
  BillingCycle,
} from "./types";
import { DEFAULT_TRIAL_DAYS, DAY_MS } from "./constants";

export function buildBlankSubscription(
  merchantId: string,
  planCode: string,
  planName: string,
  cycle: BillingCycle,
  nowMs: number
): MerchantSubscriptionState {
  const nowIso = new Date(nowMs).toISOString();
  const trialEndMs = nowMs + DEFAULT_TRIAL_DAYS * DAY_MS;
  const trialEndIso = new Date(trialEndMs).toISOString();

  return {
    id: "SUB-" + merchantId,
    merchantId,
    planCode,
    planName,
    billingCycle: cycle,
    status: "trialing",
    startedAt: nowIso,
    periodStart: nowIso,
    periodEnd: trialEndIso,
    trialEndsAt: trialEndIso,
    cancelledAt: null,
    cancellationReason: null,
    discountPercent: null,
    discountExpiresAt: null,
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
    chargeAttempts: 0,
    lastChargeAt: null,
    lastChargeInvoiceId: null,
    nextRetryAt: null,
  };
}

export function buildSeedSubscription(
  merchantId: string,
  planCode: string,
  planName: string,
  cycle: BillingCycle,
  status: SubscriptionStatus,
  nowMs: number
): MerchantSubscriptionState {
  const nowIso = new Date(nowMs).toISOString();
  const cycleDays = cycle === "annual" ? 365 : 30;
  const periodEndIso = new Date(
    nowMs + cycleDays * DAY_MS
  ).toISOString();

  return {
    id: "SUB-" + merchantId,
    merchantId,
    planCode,
    planName,
    billingCycle: cycle,
    status,
    startedAt: nowIso,
    periodStart: nowIso,
    periodEnd: periodEndIso,
    trialEndsAt: null,
    cancelledAt: null,
    cancellationReason: null,
    discountPercent: null,
    discountExpiresAt: null,
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
    chargeAttempts: 0,
    lastChargeAt: nowIso,
    lastChargeInvoiceId: null,
    nextRetryAt: null,
  };
}