import type { MerchantSubscription } from "@/lib/admin/types/ecommerce";
import type { SubscriptionPlan } from "@/config/subscription-plans";
import {
  BILLING_CYCLE_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
} from "./subscription-labels";
import { effectiveMrr } from "./subscription-projection";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function subscriptionsToCsv(
  subscriptions: MerchantSubscription[],
  plans: SubscriptionPlan[]
): string {
  const planByCode = new Map(plans.map((p) => [p.code, p]));

  const header = [
    "subscriptionId",
    "merchantId",
    "merchantName",
    "planCode",
    "planName",
    "status",
    "billingCycle",
    "amountPaid",
    "currency",
    "discountPercent",
    "startDate",
    "endDate",
    "lastPaymentDate",
    "mrrContribution",
  ];

  const body = subscriptions.map((s) => {
    const plan = planByCode.get(s.planCode);
    return [
      s.id,
      s.merchantId,
      s.merchantName,
      s.planCode,
      s.planName,
      SUBSCRIPTION_STATUS_LABEL[s.status],
      BILLING_CYCLE_LABEL[s.billingCycle],
      s.amountPaid,
      s.currency,
      s.discountPercent ?? "",
      s.startDate,
      s.endDate,
      s.lastPaymentDate,
      Math.round(effectiveMrr(s, plan)),
    ];
  });

  return rowsToCsv(header, body);
}