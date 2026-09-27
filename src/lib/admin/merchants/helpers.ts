/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/admin/merchants/helpers.ts

import type {
  Merchant,
  MerchantActivityEntry,
  MerchantAuditEntry,
  MerchantPlanLimitsExceeded,
  MerchantSubscriptionPlanId,
} from "@/lib/admin/types/merchant";
import type { CurrentAdmin } from "@/lib/admin/rbac";
import { getPlanByCode } from "@/lib/domains/subscriptions";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";

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
  fromPlan: MerchantSubscriptionPlanId | null;
  toPlan: MerchantSubscriptionPlanId | null;
  fromMrr: number;
  toMrr: number;
  mrrDelta: number;
  limitsExceeded: MerchantPlanLimitsExceeded;
  blockingIssues: string[];
}

function planMonthly(mrr: number | "custom"): number {
  return typeof mrr === "number" ? mrr : 0;
}

function planAnnual(annual: number | "custom"): number {
  return typeof annual === "number" ? annual : 0;
}

export function planChangeImpact(
  merchant: Merchant,
  toCode: MerchantSubscriptionPlanId
): PlanChangeImpact {
  const fromPlan: SubscriptionPlan | undefined = getPlanByCode(
    merchant.subscription.planId
  );
  const toPlan: SubscriptionPlan | undefined = getPlanByCode(toCode);

  // Custom-priced plans fall back to the negotiated contract.
  const fromMrr =
    fromPlan && typeof fromPlan.monthlyPriceGHS === "string"
      ? merchant.contractMrr ?? 0
      : fromPlan
      ? planMonthly(fromPlan.monthlyPriceGHS)
      : 0;

  const toMrr =
    toPlan && typeof toPlan.monthlyPriceGHS === "string"
      ? 0
      : toPlan
      ? planMonthly(toPlan.monthlyPriceGHS)
      : 0;

  // Upgrade / downgrade derives from sortOrder. Reordering plans in the
  // editor changes which moves count as upgrades.
  const fromSort = fromPlan?.sortOrder ?? 0;
  const toSort = toPlan?.sortOrder ?? 0;

  const direction: PlanChangeDirection =
    toSort > fromSort
      ? "upgrade"
      : toSort < fromSort
      ? "downgrade"
      : "sidegrade";

  const limitsExceeded: MerchantPlanLimitsExceeded = {};
  const blockingIssues: string[] = [];

  if (toPlan && fromPlan) {
    const toMax = toPlan.maxProducts;
    const fromMax = fromPlan.maxProducts;

    const toIsFinite = typeof toMax === "number";
    const fromIsFinite = typeof fromMax === "number";

    const isTighter =
      toIsFinite &&
      (!fromIsFinite || (fromIsFinite && toMax < (fromMax as number)));

    if (isTighter && merchant.totalOrders > (toMax as number)) {
      limitsExceeded.products = true;
      blockingIssues.push(
        "This merchant has " +
          merchant.totalOrders.toLocaleString("en-GH") +
          " orders, above the new plan's " +
          (toMax as number).toLocaleString("en-GH") +
          " product limit."
      );
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