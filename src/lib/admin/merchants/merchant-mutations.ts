import type { Merchant } from "@/lib/admin/types/merchant";
import type { MerchantSubscriptionStatus } from "@/lib/admin/types/merchant";
import type { PlanCode, SubscriptionPlan } from "@/config/subscription-plans";
import { getPlanByCode } from "@/config/subscription-plans";
import {
  applyMerchantPatch,
  addMerchantToStore,
} from "@/lib/admin/mock/merchant-store";

export interface MerchantActor {
  name: string;
  email: string;
}

export interface MerchantMutationResult {
  ok: boolean;
  merchant?: Merchant;
  error?: string;
}

/* ------------------------------ Internals ----------------------------- */

function makeActivityId(): string {
  return "MA-" + crypto.randomUUID();
}

function makeAuditId(): string {
  return "AT-" + crypto.randomUUID();
}

function withLogsAndPatch(
  current: Merchant,
  action: string,
  actor: MerchantActor,
  patch: Partial<Merchant>
): Merchant {
  return {
    ...current,
    ...patch,
    activityLog: [
      ...current.activityLog,
      {
        id: makeActivityId(),
        timestamp: new Date().toISOString(),
        action,
      },
    ],
    auditTrail: [
      ...(current.auditTrail ?? []),
      {
        id: makeAuditId(),
        timestamp: new Date().toISOString(),
        admin: actor.email,
        action,
      },
    ],
  };
}

function priceForPlan(
  plan: SubscriptionPlan,
  billingCycle: "monthly" | "annual"
): number {
  const raw =
    billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const match = raw.match(/[\d,]+(\.\d+)?/);
  if (!match) return 0;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/* ------------------------------ Mutations ----------------------------- */

export function changeSubscriptionPlan(
  merchantId: string,
  planCode: PlanCode,
  actor: MerchantActor
): MerchantMutationResult {
  const plan = getPlanByCode(planCode);
  if (!plan || plan.code !== planCode) {
    return { ok: false, error: "Plan not found." };
  }

  const result = applyMerchantPatch(merchantId, (m) => {
    if (m.subscription.planId === planCode) return m;
    const previousPlanName = getPlanByCode(m.subscription.planId).name;
    const amountPaid =
      plan.code === "enterprise"
        ? m.subscription.amountPaid
        : priceForPlan(plan, m.subscription.billingCycle);
    return withLogsAndPatch(
      m,
      "Changed plan from " + previousPlanName + " to " + plan.name,
      actor,
      {
        subscription: {
          ...m.subscription,
          planId: planCode,
          amountPaid,
        },
      }
    );
  });

  return result
    ? { ok: true, merchant: result }
    : { ok: false, error: "Merchant not found." };
}

export function applySubscriptionDiscount(
  merchantId: string,
  discountPercent: number,
  actor: MerchantActor
): MerchantMutationResult {
  if (!Number.isFinite(discountPercent)) {
    return { ok: false, error: "Discount must be a number." };
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return { ok: false, error: "Discount must be between 0 and 100." };
  }

  const result = applyMerchantPatch(merchantId, (m) => {
    const previous = m.subscription.discountPercent ?? 0;
    if (previous === discountPercent) return m;
    const direction = discountPercent === 0 ? "Removed discount" : "Applied " + discountPercent + "% discount";
    return withLogsAndPatch(m, direction, actor, {
      subscription: {
        ...m.subscription,
        discountPercent: discountPercent === 0 ? undefined : discountPercent,
      },
    });
  });

  return result
    ? { ok: true, merchant: result }
    : { ok: false, error: "Merchant not found." };
}

export function cancelSubscription(
  merchantId: string,
  reason: string,
  actor: MerchantActor
): MerchantMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }

  const result = applyMerchantPatch(merchantId, (m) => {
    if (m.subscription.status === "cancelled") return m;
    return withLogsAndPatch(
      m,
      "Subscription cancelled: " + trimmed,
      actor,
      {
        subscription: {
          ...m.subscription,
          status: "cancelled" as MerchantSubscriptionStatus,
        },
      }
    );
  });

  return result
    ? { ok: true, merchant: result }
    : { ok: false, error: "Merchant not found." };
}

export function reactivateSubscription(
  merchantId: string,
  actor: MerchantActor
): MerchantMutationResult {
  const result = applyMerchantPatch(merchantId, (m) => {
    if (m.subscription.status === "active") return m;
    return withLogsAndPatch(m, "Subscription reactivated", actor, {
      subscription: {
        ...m.subscription,
        status: "active" as MerchantSubscriptionStatus,
      },
    });
  });

  return result
    ? { ok: true, merchant: result }
    : { ok: false, error: "Merchant not found." };
}

/* ------------------------------ Onboarding ---------------------------- */

export interface OnboardMerchantInput {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  planCode: PlanCode;
  billingCycle: "monthly" | "annual";
  storeName: string;
  templateId: string;
}

export function onboardMerchant(
  input: OnboardMerchantInput,
  actor: MerchantActor
): Merchant {
  const plan = getPlanByCode(input.planCode);
  const nowIso = new Date().toISOString();
  const endMs =
    input.billingCycle === "annual"
      ? Date.now() + 86_400_000 * 365
      : Date.now() + 86_400_000 * 30;
  const amountPaid =
    plan.code === "enterprise"
      ? 0
      : priceForPlan(plan, input.billingCycle);

  const merchant: Merchant = {
    id: "MER-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
    businessName: input.businessName,
    contactPerson: input.contactPerson,
    email: input.email,
    phone: input.phone,
    storeConfig: {
      storeName: input.storeName,
      slug: input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      primaryColor: "#166e59",
      accentColor: "#ffa000",
      templateId: input.templateId,
      subdomain: input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".atlas.store",
    },
    subscription: {
      planId: input.planCode,
      status: "active",
      startDate: nowIso,
      endDate: new Date(endMs).toISOString(),
      billingCycle: input.billingCycle,
      amountPaid,
      lastPaymentDate: nowIso,
    },
    verificationStatus: "pending",
    merchantStatus: "pending",
    storeStatus: "draft",
    totalOrders: 0,
    totalRevenue: 0,
    lastActive: nowIso,
    createdAt: nowIso,
    walletBalance: 0,
    walletTransactions: [],
    activityLog: [
      {
        id: makeActivityId(),
        timestamp: nowIso,
        action: "Account created",
      },
    ],
    auditTrail: [
      {
        id: makeAuditId(),
        timestamp: nowIso,
        admin: actor.email,
        action: "Created merchant account",
      },
    ],
  };

  addMerchantToStore(merchant);
  return merchant;
}