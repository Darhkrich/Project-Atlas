// lib/merchant/subscription/types.ts
//
// Merchant subscription state. Distinct from the plan catalog in
// lib/domains/subscriptions/, which holds the plan definitions. This
// domain holds one merchant's chosen plan, cycle, and lifecycle.

import type { StorefrontPaymentMethod } from "@/lib/domains/subscriptions";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type BillingCycle = "monthly" | "annual";

export type ChargeSource = "billing_wallet" | "card";

export interface MerchantSubscriptionState {
  id: string;
  merchantId: string;
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startedAt: string;
  periodStart: string;
  periodEnd: string;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  discountPercent: number | null;
  discountExpiresAt: string | null;
  pendingPlanCode: string | null;
  pendingChangeEffectiveAt: string | null;
  chargeAttempts: number;
  lastChargeAt: string | null;
  lastChargeInvoiceId: string | null;
  nextRetryAt: string | null;
}

export type SubscriptionStoreState = Record<
  string,
  MerchantSubscriptionState
>;

export interface SubscriptionActor {
  id: string;
  name: string;
  email: string;
}

export interface SubscriptionMutationResult {
  ok: boolean;
  error?: string;
  subscription?: MerchantSubscriptionState;
}

export interface ChargePreview {
  amountGHS: number;
  discountAmountGHS: number;
  periodStart: string;
  periodEnd: string;
  isProrated: boolean;
  cycle: BillingCycle;
  planCode: string;
  planName: string;
}

export interface RenewalStatusView {
  nextChargeAt: string | null;
  nextChargeAmountGHS: number | null;
  daysUntilRenewal: number | null;
  willAutoRenew: boolean;
  isTrialing: boolean;
  isPastDue: boolean;
  isCancelled: boolean;
  effectivePlanCode: string;
}

export interface SubscriptionDisplayView {
  subscription: MerchantSubscriptionState;
  planUnavailable: boolean;
  planName: string;
  planDescription: string | null;
  monthlyLabel: string;
  annualLabel: string;
  currentCyclePriceGHS: number;
  supportedPaymentMethods: StorefrontPaymentMethod[];
  supportedThemes: string[];
  maxProducts: number | "unlimited";
  customDomain: boolean;
}