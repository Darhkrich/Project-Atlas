// lib/admin/dashboard/dashboard-projection.ts

import type { Customer } from "@/lib/admin/types/customer";
import type { Merchant } from "@/lib/admin/types/merchant";
import type { Reseller } from "@/lib/admin/types/reseller";
import type {
  DisputeEvent,
  DunningEvent,
  MerchantWalletTransaction,
} from "@/lib/admin/types/merchant-money";
import type {
  MerchantMoneyStoreState,
  MerchantWalletLedgerEntry,
} from "@/lib/domains/wallet/merchant-money/types";
import type { ResellerWalletStoreState } from "@/lib/reseller/types/wallet";
import type { Order } from "@/lib/admin/types/orders";
import type { Refund } from "@/lib/admin/types/refund";
import type { SupportConversation } from "@/lib/admin/types/support";
import type { Provider } from "@/lib/admin/types/provider";
import type { ServiceCategory } from "@/lib/domains/catalog";
import {
  computeAttentionItems,
  type AttentionItem,
  type AttentionInput,
} from "./dashboard-attention";
import { allPlansFor } from "@/lib/domains/catalog";

export type { AttentionItem } from "./dashboard-attention";

export interface MerchantMoneyOverlayInput {
  walletTransactions: MerchantWalletTransaction[];
  disputes: DisputeEvent[];
  dunning: DunningEvent[];
}

export interface DashboardInput {
  customers: Customer[];
  resellers: Reseller[];
  merchants: Merchant[];
  merchantMoneyStore: MerchantMoneyStoreState;
  merchantOverlay: MerchantMoneyOverlayInput;
  resellerWalletState: ResellerWalletStoreState;
  orders: Order[];
  refunds: Refund[];
  supportTickets: SupportConversation[];
  providers: Provider[];
  catalog: ServiceCategory[];
  treasuryFreeCash: number | null;
  treasuryLiabilities: number | null;
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

export interface AccountsByStatus {
  customers: { active: number; inactive: number; suspended: number };
  resellers: { active: number; pending: number; suspended: number };
  merchants: { active: number; pending: number; suspended: number };
}

export interface DashboardMetrics {
  totalRevenue: number;
  todayRevenue: number;
  ordersToday: number;
  ordersRetrying: number;
  orderSuccessRate: number;
  refundRate: number;
  activeUsers: number;
  totalUsers: number;
  pendingRefunds: number;
  supportTicketsOpen: number;
  supportTicketsPastSla: number;
  supportTicketsUnassigned: number;
  walletLiability: number;
  liveStores: number;
  providersHealthy: number;
  providersDegraded: number;
  providersUnhealthy: number;
  plansTotal: number;
  plansLowMargin: number;
  accountBreakdown: AccountBreakdown;
  walletLiabilityBreakdown: WalletLiabilityBreakdown;
}

export interface TopPerformer {
  id: string;
  name: string;
  kind: "reseller" | "merchant";
  revenue: number;
  href: string;
}

export interface DashboardDeltaSet {
  totalRevenue: number | null;
  todayRevenue: number | null;
  ordersToday: number | null;
  activeUsers: number | null;
  totalUsers: number | null;
  pendingRefunds: number | null;
  supportTicketsOpen: number | null;
  walletLiability: number | null;
  liveStores: number | null;
  refundRate: number | null;
}

export interface DashboardSnapshot {
  metrics: DashboardMetrics;
  deltas: DashboardDeltaSet;
  topPerformers: TopPerformer[];
  attention: AttentionItem[];
  accountsByStatus: AccountsByStatus;
}

function safeNumber(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  return value;
}

function startOfDayMs(nowMs: number): number {
  const d = new Date(nowMs);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function eachMerchantState(
  store: MerchantMoneyStoreState
): Array<{ merchantId: string; state: MerchantMoneyStoreState[string] }> {
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

function percentChange(current: number, prior: number): number | null {
  if (prior <= 0) return null;
  return ((current - prior) / prior) * 100;
}

/* --------------------------- Compute metrics --------------------- */

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
  const resellerWallets = input.resellerWalletState.wallets;
  if (resellerWallets) {
    for (const id of Object.keys(resellerWallets)) {
      reseller += safeNumber(resellerWallets[id]?.balance);
    }
  }

  let merchantMain = 0;
  let merchantBilling = 0;
  for (const { state } of eachMerchantState(input.merchantMoneyStore)) {
    merchantMain += safeNumber(state.main.balance);
    merchantBilling += safeNumber(state.billing.balance);
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
  const payments = eachLedgerEntry(
    input.merchantMoneyStore,
    (e) => e.kind === "customer_payment" && Boolean(e.settledAt)
  );
  for (const { entry } of payments) {
    const t = new Date(entry.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    if (t >= start && t <= input.nowMs) total += safeNumber(entry.amount);
  }
  return total;
}

export function computeOrdersToday(input: DashboardInput): number {
  const start = startOfDayMs(input.nowMs);
  return input.orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    if (Number.isNaN(t)) return false;
    return t >= start && t <= input.nowMs;
  }).length;
}

export function computeOrdersRetrying(input: DashboardInput): number {
  return input.orders.filter((o) => o.status === "retrying").length;
}

export function computeOrderSuccessRate(input: DashboardInput): number {
  const start = startOfDayMs(input.nowMs);
  const today = input.orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    if (Number.isNaN(t)) return false;
    return t >= start && t <= input.nowMs;
  });
  const finished = today.filter(
    (o) =>
      o.status === "successful" ||
      o.status === "failed" ||
      o.status === "cancelled"
  );
  if (finished.length === 0) return 0;
  const successes = finished.filter(
    (o) => o.status === "successful"
  ).length;
  return (successes / finished.length) * 100;
}

export function computeRefundRate(input: DashboardInput): number {
  const start = startOfDayMs(input.nowMs);
  const settledToday = input.refunds.filter((r) => {
    if (r.status !== "completed" || !r.completedAt) return false;
    const t = new Date(r.completedAt).getTime();
    if (Number.isNaN(t)) return false;
    return t >= start && t <= input.nowMs;
  });
  const refundTotal = settledToday.reduce((s, r) => s + r.amount, 0);
  const revenueToday = computeTodayRevenue(input);
  if (revenueToday <= 0) return 0;
  return (refundTotal / revenueToday) * 100;
}

export function computePendingRefunds(input: DashboardInput): number {
  return input.refunds.filter((r) => r.status === "pending_admin").length;
}

export function computeSupportTicketsOpen(input: DashboardInput): number {
  return input.supportTickets.filter(
    (t) => t.status === "open" || t.status === "pending"
  ).length;
}

export function computeSupportTicketsPastSla(input: DashboardInput): number {
  const nowMs = input.nowMs;
  return input.supportTickets.filter(
    (t) =>
      (t.status === "open" || t.status === "pending") &&
      nowMs - new Date(t.lastMessageAt).getTime() > 24 * 86_400_000
  ).length;
}

export function computeSupportTicketsUnassigned(input: DashboardInput): number {
  return input.supportTickets.filter(
    (t) =>
      (t.status === "open" || t.status === "pending") &&
      (!t.assigneeId || t.assigneeId === "")
  ).length;
}

export function computeProvidersByHealth(input: DashboardInput): {
  healthy: number;
  degraded: number;
  unhealthy: number;
} {
  let healthy = 0;
  let degraded = 0;
  let unhealthy = 0;
  for (const p of input.providers) {
    if (p.healthStatus === "critical") unhealthy += 1;
    else if (p.healthStatus === "warning") degraded += 1;
    else healthy += 1;
  }
  return { healthy, degraded, unhealthy };
}

export function computePlansSummary(input: DashboardInput): {
  total: number;
  lowMargin: number;
} {
  let total = 0;
  let lowMargin = 0;
  for (const cat of input.catalog) {
    for (const plan of allPlansFor(cat)) {
      total += 1;
      if (plan.providerCost === undefined) continue;
      if (plan.price <= 0) continue;
      const marginPercent =
        ((plan.price - plan.providerCost) / plan.price) * 100;
      if (marginPercent < 10) lowMargin += 1;
    }
  }
  return { total, lowMargin };
}

export function computeMetrics(input: DashboardInput): DashboardMetrics {
  const accountBreakdown = computeAccountBreakdown(input);
  const walletLiabilityBreakdown = computeWalletLiability(input);
  const walletLiability =
    walletLiabilityBreakdown.customer +
    walletLiabilityBreakdown.reseller +
    walletLiabilityBreakdown.merchantMain +
    walletLiabilityBreakdown.merchantBilling;
  const providers = computeProvidersByHealth(input);
  const plans = computePlansSummary(input);

  return {
    totalRevenue: computeTotalRevenue(input),
    todayRevenue: computeTodayRevenue(input),
    ordersToday: computeOrdersToday(input),
    ordersRetrying: computeOrdersRetrying(input),
    orderSuccessRate: computeOrderSuccessRate(input),
    refundRate: computeRefundRate(input),
    activeUsers: computeActiveUsers(input),
    totalUsers:
      accountBreakdown.customers +
      accountBreakdown.resellers +
      accountBreakdown.merchants,
    pendingRefunds: computePendingRefunds(input),
    supportTicketsOpen: computeSupportTicketsOpen(input),
    supportTicketsPastSla: computeSupportTicketsPastSla(input),
    supportTicketsUnassigned: computeSupportTicketsUnassigned(input),
    walletLiability,
    liveStores: computeLiveStores(input),
    providersHealthy: providers.healthy,
    providersDegraded: providers.degraded,
    providersUnhealthy: providers.unhealthy,
    plansTotal: plans.total,
    plansLowMargin: plans.lowMargin,
    accountBreakdown,
    walletLiabilityBreakdown,
  };
}

export function computeAccountsByStatus(
  input: DashboardInput
): AccountsByStatus {
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
      href: "/admin/resellers/" + r.id,
    });
  }
  for (const m of input.merchants) {
    combined.push({
      id: m.id,
      name: m.businessName,
      kind: "merchant",
      revenue: safeNumber(m.totalRevenue),
      href: "/admin/ecommerce/merchants/" + m.id,
    });
  }
  combined.sort((a, b) => b.revenue - a.revenue);
  return combined.slice(0, limit);
}

/* ------------------------ Snapshot entry points ------------------ */

function attentionFor(input: DashboardInput): AttentionItem[] {
  const providers = computeProvidersByHealth(input);
  const attentionInput: AttentionInput = {
    customers: input.customers,
    resellers: input.resellers,
    merchants: input.merchants,
    merchantMoneyStore: input.merchantMoneyStore,
    merchantOverlay: input.merchantOverlay,
    resellerWalletState: input.resellerWalletState,
    supportTicketSummary: {
      unassigned: computeSupportTicketsUnassigned(input),
      pastSla: computeSupportTicketsPastSla(input),
      escalatedToMe: 0,
    },
    providerHealth: {
      degraded: providers.degraded,
      unhealthy: providers.unhealthy,
    },
    orderRetryBacklog: computeOrdersRetrying(input),
    treasuryFreeCash: input.treasuryFreeCash,
    treasuryLiabilities: input.treasuryLiabilities,
  };
  return computeAttentionItems(attentionInput);
}

export function computeCurrentMetrics(
  input: DashboardInput
): DashboardMetrics {
  return computeMetrics(input);
}

export function computePriorMetrics(
  input: DashboardInput,
  priorNowMs: number
): DashboardMetrics {
  return computeMetrics({ ...input, nowMs: priorNowMs });
}

export function computeDeltaSet(
  current: DashboardMetrics,
  prior: DashboardMetrics
): DashboardDeltaSet {
  return {
    totalRevenue: percentChange(current.totalRevenue, prior.totalRevenue),
    todayRevenue: percentChange(current.todayRevenue, prior.todayRevenue),
    ordersToday: percentChange(current.ordersToday, prior.ordersToday),
    activeUsers: percentChange(current.activeUsers, prior.activeUsers),
    totalUsers: percentChange(current.totalUsers, prior.totalUsers),
    pendingRefunds: percentChange(
      current.pendingRefunds,
      prior.pendingRefunds
    ),
    supportTicketsOpen: percentChange(
      current.supportTicketsOpen,
      prior.supportTicketsOpen
    ),
    walletLiability: percentChange(
      current.walletLiability,
      prior.walletLiability
    ),
    liveStores: percentChange(current.liveStores, prior.liveStores),
    refundRate: percentChange(current.refundRate, prior.refundRate),
  };
}

export function computeDashboardSnapshot(
  input: DashboardInput
): DashboardSnapshot {
  const current = computeMetrics(input);
  const prior = computePriorMetrics(input, input.nowMs - 30 * 86_400_000);
  return {
    metrics: current,
    deltas: computeDeltaSet(current, prior),
    topPerformers: computeTopPerformers(input),
    attention: attentionFor(input),
    accountsByStatus: computeAccountsByStatus(input),
  };
}