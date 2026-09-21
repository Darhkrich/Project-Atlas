import type {
  Order,
  OrderAudience,
  OrderStatus,
} from "@/lib/admin/types/orders";
import {
  ORDER_STATUS_LABELS,
  serviceLabel,
  networkLabel,
  providerLabel,
} from "./orders-labels";
import { isTodayUtc, isUtcDayAgo } from "./orders-helpers";

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  audience?: OrderAudience;
  serviceId?: string;
  networkId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrdersSummary {
  totalToday: number;
  totalYesterday: number;
  successfulToday: number;
  successRateToday: number;
  successRateYesterday: number;
  retriesToday: number;
  retriesYesterday: number;
  failedToday: number;
  failedYesterday: number;
}

export interface LiveBoardColumnData {
  key: "pending" | "processing" | "retrying";
  orders: Order[];
}

export interface LiveBoardView {
  columns: LiveBoardColumnData[];
  activeCount: number;
}

export interface HistoryRow {
  id: string;
  audience: OrderAudience;
  status: OrderStatus;
  statusLabel: string;
  customerName: string;
  serviceLabel: string;
  networkLabel: string;
  providerLabel: string;
  amount: number;
  commission: number;
  paymentMethodId: string;
  createdAt: string;
}

export interface HistoryView {
  rows: HistoryRow[];
  total: number;
  totalAfterFilter: number;
}

function searchMatches(order: Order, term: string): boolean {
  const needle = term.toLowerCase();
  if (order.id.toLowerCase().includes(needle)) return true;
  if (order.customer.name.toLowerCase().includes(needle)) return true;
  if (order.customer.phone.toLowerCase().includes(needle)) return true;
  if (order.reseller?.name.toLowerCase().includes(needle)) return true;
  return false;
}

export function projectOrdersSummary(
  orders: Order[],
  nowMs: number
): OrdersSummary {
  let totalToday = 0;
  let successfulToday = 0;
  let failedToday = 0;
  let totalYesterday = 0;
  let successfulYesterday = 0;
  let failedYesterday = 0;
  let retriesToday = 0;
  let retriesYesterday = 0;

  for (const order of orders) {
    if (isUtcDayAgo(order.createdAt, nowMs, 0)) {
      totalToday += 1;
      if (order.status === "successful") successfulToday += 1;
      if (order.status === "failed") failedToday += 1;
    } else if (isUtcDayAgo(order.createdAt, nowMs, 1)) {
      totalYesterday += 1;
      if (order.status === "successful") successfulYesterday += 1;
      if (order.status === "failed") failedYesterday += 1;
    }

    for (const ev of order.timeline) {
      if (ev.type !== "retry_scheduled") continue;
      if (isUtcDayAgo(ev.timestamp, nowMs, 0)) retriesToday += 1;
      else if (isUtcDayAgo(ev.timestamp, nowMs, 1)) retriesYesterday += 1;
    }
  }

  const successRateToday =
    totalToday > 0
      ? Math.round((successfulToday / totalToday) * 1000) / 10
      : 0;
  const successRateYesterday =
    totalYesterday > 0
      ? Math.round((successfulYesterday / totalYesterday) * 1000) / 10
      : 0;

  return {
    totalToday,
    totalYesterday,
    successfulToday,
    successRateToday,
    successRateYesterday,
    retriesToday,
    retriesYesterday,
    failedToday,
    failedYesterday,
  };
}

export function projectLiveBoard(orders: Order[]): LiveBoardView {
  const buckets: Record<"pending" | "processing" | "retrying", Order[]> = {
    pending: [],
    processing: [],
    retrying: [],
  };

  for (const order of orders) {
    if (order.status === "pending") buckets.pending.push(order);
    else if (order.status === "processing") buckets.processing.push(order);
    else if (order.status === "retrying") buckets.retrying.push(order);
  }

  const sortByNewest = (a: Order, b: Order) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  buckets.pending.sort(sortByNewest);
  buckets.processing.sort(sortByNewest);
  buckets.retrying.sort(sortByNewest);

  return {
    columns: [
      { key: "pending", orders: buckets.pending },
      { key: "processing", orders: buckets.processing },
      { key: "retrying", orders: buckets.retrying },
    ],
    activeCount:
      buckets.pending.length + buckets.processing.length + buckets.retrying.length,
  };
}

export function projectHistory(
  orders: Order[],
  filters: OrderFilters
): HistoryView {
  const historyStatuses: OrderStatus[] = ["successful", "failed", "cancelled"];
  const base = orders.filter((o) => historyStatuses.includes(o.status));

  const filtered = base.filter((order) => {
    if (filters.search && !searchMatches(order, filters.search)) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.audience && order.audience !== filters.audience) return false;
    if (filters.serviceId && order.serviceId !== filters.serviceId) return false;
    if (filters.networkId && order.networkId !== filters.networkId) return false;
    if (filters.dateFrom) {
      const fromMs = new Date(filters.dateFrom + "T00:00:00Z").getTime();
      if (new Date(order.createdAt).getTime() < fromMs) return false;
    }
    if (filters.dateTo) {
      const toMs = new Date(filters.dateTo + "T23:59:59Z").getTime();
      if (new Date(order.createdAt).getTime() > toMs) return false;
    }
    return true;
  });

  const rows: HistoryRow[] = filtered.map((order) => ({
    id: order.id,
    audience: order.audience,
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    customerName: order.customer.name,
    serviceLabel: serviceLabel(order.serviceId),
    networkLabel: networkLabel(order.networkId),
    providerLabel: providerLabel(order.providerId),
    amount: order.amount,
    commission: order.commission,
    paymentMethodId: order.paymentMethodId,
    createdAt: order.createdAt,
  }));

  return {
    rows,
    total: base.length,
    totalAfterFilter: rows.length,
  };
}

export interface OrdersAnalyticsPoint {
  label: string;
  orders: number;
  revenue: number;
  failures: number;
  retries: number;
}

export interface OrdersAnalyticsView {
  trend: OrdersAnalyticsPoint[];
  statusCounts: { status: OrderStatus; label: string; count: number }[];
  failureClassCounts: { system: number; customer: number };
  retryMetrics: {
    retryingNow: number;
    recoveredToday: number;
    exhaustedToday: number;
  };
  serviceBreakdown: {
    serviceId: string;
    label: string;
    orders: number;
    revenue: number;
    successRate: number;
  }[];
}

export type OrdersAnalyticsRange = "today" | "7d" | "30d";

export function projectOrdersAnalytics(
  orders: Order[],
  nowMs: number,
  range: OrdersAnalyticsRange
): OrdersAnalyticsView {
  const bucketMs = range === "today" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const span = range === "today" ? 24 : range === "7d" ? 7 : 30;

  const buckets: OrdersAnalyticsPoint[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const bucketStart = nowMs - i * bucketMs;
    const d = new Date(bucketStart);
    const label =
      range === "today"
        ? String(d.getUTCHours()).padStart(2, "0") + ":00"
        : String(d.getUTCDate()) + "/" + String(d.getUTCMonth() + 1);
    buckets.push({ label, orders: 0, revenue: 0, failures: 0, retries: 0 });
  }

  const statusCountsMap = new Map<OrderStatus, number>();
  let systemFailures = 0;
  let customerFailures = 0;
  let recoveredToday = 0;
  let exhaustedToday = 0;
  let retryingNow = 0;

  const serviceMap = new Map<
    string,
    { orders: number; revenue: number; successes: number }
  >();

  for (const order of orders) {
    const createdMs = new Date(order.createdAt).getTime();
    const bucketIdx = Math.floor(
      (createdMs - (nowMs - span * bucketMs)) / bucketMs
    );
    if (bucketIdx >= 0 && bucketIdx < buckets.length) {
      const bucket = buckets[bucketIdx];
      bucket.orders += 1;
      if (order.status === "successful") bucket.revenue += order.amount;
      if (order.status === "failed") bucket.failures += 1;
      if (order.retryAttempts > 0) bucket.retries += order.retryAttempts;
    }

    statusCountsMap.set(
      order.status,
      (statusCountsMap.get(order.status) ?? 0) + 1
    );

    if (order.failure?.class === "system") systemFailures += 1;
    if (order.failure?.class === "customer") customerFailures += 1;

    if (order.status === "retrying") retryingNow += 1;

    if (order.status === "successful" && order.retryAttempts > 0) {
      if (isTodayUtc(order.createdAt, nowMs)) recoveredToday += 1;
    }
    if (
      order.status === "failed" &&
      order.retryAttempts >= order.maxRetryAttempts
    ) {
      if (isTodayUtc(order.createdAt, nowMs)) exhaustedToday += 1;
    }

    const entry = serviceMap.get(order.serviceId) ?? {
      orders: 0,
      revenue: 0,
      successes: 0,
    };
    entry.orders += 1;
    if (order.status === "successful") {
      entry.revenue += order.amount;
      entry.successes += 1;
    }
    serviceMap.set(order.serviceId, entry);
  }

  const statusOrder: OrderStatus[] = [
    "successful",
    "failed",
    "cancelled",
    "pending",
    "processing",
    "retrying",
  ];

  const statusCounts = statusOrder
    .map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      count: statusCountsMap.get(status) ?? 0,
    }))
    .filter((entry) => entry.count > 0);

  const serviceBreakdown = Array.from(serviceMap.entries()).map(
    ([serviceId, entry]) => ({
      serviceId,
      label: serviceLabel(serviceId),
      orders: entry.orders,
      revenue: Math.round(entry.revenue * 100) / 100,
      successRate:
        entry.orders > 0
          ? Math.round((entry.successes / entry.orders) * 1000) / 10
          : 0,
    })
  );

  return {
    trend: buckets,
    statusCounts,
    failureClassCounts: {
      system: systemFailures,
      customer: customerFailures,
    },
    retryMetrics: { retryingNow, recoveredToday, exhaustedToday },
    serviceBreakdown,
  };
}