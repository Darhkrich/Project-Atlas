// lib/admin/merchants/helpers.ts

import { subscriptionPlans } from "@/config/subscription-plans";
import type {
  Merchant,
  MerchantActivityEntry,
  MerchantAuditEntry,
  MerchantPlanLimitsExceeded,
  SubscriptionPlan,
} from "@/lib/admin/types/merchant";
import type { CurrentAdmin } from "@/lib/admin/rbac";

/* ------------------------------ Audit helpers -------------------------- */

export function buildAuditEntry(input: {
  admin: CurrentAdmin;
  action: string;
}): MerchantAuditEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    admin: input.admin.email,
    action: input.action,
  };
}

export function appendAuditTrail(
  merchant: Merchant,
  entry: MerchantAuditEntry
): MerchantAuditEntry[] {
  return [...(merchant.auditTrail ?? []), entry];
}

export function appendActivity(
  merchant: Merchant,
  action: string
): MerchantActivityEntry[] {
  return [
    ...merchant.activityLog,
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
    },
  ];
}

/* ------------------------------ Renewal -------------------------------- */

export function daysUntilRenewalAt(merchant: Merchant, now: number): number {
  const end = new Date(merchant.subscription.endDate).getTime();
  return Math.floor((end - now) / 86_400_000);
}

export type RenewalTone = "danger" | "warning" | "neutral";

export function renewalTone(days: number): RenewalTone {
  if (days < 0) return "danger";
  if (days <= 7) return "danger";
  if (days <= 14) return "warning";
  return "neutral";
}

export function formatRenewalLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Renews today";
  if (days === 1) return "Renews tomorrow";
  return `Renews in ${days}d`;
}

/* ------------------------------ Plan change ---------------------------- */

export type PlanChangeDirection = "upgrade" | "downgrade" | "sidegrade";

export interface PlanChangeImpact {
  direction: PlanChangeDirection;
  fromPlan: SubscriptionPlan | null;
  toPlan: SubscriptionPlan | null;
  fromMrr: number;
  toMrr: number;
  mrrDelta: number;
  limitsExceeded: MerchantPlanLimitsExceeded;
  blockingIssues: string[];
}

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  starter: 0,
  growth: 1,
  pro: 2,
  enterprise: 3,
};

function planByCode(code: SubscriptionPlan) {
  return subscriptionPlans.find((p) => p.code === code) ?? null;
}

function parseGhsString(value: string): number {
  const match = value.match(/[\d,]+/);
  if (!match) return Number.POSITIVE_INFINITY;
  return parseFloat(match[0].replace(/,/g, ""));
}

export function planChangeImpact(
  merchant: Merchant,
  toCode: SubscriptionPlan
): PlanChangeImpact {
  const fromPlan = planByCode(merchant.subscription.planId);
  const toPlan = planByCode(toCode);

  const fromMrr =
    merchant.subscription.planId === "enterprise"
      ? merchant.contractMrr ?? 0
      : fromPlan
      ? parseGhsString(fromPlan.monthlyPrice)
      : 0;

  const toMrr =
    toCode === "enterprise"
      ? 0
      : toPlan
      ? parseGhsString(toPlan.monthlyPrice)
      : 0;

  const direction: PlanChangeDirection =
    PLAN_RANK[toCode] > PLAN_RANK[merchant.subscription.planId]
      ? "upgrade"
      : PLAN_RANK[toCode] < PLAN_RANK[merchant.subscription.planId]
      ? "downgrade"
      : "sidegrade";

  const limitsExceeded: MerchantPlanLimitsExceeded = {};
  const blockingIssues: string[] = [];

  if (toPlan && fromPlan) {
    if (
      toPlan.maxProducts < fromPlan.maxProducts &&
      merchant.totalOrders > toPlan.maxProducts &&
      toPlan.maxProducts !== Infinity
    ) {
      limitsExceeded.products = true;
      blockingIssues.push(
        `This merchant exceeds the new plan's ${toPlan.maxProducts.toLocaleString(
          "en-GH"
        )} product limit.`
      );
    }

    const toTransactionLimit = parseGhsString(toPlan.maxMonthlyTransactions);
    const fromTransactionLimit = parseGhsString(
      fromPlan.maxMonthlyTransactions
    );
    if (
      toTransactionLimit < fromTransactionLimit &&
      toTransactionLimit !== Infinity
    ) {
      limitsExceeded.transactions = true;
    }
  }

  return {
    direction,
    fromPlan: merchant.subscription.planId,
    toPlan: toCode,
    fromMrr,
    toMrr,
    mrrDelta: toMrr - fromMrr,
    limitsExceeded,
    blockingIssues,
  };
}

/* ------------------------------ Storefront ----------------------------- */

export function storeUrlFor(merchant: Merchant): string {
  if (merchant.storeConfig.customDomain) {
    return `https://${merchant.storeConfig.customDomain}`;
  }
  return `https://${merchant.storeConfig.subdomain}`;
}

export function domainTypeFor(merchant: Merchant): "custom" | "subdomain" {
  return merchant.storeConfig.customDomain ? "custom" : "subdomain";
}

export function templateLabel(templateId: string): string {
  const map: Record<string, string> = {
    "tpl-general-store": "General Store",
    "tpl-cosmetics-luxe": "Cosmetics Luxe",
    "tpl-fashion-modern": "Fashion Modern",
  };
  return map[templateId] ?? templateId;
}