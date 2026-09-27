/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Order } from "@/lib/admin/types/orders";
import type { Refund } from "@/lib/admin/types/refund";
import type { Merchant } from "@/lib/admin/types/merchant";
import type { Customer } from "@/lib/admin/types/customer";
import type { Reseller } from "@/lib/admin/types/reseller";
import type { ServiceCategory } from "@/lib/domains/catalog";
import {
  allPlansFor,
  CATEGORY_LABEL,
} from "@/lib/domains/catalog";
import {
  AUDIENCE_TO_STREAM,
  STREAM_LABEL,
  WEEKDAY_ORDER,
  WEEKDAY_SHORT,
  type RevenueStreamId,
} from "./revenue-labels";
import {
  bucketKey,
  daysBetween,
  isInWindow,
  orderedWeekdays,
  percentChange,
  startOfUtcDay,
  startOfUtcMonth,
  startOfUtcYear,
  weekdayOf,
  type TimeWindow,
} from "./revenue-helpers";
import type { TrendGranularity } from "./revenue-constants";
import { LOW_MARGIN_THRESHOLD_PERCENT } from "./revenue-constants";
import {
  getPlanMonthlyPriceGHS,
  getPlanAnnualPriceGHS,
  getMerchantMrr,
} from "@/lib/admin/types/merchant";

/* ------------------------------- Types ------------------------------- */

export interface RevenueKpis {
  totalPlatform: number;
  todayPlatform: number;
  monthPlatform: number;
  yearPlatform: number;
  avgDailyPlatform: number;
  deltas: {
    total: number | null;
    today: number | null;
    month: number | null;
    year: number | null;
    avgDaily: number | null;
  };
}

export interface StreamRow {
  stream: RevenueStreamId;
  amount: number;
  share: number;
}

export interface TrendPoint {
  label: string;
  digital_services: number;
  resellers: number;
  ecommerce: number;
  total: number;
}

export interface TopServiceRow {
  serviceId: string;
  serviceName: string;
  amount: number;
  orders: number;
}

export interface MethodRow {
  methodId: string;
  label: string;
  amount: number;
  share: number;
}

export interface NetworkRow {
  network: string;
  amount: number;
  orders: number;
}

export interface PerformerRow {
  id: string;
  name: string;
  amount: number;
  orders: number;
  trend: number | null;
}

export interface CustomerRow {
  customerId: string;
  name: string;
  stream: RevenueStreamId;
  amount: number;
  orders: number;
}

export interface WeekdayRow {
  day: string;
  short: string;
  amount: number;
}

export interface SourceRow {
  source: "direct" | "reseller_storefront" | "reseller_self";
  label: string;
  amount: number;
}

export interface RefundImpact {
  totalRefunds: number;
  netRevenue: number;
  refundRatePercent: number;
  priorRatePercent: number | null;
}

export interface PaymentSuccess {
  rate: number;
  priorRate: number | null;
  sampleSize: number;
}

export interface ProfitMarginRow {
  serviceId: string;
  serviceName: string;
  marginPercent: number;
  revenue: number;
}

export interface ProfitMargin {
  overallPercent: number;
  byService: ProfitMarginRow[];
  sampleSize: number;
  hasCostData: boolean;
}

export interface LowMarginAlert {
  serviceId: string;
  serviceName: string;
  marginPercent: number;
}

export interface RecurringMetrics {
  mrr: number;
  arr: number;
  arpuByStream: Record<RevenueStreamId, number>;
}

/* ----------------------------- Helpers ------------------------------- */

const SUCCESSFUL = "successful";

const METHOD_LABEL_MAP: Record<string, string> = {
  mobile_money: "Mobile money",
  card: "Card",
  bank_transfer: "Bank transfer",
  wallet: "Wallet",
  atlas_points: "Atlas points",
};

function successfulInWindow(
  orders: Order[],
  window: TimeWindow
): Order[] {
  return orders.filter(
    (o) => o.status === SUCCESSFUL && isInWindow(o.createdAt, window)
  );
}

function sumAmount(orders: Order[]): number {
  let total = 0;
  for (const o of orders) total += o.amount;
  return total;
}

function grossInWindow(orders: Order[], window: TimeWindow): number {
  return sumAmount(
    orders.filter((o) => isInWindow(o.createdAt, window))
  );
}

/* ---------------------------- Overview ------------------------------- */

export function projectKpis(
  orders: Order[],
  current: TimeWindow,
  prior: TimeWindow
): RevenueKpis {
  const currentSuccess = successfulInWindow(orders, current);
  const priorSuccess = successfulInWindow(orders, prior);

  const total = sumAmount(currentSuccess);
  const priorTotal = sumAmount(priorSuccess);

  const todayStart = startOfUtcDay(current.to);
  const monthStart = startOfUtcMonth(current.to);
  const yearStart = startOfUtcYear(current.to);

  const today = sumAmount(
    currentSuccess.filter((o) => o.createdAt >= todayStart)
  );
  const month = sumAmount(
    currentSuccess.filter((o) => o.createdAt >= monthStart)
  );
  const year = sumAmount(
    currentSuccess.filter((o) => o.createdAt >= yearStart)
  );

  const days = daysBetween(current.from, current.to);
  const priorDays = daysBetween(prior.from, prior.to);

  return {
    totalPlatform: total,
    todayPlatform: today,
    monthPlatform: month,
    yearPlatform: year,
    avgDailyPlatform: total / days,
    deltas: {
      total: percentChange(total, priorTotal),
      today: percentChange(
        today,
        sumAmount(
          priorSuccess.filter(
            (o) => o.createdAt >= startOfUtcDay(prior.to)
          )
        )
      ),
      month: percentChange(
        month,
        sumAmount(
          priorSuccess.filter(
            (o) => o.createdAt >= startOfUtcMonth(prior.to)
          )
        )
      ),
      year: percentChange(
        year,
        sumAmount(
          priorSuccess.filter(
            (o) => o.createdAt >= startOfUtcYear(prior.to)
          )
        )
      ),
      avgDaily: percentChange(total / days, priorTotal / priorDays),
    },
  };
}

export function projectStreamBreakdown(
  orders: Order[],
  window: TimeWindow
): StreamRow[] {
  const success = successfulInWindow(orders, window);
  const totals: Record<RevenueStreamId, number> = {
    digital_services: 0,
    resellers: 0,
    ecommerce: 0,
  };
  for (const o of success) {
    const stream = AUDIENCE_TO_STREAM[o.audience];
    totals[stream] += o.amount;
  }
  const sum = totals.digital_services + totals.resellers;
  const rows: StreamRow[] = [];
  if (sum > 0) {
    if (totals.digital_services > 0) {
      rows.push({
        stream: "digital_services",
        amount: totals.digital_services,
        share: (totals.digital_services / sum) * 100,
      });
    }
    if (totals.resellers > 0) {
      rows.push({
        stream: "resellers",
        amount: totals.resellers,
        share: (totals.resellers / sum) * 100,
      });
    }
  }
  return rows;
}

export function projectStreamTrend(
  orders: Order[],
  window: TimeWindow,
  granularity: TrendGranularity
): TrendPoint[] {
  const success = successfulInWindow(orders, window);
  const buckets = new Map<string, TrendPoint>();

  for (const o of success) {
    const key = bucketKey(o.createdAt, granularity);
    const stream = AUDIENCE_TO_STREAM[o.audience];
    let point = buckets.get(key);
    if (!point) {
      point = {
        label: key,
        digital_services: 0,
        resellers: 0,
        ecommerce: 0,
        total: 0,
      };
      buckets.set(key, point);
    }
    point[stream] += o.amount;
    point.total += o.amount;
  }

  return Array.from(buckets.values());
}

/* ---------------------------- Sources -------------------------------- */

export function projectTopServices(
  orders: Order[],
  catalog: ServiceCategory[],
  window: TimeWindow
): TopServiceRow[] {
  const success = successfulInWindow(orders, window);
  const map = new Map<string, TopServiceRow>();

  const nameFor = (serviceId: string): string => {
    for (const cat of catalog) {
      const plans = allPlansFor(cat);
      const match = plans.find((p) => p.id === serviceId);
      if (match) return CATEGORY_LABEL[cat.id] + " " + match.name;
    }
    return serviceId;
  };

  for (const o of success) {
    const existing = map.get(o.serviceId);
    if (existing) {
      existing.amount += o.amount;
      existing.orders += 1;
    } else {
      map.set(o.serviceId, {
        serviceId: o.serviceId,
        serviceName: nameFor(o.serviceId),
        amount: o.amount,
        orders: 1,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);
}

export function projectPaymentMethodBreakdown(
  orders: Order[],
  window: TimeWindow
): MethodRow[] {
  const success = successfulInWindow(orders, window);
  const map = new Map<string, number>();
  let total = 0;
  for (const o of success) {
    const id = String(o.paymentMethodId);
    map.set(id, (map.get(id) ?? 0) + o.amount);
    total += o.amount;
  }
  return Array.from(map.entries())
    .map(([methodId, amount]) => ({
      methodId,
      label: METHOD_LABEL_MAP[methodId] ?? methodId,
      amount,
      share: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function projectNetworkBreakdown(
  orders: Order[],
  window: TimeWindow
): NetworkRow[] {
  const success = successfulInWindow(orders, window);
  const map = new Map<string, NetworkRow>();
  for (const o of success) {
    if (o.audience === "direct" && o.serviceId.startsWith("data:")) {
      const network = o.networkId ?? "Unknown";
      const existing = map.get(network);
      if (existing) {
        existing.amount += o.amount;
        existing.orders += 1;
      } else {
        map.set(network, { network, amount: o.amount, orders: 1 });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export function projectTopPerformers(
  orders: Order[],
  resellers: Reseller[],
  merchants: Merchant[],
  current: TimeWindow,
  prior: TimeWindow
): { resellers: PerformerRow[]; merchants: PerformerRow[] } {
  const resellerRevenue = new Map<string, { amount: number; orders: number }>();
  const merchantRevenue = new Map<string, { amount: number; orders: number }>();
  const resellerPrior = new Map<string, number>();

  const resellerIds = new Set(resellers.map((r) => r.id));
  const merchantIds = new Set(merchants.map((m) => m.id));

  for (const o of orders) {
    if (o.status !== SUCCESSFUL) continue;
    if (isInWindow(o.createdAt, current)) {
      if (o.resellerId && resellerIds.has(o.resellerId)) {
        const row = resellerRevenue.get(o.resellerId) ?? {
          amount: 0,
          orders: 0,
        };
        row.amount += o.amount;
        row.orders += 1;
        resellerRevenue.set(o.resellerId, row);
      }
      if (o.storefrontId && merchantIds.has(o.storefrontId)) {
        const row = merchantRevenue.get(o.storefrontId) ?? {
          amount: 0,
          orders: 0,
        };
        row.amount += o.amount;
        row.orders += 1;
        merchantRevenue.set(o.storefrontId, row);
      }
    } else if (isInWindow(o.createdAt, prior)) {
      if (o.resellerId && resellerIds.has(o.resellerId)) {
        resellerPrior.set(
          o.resellerId,
          (resellerPrior.get(o.resellerId) ?? 0) + o.amount
        );
      }
    }
  }

  const resellerRows: PerformerRow[] = resellers
    .map((r) => {
      const row = resellerRevenue.get(r.id);
      if (!row) return null;
      const priorAmount = resellerPrior.get(r.id) ?? 0;
      return {
        id: r.id,
        name: r.businessName,
        amount: row.amount,
        orders: row.orders,
        trend: percentChange(row.amount, priorAmount),
      };
    })
    .filter((r): r is PerformerRow => r !== null)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const merchantRows: PerformerRow[] = [];
  for (const m of merchants) {
    const row = merchantRevenue.get(m.id);
    if (!row) continue;
    merchantRows.push({
      id: m.id,
      name: m.businessName,
      amount: row.amount,
      orders: row.orders,
      trend: null,
    });
  }
  merchantRows.sort((a, b) => b.amount - a.amount);
  const topMerchants = merchantRows.slice(0, 5);

  return { resellers: resellerRows, merchants: topMerchants };
}

export function projectTopCustomers(
  orders: Order[],
  customers: Customer[],
  window: TimeWindow
): CustomerRow[] {
  const success = successfulInWindow(orders, window);
  const map = new Map<string, { amount: number; orders: number }>();
  for (const o of success) {
    if (!o.customerId) continue;
    const row = map.get(o.customerId) ?? { amount: 0, orders: 0 };
    row.amount += o.amount;
    row.orders += 1;
    map.set(o.customerId, row);
  }
  const byId = new Map(customers.map((c) => [c.id, c]));
  return Array.from(map.entries())
    .map(([customerId, row]) => {
      const c = byId.get(customerId);
      return {
        customerId,
        name: c?.name ?? customerId,
        stream: (c?.source === "reseller"
          ? "resellers"
          : c?.source === "ecommerce"
          ? "ecommerce"
          : "digital_services") as RevenueStreamId,
        amount: row.amount,
        orders: row.orders,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

export function projectWeekdayBreakdown(
  orders: Order[],
  window: TimeWindow
): WeekdayRow[] {
  const success = successfulInWindow(orders, window);
  const map = new Map<string, number>();
  for (const o of success) {
    const day = weekdayOf(o.createdAt);
    map.set(day, (map.get(day) ?? 0) + o.amount);
  }
  return orderedWeekdays().map((day) => ({
    day,
    short: WEEKDAY_SHORT[day] ?? day,
    amount: map.get(day) ?? 0,
  }));
}

export function projectSourceBreakdown(
  orders: Order[],
  window: TimeWindow
): SourceRow[] {
  const success = successfulInWindow(orders, window);
  const totals = {
    direct: 0,
    reseller_storefront: 0,
    reseller_self: 0,
  };
  for (const o of success) {
    if (o.audience === "direct") totals.direct += o.amount;
    else if (o.audience === "storefront_user")
      totals.reseller_storefront += o.amount;
    else if (o.audience === "reseller") totals.reseller_self += o.amount;
  }
  const rows: SourceRow[] = [];
  if (totals.direct > 0) {
    rows.push({
      source: "direct",
      label: "Atlas direct",
      amount: totals.direct,
    });
  }
  if (totals.reseller_storefront > 0) {
    rows.push({
      source: "reseller_storefront",
      label: "Reseller storefronts",
      amount: totals.reseller_storefront,
    });
  }
  if (totals.reseller_self > 0) {
    rows.push({
      source: "reseller_self",
      label: "Reseller self-service",
      amount: totals.reseller_self,
    });
  }
  return rows;
}

/* ----------------------------- Health -------------------------------- */

export function projectRefundImpact(
  orders: Order[],
  refunds: Refund[],
  current: TimeWindow,
  prior: TimeWindow
): RefundImpact {
  const settled = (rs: Refund[]) =>
    rs.filter(
      (r) =>
        r.status === "completed" &&
        r.completedAt !== undefined &&
        isInWindow(r.completedAt, current)
    );
  const settledPrior = (rs: Refund[]) =>
    rs.filter(
      (r) =>
        r.status === "completed" &&
        r.completedAt !== undefined &&
        isInWindow(r.completedAt, prior)
    );

  const currentRefunds = settled(refunds);
  const priorRefunds = settledPrior(refunds);

  const totalRefunds = currentRefunds.reduce((s, r) => s + r.amount, 0);
  const gross = grossInWindow(orders, current);
  const grossPrior = grossInWindow(orders, prior);
  const priorRefundTotal = priorRefunds.reduce((s, r) => s + r.amount, 0);

  const rate = gross > 0 ? (totalRefunds / gross) * 100 : 0;
  const priorRate =
    grossPrior > 0 ? (priorRefundTotal / grossPrior) * 100 : null;

  return {
    totalRefunds,
    netRevenue: gross - totalRefunds,
    refundRatePercent: rate,
    priorRatePercent: priorRate,
  };
}

export function projectPaymentSuccessRate(
  orders: Order[],
  current: TimeWindow,
  prior: TimeWindow
): PaymentSuccess {
  const inCurrent = orders.filter((o) =>
    isInWindow(o.createdAt, current)
  );
  const inPrior = orders.filter((o) => isInWindow(o.createdAt, prior));

  const rateFor = (list: Order[]): number => {
    const finished = list.filter(
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
  };

  const rate = rateFor(inCurrent);
  const priorRate = inPrior.length > 0 ? rateFor(inPrior) : null;

  return {
    rate,
    priorRate,
    sampleSize: inCurrent.length,
  };
}

export function projectProfitMargin(
  orders: Order[],
  catalog: ServiceCategory[],
  window: TimeWindow
): ProfitMargin {
  const success = successfulInWindow(orders, window);

  const costByPlanId = new Map<string, number>();
  for (const cat of catalog) {
    for (const plan of allPlansFor(cat)) {
      if (plan.providerCost !== undefined) {
        costByPlanId.set(plan.id, plan.providerCost);
      }
    }
  }

  const rows = new Map<
    string,
    { revenue: number; cost: number; name: string }
  >();

  let totalRevenue = 0;
  let totalCost = 0;
  let costedRows = 0;

  for (const o of success) {
    totalRevenue += o.amount;
    const cost = costByPlanId.get(o.serviceId);
    if (cost !== undefined) {
      totalCost += cost;
      costedRows += 1;
      const existing = rows.get(o.serviceId);
      if (existing) {
        existing.revenue += o.amount;
        existing.cost += cost;
      } else {
        rows.set(o.serviceId, {
          revenue: o.amount,
          cost,
          name: o.serviceId,
        });
      }
    }
  }

  const hasCostData = costedRows > 0;
  const overallPercent =
    hasCostData && totalRevenue > 0
      ? ((totalRevenue - totalCost) / totalRevenue) * 100
      : 0;

  const byService: ProfitMarginRow[] = Array.from(rows.entries())
    .map(([serviceId, row]) => ({
      serviceId,
      serviceName: row.name,
      marginPercent:
        row.revenue > 0
          ? ((row.revenue - row.cost) / row.revenue) * 100
          : 0,
      revenue: row.revenue,
    }))
    .sort((a, b) => a.marginPercent - b.marginPercent)
    .slice(0, 8);

  return {
    overallPercent,
    byService,
    sampleSize: costedRows,
    hasCostData,
  };
}

export function projectLowMarginAlerts(
  orders: Order[],
  catalog: ServiceCategory[],
  window: TimeWindow
): LowMarginAlert[] {
  const success = successfulInWindow(orders, window);
  const orderCountByPlan = new Map<string, number>();
  for (const o of success) {
    orderCountByPlan.set(
      o.serviceId,
      (orderCountByPlan.get(o.serviceId) ?? 0) + 1
    );
  }

  const alerts: LowMarginAlert[] = [];
  for (const cat of catalog) {
    for (const plan of allPlansFor(cat)) {
      if (plan.providerCost === undefined) continue;
      if (plan.price <= 0) continue;
      const marginPercent =
        ((plan.price - plan.providerCost) / plan.price) * 100;
      if (marginPercent < LOW_MARGIN_THRESHOLD_PERCENT) {
        alerts.push({
          serviceId: plan.id,
          serviceName: CATEGORY_LABEL[cat.id] + " " + plan.name,
          marginPercent,
        });
      }
    }
  }
  return alerts.sort((a, b) => a.marginPercent - b.marginPercent);
}

export function projectRecurringMetrics(
  merchants: Merchant[],
  orders: Order[],
  customers: Customer[],
  resellers: Reseller[],
  window: TimeWindow
): RecurringMetrics {
  let mrr = 0;
  for (const m of merchants) {
    if (m.subscription.status !== "active") continue;
    mrr += getMerchantMrr(m);
  }

  const success = successfulInWindow(orders, window);

  const revenueForStream = (stream: RevenueStreamId): number =>
    success
      .filter((o) => AUDIENCE_TO_STREAM[o.audience] === stream)
      .reduce((s, o) => s + o.amount, 0);

  const activeCustomers = customers.filter(
    (c) => c.status === "active" && c.source === "direct"
  ).length;
  const activeResellers = resellers.filter(
    (r) => r.status === "active"
  ).length;
  const activeMerchants = merchants.filter(
    (m) => m.merchantStatus === "active"
  ).length;

  const days = daysBetween(window.from, window.to);
  const months = Math.max(1, days / 30);

  const arpuByStream: Record<RevenueStreamId, number> = {
    digital_services:
      activeCustomers > 0
        ? revenueForStream("digital_services") / activeCustomers / months
        : 0,
    resellers:
      activeResellers > 0
        ? revenueForStream("resellers") / activeResellers / months
        : 0,
    ecommerce:
      activeMerchants > 0
        ? revenueForStream("ecommerce") / activeMerchants / months
        : 0,
  };

  return {
    mrr,
    arr: mrr * 12,
    arpuByStream,
  };
}