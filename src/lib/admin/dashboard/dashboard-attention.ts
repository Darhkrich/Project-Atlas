import type { Customer } from "@/lib/admin/types/customer";
import type { Merchant } from "@/lib/admin/types/merchant";
import type { Reseller } from "@/lib/admin/types/reseller";
import type {
  DisputeEvent,
  MerchantWalletTransaction,
  DunningEvent,
} from "@/lib/admin/types/merchant-money";
import type {
  MerchantMoneyStoreState,
  MerchantWalletLedgerEntry,
} from "@/lib/domains/wallet/merchant-money/types";
import type { ResellerWalletStoreState } from "@/lib/reseller/types/wallet";
import type { Permission } from "@/lib/admin/rbac";
import { PERMISSIONS } from "@/lib/admin/rbac";
import {
  DASHBOARD_ATTENTION_THRESHOLDS,
  type DashboardAttentionSeverity,
} from "./dashboard-constants";

export type AttentionCategory =
  | "merchant_billing"
  | "merchant_status"
  | "merchant_verification"
  | "reseller_status"
  | "reseller_verification"
  | "reseller_overdrawn"
  | "customer_risk"
  | "withdrawal"
  | "dispute"
  | "refund"
  | "plan_charge"
  | "treasury_coverage"
  | "provider_health"
  | "support_ticket"
  | "order_retry";

export interface AttentionItem {
  id: string;
  severity: DashboardAttentionSeverity;
  category: AttentionCategory;
  title: string;
  detail: string;
  href: string;
  occurredAt: string;
  requiresPermission: Permission;
}

export interface AttentionInput {
  customers: Customer[];
  resellers: Reseller[];
  merchants: Merchant[];
  merchantMoneyStore: MerchantMoneyStoreState;
  merchantOverlay: {
    walletTransactions: MerchantWalletTransaction[];
    disputes: DisputeEvent[];
    dunning: DunningEvent[];
  };
  resellerWalletState: ResellerWalletStoreState;
  supportTicketSummary?: {
    unassigned: number;
    pastSla: number;
    escalatedToMe: number;
  };
  providerHealth?: {
    degraded: number;
    unhealthy: number;
  };
  orderRetryBacklog?: number;
  treasuryFreeCash?: number | null;
  treasuryLiabilities?: number | null;
}

function safeNumber(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  return value;
}

function eachMerchantState(
  store: MerchantMoneyStoreState
): Array<{
  merchantId: string;
  state: MerchantMoneyStoreState[string];
}> {
  const out: Array<{
    merchantId: string;
    state: MerchantMoneyStoreState[string];
  }> = [];
  for (const merchantId of Object.keys(store)) {
    const state = store[merchantId];
    if (!state) continue;
    out.push({ merchantId, state });
  }
  return out;
}

function eachLedgerEntry(
  store: MerchantMoneyStoreState,
  match: (e: MerchantWalletLedgerEntry) => boolean
): Array<{ merchantId: string; entry: MerchantWalletLedgerEntry }> {
  const out: Array<{
    merchantId: string;
    entry: MerchantWalletLedgerEntry;
  }> = [];
  for (const { merchantId, state } of eachMerchantState(store)) {
    for (const entry of state.ledger) {
      if (match(entry)) out.push({ merchantId, entry });
    }
  }
  return out;
}

export function computeAttentionItems(
  input: AttentionInput
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const thresholds = DASHBOARD_ATTENTION_THRESHOLDS;

  /* ---------------------- Treasury coverage ------------------------ */

  if (
    input.treasuryFreeCash !== undefined &&
    input.treasuryFreeCash !== null &&
    input.treasuryLiabilities !== undefined &&
    input.treasuryLiabilities !== null &&
    input.treasuryLiabilities > 0
  ) {
    const ratio = input.treasuryFreeCash / input.treasuryLiabilities;
    if (ratio < 0) {
      items.push({
        id: "att-treasury-below",
        severity: "critical",
        category: "treasury_coverage",
        title: "Treasury below liabilities",
        detail:
          "Free cash at " +
          (ratio * 100).toFixed(1) +
          "% of liabilities",
        href: "/admin/treasury",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.TREASURY_VIEW,
      });
    } else if (ratio < 0.25) {
      items.push({
        id: "att-treasury-floor",
        severity: "high",
        category: "treasury_coverage",
        title: "Treasury below reserve floor",
        detail:
          "Free cash at " +
          (ratio * 100).toFixed(1) +
          "% of liabilities. Floor is 25%.",
        href: "/admin/treasury",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.TREASURY_VIEW,
      });
    }
  }

  /* ---------------------- Merchant billing ------------------------- */

  for (const m of input.merchants) {
    if (
      m.subscription.status === "past_due" ||
      m.subscription.status === "expired"
    ) {
      items.push({
        id: "att-merchant-billing-" + m.id,
        severity: "critical",
        category: "merchant_billing",
        title: m.businessName,
        detail:
          m.subscription.status === "past_due"
            ? "Payment overdue - " + m.subscription.planId + " plan"
            : "Subscription expired - " + m.subscription.planId + " plan",
        href: "/admin/ecommerce/merchants/" + m.id,
        occurredAt: m.subscription.endDate,
        requiresPermission: PERMISSIONS.MERCHANTS_VIEW,
      });
    }
  }

  for (const m of input.merchants) {
    if (m.merchantStatus === "active" && m.storeStatus === "disabled") {
      items.push({
        id: "att-merchant-store-" + m.id,
        severity: "high",
        category: "merchant_status",
        title: m.businessName,
        detail: "Storefront disabled while merchant is active",
        href: "/admin/ecommerce/merchants/" + m.id,
        occurredAt: m.lastActive,
        requiresPermission: PERMISSIONS.MERCHANTS_VIEW,
      });
    }
  }

  for (const m of input.merchants) {
    if (m.verificationStatus === "pending" && m.storeStatus === "live") {
      items.push({
        id: "att-merchant-verify-" + m.id,
        severity: "medium",
        category: "merchant_verification",
        title: m.businessName,
        detail: "Verification pending, storefront already live",
        href: "/admin/ecommerce/merchants/" + m.id,
        occurredAt: m.createdAt,
        requiresPermission: PERMISSIONS.MERCHANTS_VIEW,
      });
    }
  }

  /* ---------------------- Reseller status ------------------------- */

  for (const r of input.resellers) {
    if (r.status === "suspended") {
      items.push({
        id: "att-reseller-susp-" + r.id,
        severity: "high",
        category: "reseller_status",
        title: r.businessName,
        detail: "Account suspended",
        href: "/admin/resellers/" + r.id,
        occurredAt: r.lastActive,
        requiresPermission: PERMISSIONS.RESELLERS_VIEW,
      });
    }
  }

  for (const r of input.resellers) {
    if (
      r.verificationStatus === "pending" ||
      r.verificationStatus === "rejected"
    ) {
      items.push({
        id: "att-reseller-verify-" + r.id,
        severity:
          r.verificationStatus === "rejected" ? "high" : "medium",
        category: "reseller_verification",
        title: r.businessName,
        detail:
          r.verificationStatus === "rejected"
            ? "Verification rejected"
            : "Verification pending",
        href: "/admin/resellers/" + r.id,
        occurredAt: r.joinedAt,
        requiresPermission: PERMISSIONS.RESELLERS_VIEW,
      });
    }
  }

  const resellerWallets = input.resellerWalletState.wallets;
  if (resellerWallets) {
    for (const r of input.resellers) {
      const wallet = resellerWallets[r.id];
      if (!wallet) continue;
      if (wallet.balance < 0) {
        items.push({
          id: "att-reseller-overdrawn-" + r.id,
          severity: "critical",
          category: "reseller_overdrawn",
          title: r.businessName,
          detail:
            "Wallet is overdrawn by GH\u20B5 " +
            Math.abs(wallet.balance).toLocaleString("en-GH"),
          href: "/admin/resellers/" + r.id,
          occurredAt: wallet.updatedAt,
          requiresPermission: PERMISSIONS.RESELLERS_VIEW,
        });
      }
    }
  }

  /* ---------------------- Customer risk --------------------------- */

  for (const c of input.customers) {
    if (c.riskLevel === "high") {
      items.push({
        id: "att-customer-risk-" + c.id,
        severity: "high",
        category: "customer_risk",
        title: c.name,
        detail: "Risk score " + c.riskScore + " - " + c.riskLevel,
        href: "/admin/customers/" + c.id,
        occurredAt: c.lastActive,
        requiresPermission: PERMISSIONS.CUSTOMERS_VIEW,
      });
    }
  }

  /* ---------------------- Withdrawals ----------------------------- */

  for (const { merchantId, state } of eachMerchantState(
    input.merchantMoneyStore
  )) {
    for (const w of state.withdrawalRequests) {
      if (w.status !== "pending_admin") continue;
      const merchant = input.merchants.find((m) => m.id === merchantId);
      items.push({
        id: "att-withdrawal-" + w.id,
        severity:
          w.total > thresholds.refundValueGHS ? "critical" : "high",
        category: "withdrawal",
        title: merchant?.businessName ?? merchantId,
        detail:
          "Withdrawal GH\u20B5 " +
          w.total.toLocaleString() +
          " awaiting approval",
        href: "/admin/payments",
        occurredAt: w.requestedAt,
        requiresPermission: PERMISSIONS.PAYMENTS_WITHDRAWALS_APPROVE,
      });
    }
  }

  /* ---------------------- Disputes -------------------------------- */

  for (const d of input.merchantOverlay.disputes) {
    if (d.status !== "open") continue;
    const merchant = input.merchants.find((m) => m.id === d.merchantId);
    items.push({
      id: "att-dispute-" + d.id,
      severity: "high",
      category: "dispute",
      title: merchant?.businessName ?? d.merchantId,
      detail: "Open dispute - " + d.type.replace(/_/g, " "),
      href: "/admin/ecommerce/payments",
      occurredAt: d.openedAt,
      requiresPermission: PERMISSIONS.ECOMMERCE_PAYMENTS_VIEW,
    });
  }

  /* ---------------------- Refunds --------------------------------- */

  for (const { merchantId, entry } of eachLedgerEntry(
    input.merchantMoneyStore,
    (e) => e.kind === "refund" && !e.settledAt
  )) {
    const merchant = input.merchants.find((m) => m.id === merchantId);
    items.push({
      id: "att-refund-" + entry.id,
      severity: "medium",
      category: "refund",
      title: merchant?.businessName ?? merchantId,
      detail:
        "Refund GH\u20B5 " +
        entry.amount.toLocaleString() +
        " not yet settled",
      href: "/admin/ecommerce/payments",
      occurredAt: entry.createdAt,
      requiresPermission: PERMISSIONS.ECOMMERCE_PAYMENTS_VIEW,
    });
  }

  /* ---------------------- Failed plan charges --------------------- */

  for (const { merchantId, entry } of eachLedgerEntry(
    input.merchantMoneyStore,
    (e) => e.kind === "plan_charge" && e.status === "failed"
  )) {
    const merchant = input.merchants.find((m) => m.id === merchantId);
    const failure =
      entry.kind === "plan_charge" ? entry.failureReason : undefined;
    items.push({
      id: "att-plancharge-" + entry.id,
      severity: "medium",
      category: "plan_charge",
      title: merchant?.businessName ?? merchantId,
      detail:
        "Plan charge failed - " +
        (failure?.replace(/_/g, " ") ?? "unknown reason"),
      href: "/admin/ecommerce/payments",
      occurredAt: entry.createdAt,
      requiresPermission: PERMISSIONS.ECOMMERCE_PAYMENTS_VIEW,
    });
  }

  /* ---------------------- Provider health ------------------------- */

  if (input.providerHealth) {
    if (input.providerHealth.unhealthy > 0) {
      items.push({
        id: "att-provider-unhealthy",
        severity: "critical",
        category: "provider_health",
        title:
          input.providerHealth.unhealthy +
          " provider" +
          (input.providerHealth.unhealthy === 1 ? "" : "s") +
          " unhealthy",
        detail: "Live orders may be failing on these providers.",
        href: "/admin/providers",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.PROVIDERS_VIEW,
      });
    }
    if (input.providerHealth.degraded > 0) {
      items.push({
        id: "att-provider-degraded",
        severity: "high",
        category: "provider_health",
        title:
          input.providerHealth.degraded +
          " provider" +
          (input.providerHealth.degraded === 1 ? "" : "s") +
          " degraded",
        detail: "Elevated failure rate on these providers.",
        href: "/admin/providers",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.PROVIDERS_VIEW,
      });
    }
  }

  /* ---------------------- Support tickets ------------------------- */

  if (input.supportTicketSummary) {
    const s = input.supportTicketSummary;
    if (s.pastSla > 0) {
      items.push({
        id: "att-support-sla",
        severity: "critical",
        category: "support_ticket",
        title: s.pastSla + " tickets past SLA",
        detail: "Breach count exceeds the 24-hour target.",
        href: "/admin/support",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.SUPPORT_VIEW,
      });
    }
    if (s.escalatedToMe > 0) {
      items.push({
        id: "att-support-escalated",
        severity: "high",
        category: "support_ticket",
        title: s.escalatedToMe + " escalated to you",
        detail: "Requires your review.",
        href: "/admin/support",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.SUPPORT_VIEW,
      });
    }
    if (s.unassigned > 0) {
      items.push({
        id: "att-support-unassigned",
        severity: "medium",
        category: "support_ticket",
        title: s.unassigned + " unassigned tickets",
        detail: "No agent attached yet.",
        href: "/admin/support",
        occurredAt: new Date().toISOString(),
        requiresPermission: PERMISSIONS.SUPPORT_VIEW,
      });
    }
  }

  /* ---------------------- Order retry backlog --------------------- */

  if (
    input.orderRetryBacklog !== undefined &&
    input.orderRetryBacklog > 0
  ) {
    items.push({
      id: "att-order-retry",
      severity: "high",
      category: "order_retry",
      title: input.orderRetryBacklog + " orders retrying",
      detail: "System failures retrying against provider.",
      href: "/admin/orders?status=retrying",
      occurredAt: new Date().toISOString(),
      requiresPermission: PERMISSIONS.ORDERS_VIEW,
    });
  }

  /* ---------------------- Severity ranking ------------------------ */

  const severityRank: Record<DashboardAttentionSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  items.sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    const c = a.category.localeCompare(b.category);
    if (c !== 0) return c;
    return a.id.localeCompare(b.id);
  });

  return items;
}

export function filterAttentionByPermissions(
  items: AttentionItem[],
  can: (p: Permission) => boolean
): AttentionItem[] {
  return items.filter((item) => can(item.requiresPermission));
}