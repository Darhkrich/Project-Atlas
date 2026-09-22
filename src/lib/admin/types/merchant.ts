// lib/admin/types/merchant.ts

import type { PlanCode } from "@/config/subscription-plans";
import { subscriptionPlans } from "@/config/subscription-plans";

export type MerchantStatus = "active" | "suspended" | "pending";
export type SubscriptionPlan = PlanCode;
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";
export type VerificationStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "not_submitted";
export type StoreStatus = "live" | "disabled";

export interface StoreConfig {
  storeName: string;
  slug: string;
  primaryColor: string;
  accentColor: string;
  templateId: string;
  customDomain?: string;
  subdomain: string;
  logo?: string;
}

export interface Subscription {
  lastPaymentDate: string;
  discountPercent?: number;
  amountPaid: number;
  planId: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  billingCycle: "monthly" | "annual";
}

export interface MerchantActivityEntry {
  id: string;
  timestamp: string;
  action: string;
}

export interface MerchantAuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export interface MerchantRecentOrder {
  id: string;
  itemCount: number;
  total: number;
  date: string;
}

export interface MerchantRecentPayment {
  id: string;
  amount: number;
  method: string;
  date: string;
}

export interface MerchantWalletTransaction {
  id: string;
  type: string;
  amount: number;
  date: string;
}

export interface MerchantPlanLimitsExceeded {
  products?: boolean;
  transactions?: boolean;
}

export interface Merchant {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  storeConfig: StoreConfig;
  subscription: Subscription;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  merchantStatus: MerchantStatus;
  storeStatus: StoreStatus;
  totalOrders: number;
  totalRevenue: number;
  lastActive: string;
  createdAt: string;

  contractMrr?: number;
  planLimitsExceeded?: MerchantPlanLimitsExceeded;

  recentOrders?: MerchantRecentOrder[];
  recentPayments?: MerchantRecentPayment[];
  walletTransactions?: MerchantWalletTransaction[];

  activityLog: MerchantActivityEntry[];
  auditTrail?: MerchantAuditEntry[];
}

export const MERCHANT_STATUS_LABELS: Record<MerchantStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  live: "Live",
  disabled: "Disabled",
};

export const SUBSCRIPTION_PLANS: { value: SubscriptionPlan; label: string }[] =
  subscriptionPlans.map((p) => ({ value: p.code, label: p.name }));

export function parsePlanPrice(price: string): number {
  const match = price.match(/[\d,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, ""));
}

export function getPlanMonthlyPriceGHS(
  code: SubscriptionPlan
): number | "custom" {
  const plan = subscriptionPlans.find((p) => p.code === code);
  if (!plan) return 0;
  return plan.monthlyPriceGHS;
}

export function getPlanAnnualPriceGHS(
  code: SubscriptionPlan
): number | "custom" {
  const plan = subscriptionPlans.find((p) => p.code === code);
  if (!plan) return 0;
  return plan.annualPriceGHS;
}

export function getMerchantMrr(m: Merchant): number {
  if (m.subscription.planId === "enterprise") {
    return m.contractMrr ?? 0;
  }
  const v = getPlanMonthlyPriceGHS(m.subscription.planId);
  return typeof v === "number" ? v : 0;
}

export function getNextChargeAmount(m: Merchant): number | "custom" {
  if (m.subscription.planId === "enterprise") {
    const mrr = m.contractMrr ?? 0;
    if (mrr === 0) return "custom";
    return m.subscription.billingCycle === "annual" ? mrr * 12 : mrr;
  }
  const base =
    m.subscription.billingCycle === "annual"
      ? getPlanAnnualPriceGHS(m.subscription.planId)
      : getPlanMonthlyPriceGHS(m.subscription.planId);
  if (base === "custom") return "custom";
  const discount = m.subscription.discountPercent ?? 0;
  if (discount <= 0) return base;
  return Math.round(base * (1 - discount / 100) * 100) / 100;
}

export function daysUntilRenewalAt(m: Merchant, nowMs: number): number {
  const ms = new Date(m.subscription.endDate).getTime() - nowMs;
  return Math.floor(ms / 86_400_000);
}

/**
 * @deprecated Use daysUntilRenewalAt with a useNow() value.
 */
export function daysUntilRenewal(m: Merchant): number {
  return daysUntilRenewalAt(m, Date.now());
}