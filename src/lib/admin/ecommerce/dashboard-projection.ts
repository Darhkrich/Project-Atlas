import type { Merchant } from "@/lib/admin/types/merchant";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import {
  planCodeLabelFor,
  type ActivityKind,
} from "./dashboard-labels";
import { formatCurrency } from "@/lib/admin/formatters";

/* ------------------------------ Types --------------------------------- */

export interface EcommerceSummary {
  totalMerchants: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  mrr: number;
  totalOrders: number;
  totalSalesVolume: number;
}

export interface PlanDistributionPoint {
  code: string;
  plan: string;
  count: number;
}

export interface TopMerchantRow {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  planName: string;
  href: string;
}

export interface TemplateRevenuePoint {
  template: string;
  revenue: number;
  merchantCount: number;
}

export interface RecentActivityItem {
  id: string;
  kind: ActivityKind;
  description: string;
  timestamp: string;
  merchantId: string;
  merchantName: string;
  href: string;
}

/* ------------------------------ Pricing ------------------------------- */

function isCustomPriced(plan: SubscriptionPlan): boolean {
  return typeof plan.monthlyPriceGHS === "string";
}

/**
 * Effective MRR contribution for a merchant. Only active subscriptions
 * contribute. Past due, expired, and cancelled contribute zero.
 * Custom-priced plans contribute their negotiated contract amount.
 */
export function effectiveMrr(
  merchant: Merchant,
  plan: SubscriptionPlan
): number {
  if (merchant.subscription.status !== "active") return 0;

  if (isCustomPriced(plan)) {
    return merchant.contractMrr ?? 0;
  }

  const monthly =
    plan.monthlyPriceGHS === "custom" ? 0 : plan.monthlyPriceGHS;
  const annual =
    plan.annualPriceGHS === "custom" ? 0 : plan.annualPriceGHS;

  if (merchant.subscription.billingCycle === "annual") {
    return annual / 12;
  }
  return monthly;
}

/* ------------------------------ Summary ------------------------------- */

export function projectEcommerceSummary(
  merchants: Merchant[],
  plans: SubscriptionPlan[]
): EcommerceSummary {
  const planByCode = new Map(plans.map((p) => [p.code, p]));

  let active = 0;
  let pastDue = 0;
  let mrr = 0;
  let orders = 0;
  let volume = 0;

  for (const m of merchants) {
    if (m.subscription.status === "active") active += 1;
    if (m.subscription.status === "past_due") pastDue += 1;
    const plan = planByCode.get(m.subscription.planId);
    if (plan) mrr += effectiveMrr(m, plan);
    orders += m.totalOrders;
    volume += m.totalRevenue;
  }

  return {
    totalMerchants: merchants.length,
    activeSubscriptions: active,
    pastDueSubscriptions: pastDue,
    mrr: Math.round(mrr),
    totalOrders: orders,
    totalSalesVolume: volume,
  };
}

/* --------------------------- Plan distribution ------------------------ */

export function projectPlanDistribution(
  merchants: Merchant[],
  plans: SubscriptionPlan[]
): PlanDistributionPoint[] {
  const counts = new Map<string, number>();
  for (const plan of plans) counts.set(plan.code, 0);

  for (const m of merchants) {
    const code = m.subscription.planId;
    if (!counts.has(code)) continue;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  return plans.map((p) => ({
    code: p.code,
    plan: planCodeLabelFor(p.code),
    count: counts.get(p.code) ?? 0,
  }));
}

/* --------------------------- Top merchants ---------------------------- */

export function projectTopMerchants(
  merchants: Merchant[],
  plans: SubscriptionPlan[],
  limit: number
): TopMerchantRow[] {
  const planByCode = new Map(plans.map((p) => [p.code, p]));

  return [...merchants]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
    .map((m) => {
      const plan = planByCode.get(m.subscription.planId);
      return {
        id: m.id,
        name: m.businessName,
        revenue: m.totalRevenue,
        orders: m.totalOrders,
        planName: plan ? plan.name : m.subscription.planId,
        href: "/admin/ecommerce/merchants/" + m.id,
      };
    });
}

/* ------------------------ Revenue by template ------------------------- */

export function projectRevenueByTemplate(
  merchants: Merchant[]
): TemplateRevenuePoint[] {
  const map = new Map<string, TemplateRevenuePoint>();
  for (const m of merchants) {
    const tpl = m.storeConfig.templateId;
    const existing = map.get(tpl);
    if (existing) {
      existing.revenue += m.totalRevenue;
      existing.merchantCount += 1;
    } else {
      map.set(tpl, {
        template: tpl,
        revenue: m.totalRevenue,
        merchantCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

/* --------------------------- Recent activity -------------------------- */

export function projectRecentActivity(
  merchants: Merchant[],
  limit: number
): RecentActivityItem[] {
  const out: RecentActivityItem[] = [];

  for (const m of merchants) {
    const href = "/admin/ecommerce/merchants/" + m.id;

    for (const entry of m.activityLog) {
      out.push({
        id: m.id + "-a-" + entry.id,
        kind: "activity",
        description: entry.action,
        timestamp: entry.timestamp,
        merchantId: m.id,
        merchantName: m.businessName,
        href,
      });
    }

    for (const entry of m.auditTrail ?? []) {
      out.push({
        id: m.id + "-aud-" + entry.id,
        kind: "admin",
        description: entry.action,
        timestamp: entry.timestamp,
        merchantId: m.id,
        merchantName: m.businessName,
        href,
      });
    }

    for (const order of m.recentOrders ?? []) {
      out.push({
        id: m.id + "-ord-" + order.id,
        kind: "order",
        description:
          "Order " +
          order.id +
          " placed \u00B7 " +
          formatCurrency(order.total),
        timestamp: order.date,
        merchantId: m.id,
        merchantName: m.businessName,
        href,
      });
    }
  }

  return out
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
}