import type { Customer } from "@/lib/admin/types/customer";
import type { Merchant } from "@/lib/admin/types/merchant";
import type { Reseller } from "@/lib/admin/types/reseller";
import type { MerchantMoneyState } from "@/lib/admin/types/merchant-money";
import type { ResellerWalletStoreState } from "@/lib/reseller/types/wallet";
import {
  DASHBOARD_ATTENTION_THRESHOLDS,
  type DashboardAttentionSeverity,
} from "./dashboard-constants";

export interface DashboardInput {
  customers: Customer[];
  resellers: Reseller[];
  merchants: Merchant[];
  merchantMoney: MerchantMoneyState;
  resellerWalletState?: ResellerWalletStoreState;
  nowMs: number;
}

export interface AccountBreakdown {
  resellers: number;
  customers: number;
  merchants: number;
}

export interface WalletLiabilityBreakdown {
  customer: number;
  reseller: number;
  merchantMain: number;
  merchantBilling: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  todayRevenue: number;
  activeUsers: number;
  totalUsers: number;
  transactionsPending: number;
  transactionsFailed: number;
  pendingRefunds: number;
  supportTicketsOpen: number;
  walletLiability: number;
  liveStores: number;
  accountBreakdown: AccountBreakdown;
  walletLiabilityBreakdown: WalletLiabilityBreakdown;
}

export interface TopPerformer {
  id: string;
  name: string;
  kind: "reseller" | "merchant";
  revenue: number;
  trend: number;
  href: string;
}

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
  | "plan_charge";

export interface AttentionItem {
  id: string;
  severity: DashboardAttentionSeverity;
  category: AttentionCategory;
  title: string;
  detail: string;
  href: string;
  occurredAt: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetrics;
  deltas: {
    totalRevenue: number | null;
    todayRevenue: number | null;
    activeUsers: number | null;
    totalUsers: number | null;
    transactionsPending: number | null;
    transactionsFailed: number | null;
    pendingRefunds: number | null;
    supportTicketsOpen: number | null;
    walletLiability: number | null;
    liveStores: number | null;
  };
  topPerformers: TopPerformer[];
  attention: AttentionItem[];
  accountsByStatus: {
    customers: { active: number; inactive: number; suspended: number };
    resellers: { active: number; pending: number; suspended: number };
    merchants: { active: number; pending: number; suspended: number };
  };
}

function safeNumber(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  return value;
}

function startOfDayMs(nowMs: number): number {
  const d = new Date(nowMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeAccountBreakdown(input: DashboardInput): AccountBreakdown {
  return {
    resellers: input.resellers.length,
    customers: input.customers.length,
    merchants: input.merchants.length,
  };
}

export function computeActiveUsers(input: DashboardInput): number {
  const customers = input.customers.filter((c) => c.status === "active").length;
  const resellers = input.resellers.filter((r) => r.status === "active").length;
  const merchants = input.merchants.filter(
    (m) => m.merchantStatus === "active"
  ).length;
  return customers + resellers + merchants;
}

export function computeWalletLiability(
  input: DashboardInput
): WalletLiabilityBreakdown {
  let customer = 0;
  for (const c of input.customers) customer += safeNumber(c.walletBalance);

  let reseller = 0;
  const resellerWallets = input.resellerWalletState?.wallets;
  if (resellerWallets) {
    for (const id of Object.keys(resellerWallets)) {
      reseller += safeNumber(resellerWallets[id]?.balance);
    }
  }

  let merchantMain = 0;
  let merchantBilling = 0;
  const wallets = input.merchantMoney.wallets;
  for (const id of Object.keys(wallets)) {
    const pair = wallets[id];
    if (!pair) continue;
    merchantMain += safeNumber(pair.main?.balance);
    merchantBilling += safeNumber(pair.billing?.balance);
  }
  return { customer, reseller, merchantMain, merchantBilling };
}

export function computeLiveStores(input: DashboardInput): number {
  let count = 0;
  for (const m of input.merchants) {
    if (m.storeStatus === "live") count += 1;
  }
  for (const r of input.resellers) {
    if (r.status === "active") count += 1;
  }
  return count;
}

export function computeTotalRevenue(input: DashboardInput): number {
  let total = 0;
  for (const m of input.merchants) total += safeNumber(m.totalRevenue);
  for (const r of input.resellers) total += safeNumber(r.totalRevenue);
  for (const c of input.customers) total += safeNumber(c.totalSpent);
  return total;
}

export function computeTodayRevenue(input: DashboardInput): number {
  const start = startOfDayMs(input.nowMs);
  let total = 0;
  for (const c of input.merchantMoney.checkouts) {
    if (c.status !== "successful") continue;
    const t = new Date(c.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    if (t >= start && t <= input.nowMs) total += safeNumber(c.amount);
  }
  return total;
}

export function computeTransactionsPending(input: DashboardInput): number {
  let count = 0;
  for (const c of input.merchantMoney.checkouts) {
    if (c.status === "pending") count += 1;
  }
  for (const p of input.merchantMoney.planCharges) {
    if (p.status === "pending") count += 1;
  }
  return count;
}

export function computeTransactionsFailed(input: DashboardInput): number {
  let count = 0;
  for (const c of input.merchantMoney.checkouts) {
    if (c.status === "failed") count += 1;
  }
  for (const p of input.merchantMoney.planCharges) {
    if (p.status === "failed") count += 1;
  }
  return count;
}

export function computePendingRefunds(input: DashboardInput): number {
  let count = 0;
  for (const r of input.merchantMoney.refunds) {
    if (!r.settledAt) count += 1;
  }
  return count;
}

export function computeMetrics(input: DashboardInput): DashboardMetrics {
  const accountBreakdown = computeAccountBreakdown(input);
  const walletLiabilityBreakdown = computeWalletLiability(input);
  const walletLiability =
    walletLiabilityBreakdown.customer +
    walletLiabilityBreakdown.reseller +
    walletLiabilityBreakdown.merchantMain +
    walletLiabilityBreakdown.merchantBilling;
  return {
    totalRevenue: computeTotalRevenue(input),
    todayRevenue: computeTodayRevenue(input),
    activeUsers: computeActiveUsers(input),
    totalUsers:
      accountBreakdown.customers +
      accountBreakdown.resellers +
      accountBreakdown.merchants,
    transactionsPending: computeTransactionsPending(input),
    transactionsFailed: computeTransactionsFailed(input),
    pendingRefunds: computePendingRefunds(input),
    supportTicketsOpen: 0,
    walletLiability,
    liveStores: computeLiveStores(input),
    accountBreakdown,
    walletLiabilityBreakdown,
  };
}

export function computeAccountsByStatus(
  input: DashboardInput
): DashboardSnapshot["accountsByStatus"] {
  const customers = { active: 0, inactive: 0, suspended: 0 };
  for (const c of input.customers) {
    if (c.status === "active") customers.active += 1;
    else if (c.status === "inactive") customers.inactive += 1;
    else if (c.status === "suspended") customers.suspended += 1;
  }
  const resellers = { active: 0, pending: 0, suspended: 0 };
  for (const r of input.resellers) {
    if (r.status === "active") resellers.active += 1;
    else if (r.status === "pending") resellers.pending += 1;
    else if (r.status === "suspended") resellers.suspended += 1;
  }
  const merchants = { active: 0, pending: 0, suspended: 0 };
  for (const m of input.merchants) {
    if (m.merchantStatus === "active") merchants.active += 1;
    else if (m.merchantStatus === "pending") merchants.pending += 1;
    else if (m.merchantStatus === "suspended") merchants.suspended += 1;
  }
  return { customers, resellers, merchants };
}

export function computeTopPerformers(
  input: DashboardInput,
  limit = 5
): TopPerformer[] {
  const combined: TopPerformer[] = [];
  for (const r of input.resellers) {
    combined.push({
      id: r.id,
      name: r.businessName,
      kind: "reseller",
      revenue: safeNumber(r.totalRevenue),
      trend: 0,
      href: "/admin/resellers/" + r.id,
    });
  }
  for (const m of input.merchants) {
    combined.push({
      id: m.id,
      name: m.businessName,
      kind: "merchant",
      revenue: safeNumber(m.totalRevenue),
      trend: 0,
      href: "/admin/ecommerce/merchants/" + m.id,
    });
  }
  combined.sort((a, b) => b.revenue - a.revenue);
  return combined.slice(0, limit);
}

export function computeAttentionQueue(input: DashboardInput): AttentionItem[] {
  const items: AttentionItem[] = [];
  const thresholds = DASHBOARD_ATTENTION_THRESHOLDS;

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
      });
    }
  }

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
        severity: r.verificationStatus === "rejected" ? "high" : "medium",
        category: "reseller_verification",
        title: r.businessName,
        detail:
          r.verificationStatus === "rejected"
            ? "Verification rejected"
            : "Verification pending",
        href: "/admin/resellers/" + r.id,
        occurredAt: r.joinedAt,
      });
    }
  }

  const resellerWallets = input.resellerWalletState?.wallets;
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
        });
      }
    }
  }

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
      });
    }
  }

  for (const w of input.merchantMoney.withdrawals) {
    if (w.status !== "pending_admin") continue;
    const merchant = input.merchants.find((m) => m.id === w.merchantId);
    items.push({
      id: "att-withdrawal-" + w.id,
      severity: w.total > thresholds.refundValueGHS ? "critical" : "high",
      category: "withdrawal",
      title: merchant?.businessName ?? w.merchantId,
      detail:
        "Withdrawal GH\u20B5 " +
        w.total.toLocaleString() +
        " awaiting approval",
      href: "/admin/ecommerce/payments",
      occurredAt: w.createdAt,
    });
  }

  for (const d of input.merchantMoney.disputes) {
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
    });
  }

  for (const r of input.merchantMoney.refunds) {
    if (r.settledAt) continue;
    const merchant = input.merchants.find((m) => m.id === r.merchantId);
    items.push({
      id: "att-refund-" + r.id,
      severity: "medium",
      category: "refund",
      title: merchant?.businessName ?? r.merchantId,
      detail:
        "Refund GH\u20B5 " + r.amount.toLocaleString() + " not yet settled",
      href: "/admin/ecommerce/payments",
      occurredAt: r.createdAt,
    });
  }

  for (const p of input.merchantMoney.planCharges) {
    if (p.status !== "failed") continue;
    const merchant = input.merchants.find((m) => m.id === p.merchantId);
    items.push({
      id: "att-plancharge-" + p.id,
      severity: "medium",
      category: "plan_charge",
      title: merchant?.businessName ?? p.merchantId,
      detail:
        "Plan charge failed - " +
        (p.failureReason?.replace(/_/g, " ") ?? "unknown reason"),
      href: "/admin/ecommerce/payments",
      occurredAt: p.createdAt,
    });
  }

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

export function computeDashboardSnapshot(
  input: DashboardInput
): DashboardSnapshot {
  return {
    metrics: computeMetrics(input),
    deltas: {
      totalRevenue: null,
      todayRevenue: null,
      activeUsers: null,
      totalUsers: null,
      transactionsPending: null,
      transactionsFailed: null,
      pendingRefunds: null,
      supportTicketsOpen: null,
      walletLiability: null,
      liveStores: null,
    },
    topPerformers: computeTopPerformers(input),
    attention: computeAttentionQueue(input),
    accountsByStatus: computeAccountsByStatus(input),
  };
}