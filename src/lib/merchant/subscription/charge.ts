// lib/merchant/subscription/charge.ts

import type {
  MerchantSubscriptionState,
  ChargeSource,
  SubscriptionActor,
} from "./types";
import {
  internalPatchSubscription,
  getSubscriptionForMerchant,
} from "./store";
import {
  BILLING_CYCLE_DAYS,
  DAY_MS,
  MAX_CHARGE_ATTEMPTS,
  RETRY_COOLDOWN_HOURS,
} from "./constants";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import { getInvoicesForMerchant } from "@/lib/merchant/billing/store";
import {
  issueInvoice,
  markInvoicePaid,
  markInvoiceFailed,
} from "@/lib/merchant/billing/mutations";
import { appendAuditEntry } from "@/lib/domains/audit";
import { bridgePlanChargeToLedger } from "@/lib/domains/wallet/merchant-money/bridge";

export interface ChargeResult {
  ok: boolean;
  invoiceId?: string;
  ledgerEntryId?: string;
  error?: string;
  nextRetryAt?: string;
}

function planAmountFor(
  plan: SubscriptionPlan,
  cycle: "monthly" | "annual"
): number | null {
  const raw =
    cycle === "monthly" ? plan.monthlyPriceGHS : plan.annualPriceGHS;
  return typeof raw === "number" ? raw : null;
}

export function attemptPlanCharge(
  subscription: MerchantSubscriptionState,
  plan: SubscriptionPlan,
  chargeSource: ChargeSource,
  actor: SubscriptionActor,
  nowMs: number
): ChargeResult {
  const existing = getInvoicesForMerchant(subscription.merchantId).find(
    (inv) =>
      inv.periodStart === subscription.periodStart &&
      inv.status !== "void" &&
      inv.status !== "refunded"
  );

  if (existing && existing.status === "paid") {
    return {
      ok: true,
      invoiceId: existing.id,
      ledgerEntryId: existing.ledgerEntryId,
    };
  }

  if (existing && existing.status === "failed") {
    if (existing.attemptCount >= MAX_CHARGE_ATTEMPTS) {
      return {
        ok: false,
        error: "Charge attempts exhausted for this cycle.",
        invoiceId: existing.id,
      };
    }
    return executeCharge(
      existing.id,
      subscription,
      plan,
      chargeSource,
      actor,
      nowMs
    );
  }

  if (existing && existing.status === "unpaid") {
    return executeCharge(
      existing.id,
      subscription,
      plan,
      chargeSource,
      actor,
      nowMs
    );
  }

  const amount = planAmountFor(plan, subscription.billingCycle);
  if (amount === null) {
    return {
      ok: false,
      error: "This plan has custom pricing. Contact Atlas sales.",
    };
  }

  const issued = issueInvoice(
    {
      subscriptionId: subscription.id,
      merchantId: subscription.merchantId,
      planCode: plan.code,
      planName: plan.name,
      billingCycle: subscription.billingCycle,
      amount,
      periodStart: subscription.periodStart,
      periodEnd: subscription.periodEnd,
      chargeSource,
    },
    actor
  );
  if (!issued.ok || !issued.invoice) {
    return { ok: false, error: issued.error ?? "Failed to issue invoice." };
  }

  return executeCharge(
    issued.invoice.id,
    subscription,
    plan,
    chargeSource,
    actor,
    nowMs
  );
}

function executeCharge(
  invoiceId: string,
  subscription: MerchantSubscriptionState,
  plan: SubscriptionPlan,
  chargeSource: ChargeSource,
  actor: SubscriptionActor,
  nowMs: number
): ChargeResult {
  const amount = planAmountFor(plan, subscription.billingCycle);
  if (amount === null) {
    return {
      ok: false,
      error: "This plan has custom pricing. Contact Atlas sales.",
      invoiceId,
    };
  }

  const nowIso = new Date(nowMs).toISOString();

  if (chargeSource === "billing_wallet") {
    const bridgeResult = bridgePlanChargeToLedger({
      id: invoiceId,
      merchantId: subscription.merchantId,
      planCode: plan.code,
      billingCycle: subscription.billingCycle,
      amount,
      status: "successful",
      source: "billing_wallet",
      createdAt: nowIso,
      completedAt: nowIso,
      transactionRef: invoiceId,
    });

    if (!bridgeResult.ok) {
      const reason = bridgeResult.error ?? "Wallet debit failed.";
      markInvoiceFailed(
        {
          merchantId: subscription.merchantId,
          invoiceId,
          reason,
          failedAt: nowIso,
        },
        actor
      );
      return handleChargeFailure(subscription, reason, nowMs, actor, invoiceId);
    }

    const ledgerEntryId = "ML-PC-" + invoiceId;
    markInvoicePaid(
      {
        merchantId: subscription.merchantId,
        invoiceId,
        ledgerEntryId,
        paidAt: nowIso,
      },
      actor
    );
    extendSubscriptionPeriod(
      subscription.merchantId,
      invoiceId,
      plan,
      nowMs,
      actor
    );
    return { ok: true, invoiceId, ledgerEntryId };
  }

  markInvoicePaid(
    {
      merchantId: subscription.merchantId,
      invoiceId,
      ledgerEntryId: "card-" + invoiceId,
      paidAt: nowIso,
    },
    actor
  );
  extendSubscriptionPeriod(
    subscription.merchantId,
    invoiceId,
    plan,
    nowMs,
    actor
  );
  return { ok: true, invoiceId };
}

function extendSubscriptionPeriod(
  merchantId: string,
  invoiceId: string,
  plan: SubscriptionPlan,
  nowMs: number,
  actor: SubscriptionActor
): void {
  const subscription = getSubscriptionForMerchant(merchantId);
  if (!subscription) return;

  const cycleDays = BILLING_CYCLE_DAYS[subscription.billingCycle];
  const newPeriodStart = new Date(nowMs).toISOString();
  const newPeriodEnd = new Date(
    nowMs + cycleDays * DAY_MS
  ).toISOString();

  internalPatchSubscription(merchantId, {
    planCode: plan.code,
    planName: plan.name,
    status: "active",
    periodStart: newPeriodStart,
    periodEnd: newPeriodEnd,
    pendingPlanCode: null,
    pendingChangeEffectiveAt: null,
    chargeAttempts: 0,
    lastChargeAt: new Date(nowMs).toISOString(),
    lastChargeInvoiceId: invoiceId,
    nextRetryAt: null,
    trialEndsAt: null,
  });

  appendAuditEntry({
    action: "subscription.merchant.charge_success",
    resourceType: "subscription",
    resourceId: merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      invoiceId,
      planCode: plan.code,
      newPeriodEnd,
    },
  });
}

function handleChargeFailure(
  subscription: MerchantSubscriptionState,
  reason: string,
  nowMs: number,
  actor: SubscriptionActor,
  invoiceId: string
): ChargeResult {
  const attempts = subscription.chargeAttempts + 1;

  if (attempts >= MAX_CHARGE_ATTEMPTS) {
    internalPatchSubscription(subscription.merchantId, {
      status: "past_due",
      chargeAttempts: attempts,
      nextRetryAt: null,
    });
    appendAuditEntry({
      action: "subscription.merchant.past_due",
      resourceType: "subscription",
      resourceId: subscription.merchantId,
      actor: { id: actor.id, name: actor.name, email: actor.email },
      metadata: { reason, attempts, invoiceId },
    });
    return { ok: false, error: reason, invoiceId };
  }

  const retryAt = new Date(
    nowMs + RETRY_COOLDOWN_HOURS * 3_600_000
  ).toISOString();

  internalPatchSubscription(subscription.merchantId, {
    chargeAttempts: attempts,
    nextRetryAt: retryAt,
  });

  appendAuditEntry({
    action: "subscription.merchant.charge_failure",
    resourceType: "subscription",
    resourceId: subscription.merchantId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { reason, attempts, retryAt, invoiceId },
  });

  return { ok: false, error: reason, nextRetryAt: retryAt, invoiceId };
}

export function isChargeDue(
  subscription: MerchantSubscriptionState,
  nowMs: number
): boolean {
  if (subscription.status === "cancelled") return false;
  if (subscription.status === "expired") return false;

  const periodEndMs = new Date(subscription.periodEnd).getTime();
  if (!Number.isFinite(periodEndMs)) return false;

  if (subscription.nextRetryAt) {
    const retryMs = new Date(subscription.nextRetryAt).getTime();
    if (Number.isFinite(retryMs) && retryMs > nowMs) return false;
  }

  return periodEndMs <= nowMs;
}

export function shouldMarkExpired(
  subscription: MerchantSubscriptionState,
  nowMs: number
): boolean {
  if (subscription.status !== "past_due") return false;
  const periodEndMs = new Date(subscription.periodEnd).getTime();
  if (!Number.isFinite(periodEndMs)) return false;
  return periodEndMs + 7 * DAY_MS <= nowMs;
}

export function effectivePlanCode(
  subscription: MerchantSubscriptionState
): string {
  return subscription.pendingPlanCode ?? subscription.planCode;
}