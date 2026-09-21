import type {
  MerchantSubscription,
  SubscriptionStatus,
} from "@/lib/admin/types/ecommerce";
import type { Merchant } from "@/lib/admin/types/merchant";
import type { SubscriptionPlan } from "@/config/subscription-plans";

/* ------------------------------ Pricing ------------------------------- */

export function parsePrice(value: string): number | null {
  const match = value.match(/[\d,]+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function effectivePlanPrice(
  subscription: MerchantSubscription,
  plan: SubscriptionPlan | undefined
): number {
  if (!plan) return subscription.amountPaid;
  if (plan.code === "enterprise") return subscription.amountPaid;
  const base =
    subscription.billingCycle === "annual"
      ? parsePrice(plan.annualPrice)
      : parsePrice(plan.monthlyPrice);
  return base ?? subscription.amountPaid;
}

/**
 * Monthly recurring revenue contribution. Active subscriptions count at
 * their effective monthly price after discount. Annual is divided by 12.
 * Past due, cancelled, and expired contribute zero.
 */
export function effectiveMrr(
  subscription: MerchantSubscription,
  plan: SubscriptionPlan | undefined
): number {
  if (subscription.status !== "active") return 0;
  const discount = subscription.discountPercent ?? 0;
  const factor = 1 - discount / 100;
  if (plan?.code === "enterprise") {
    return subscription.amountPaid * factor;
  }
  const cyclePrice = effectivePlanPrice(subscription, plan);
  if (subscription.billingCycle === "annual") {
    return (cyclePrice * factor) / 12;
  }
  return cyclePrice * factor;
}

/* ------------------------------ Projection ---------------------------- */

export function projectSubscriptions(
  merchants: Merchant[],
  plans: SubscriptionPlan[]
): MerchantSubscription[] {
  const planByCode = new Map(plans.map((p) => [p.code, p]));

  return merchants.map((m) => {
    const plan = planByCode.get(m.subscription.planId);
    const planName = plan?.name ?? m.subscription.planId;
    return {
      id: "SUB-" + m.id,
      merchantId: m.id,
      merchantName: m.businessName,
      planCode: m.subscription.planId,
      planName,
      status: m.subscription.status as SubscriptionStatus,
      startDate: m.subscription.startDate,
      endDate: m.subscription.endDate,
      billingCycle: m.subscription.billingCycle,
      amountPaid: m.subscription.amountPaid,
      lastPaymentDate: m.subscription.lastPaymentDate,
      currency: "GHS",
      discountPercent: m.subscription.discountPercent,
      nextBillingDate: m.subscription.endDate,
    };
  });
}

/* ------------------------------ Summary ------------------------------- */

export interface SubscriptionSummary {
  total: number;
  active: number;
  pastDue: number;
  cancelled: number;
  expired: number;
  mrr: number;
  currency: string;
}

export function projectSubscriptionSummary(
  subscriptions: MerchantSubscription[],
  plans: SubscriptionPlan[]
): SubscriptionSummary {
  const planByCode = new Map(plans.map((p) => [p.code, p]));
  let active = 0;
  let pastDue = 0;
  let cancelled = 0;
  let expired = 0;
  let mrr = 0;

  for (const s of subscriptions) {
    if (s.status === "active") active += 1;
    else if (s.status === "past_due") pastDue += 1;
    else if (s.status === "cancelled") cancelled += 1;
    else if (s.status === "expired") expired += 1;
    mrr += effectiveMrr(s, planByCode.get(s.planCode));
  }

  return {
    total: subscriptions.length,
    active,
    pastDue,
    cancelled,
    expired,
    mrr: Math.round(mrr),
    currency: "GHS",
  };
}

/* ------------------------------ Filters ------------------------------- */

export interface SubscriptionFilters {
  q: string;
  status: string;
  plan: string;
  billingCycle: string;
}

export function filterSubscriptions(
  subscriptions: MerchantSubscription[],
  filters: SubscriptionFilters
): MerchantSubscription[] {
  const q = filters.q.trim().toLowerCase();
  return subscriptions.filter((s) => {
    if (q) {
      const hay = (s.merchantName + " " + s.merchantId + " " + s.id).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.status && s.status !== filters.status) return false;
    if (filters.plan && s.planCode !== filters.plan) return false;
    if (filters.billingCycle && s.billingCycle !== filters.billingCycle) {
      return false;
    }
    return true;
  });
}

/* ------------------------------ Sorting ------------------------------- */

const STATUS_WEIGHT: Record<SubscriptionStatus, number> = {
  past_due: 0,
  expired: 1,
  active: 2,
  cancelled: 3,
};

export function sortSubscriptions(
  subscriptions: MerchantSubscription[]
): MerchantSubscription[] {
  return [...subscriptions].sort((a, b) => {
    const wa = STATUS_WEIGHT[a.status];
    const wb = STATUS_WEIGHT[b.status];
    if (wa !== wb) return wa - wb;
    return a.merchantName.localeCompare(b.merchantName);
  });
}

/* ------------------------------ Helpers ------------------------------- */

export function isAtRisk(subscription: MerchantSubscription): boolean {
  return (
    subscription.status === "past_due" ||
    subscription.status === "expired"
  );
}

export function countAtRisk(
  subscriptions: MerchantSubscription[]
): number {
  return subscriptions.filter(isAtRisk).length;
}