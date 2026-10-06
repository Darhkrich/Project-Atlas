import type { CustomerOrder } from "@/contexts/orders-context";
import type { StoreCustomer } from "@/contexts/store-customers-context";
import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import type { CustomerReport } from "@/lib/merchant/customers/types";
import {
  CHART_ORDERS_TITLE,
  CHART_REVENUE_TITLE,
} from "./labels";
import {
  DAY_MS,
  HOUR_MS,
  LOW_STOCK_THRESHOLD,
  RANGE_BUCKET,
  TOP_PRODUCTS_LIMIT,
} from "./constants";
import type {
  ActionQueueItem,
  AnalyticsBucket,
  AnalyticsKpis,
  AnalyticsRange,
  AnalyticsSnapshot,
  KpiDelta,
  KpiDirection,
  SeriesPoint,
  StatusBreakdownRow,
  TopProduct,
} from "./types";
import type { CustomerOrderStatus } from "@/lib/merchant/orders/types";

const STATUS_ORDER: CustomerOrderStatus[] = [
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function startOfDayMs(nowMs: number): number {
  const d = new Date(nowMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function rangeStartFor(
  range: AnalyticsRange,
  nowMs: number,
  earliestOrderAt: number | null
): number {
  if (range === "today") return startOfDayMs(nowMs);
  if (range === "7d") return nowMs - 7 * DAY_MS;
  if (range === "30d") return nowMs - 30 * DAY_MS;
  if (range === "90d") return nowMs - 90 * DAY_MS;
  return earliestOrderAt ?? startOfDayMs(nowMs);
}

interface PreviousWindow {
  startMs: number;
  endMs: number;
}

function previousWindowFor(
  range: AnalyticsRange,
  currentStartMs: number,
  nowMs: number
): PreviousWindow | null {
  if (range === "all") return null;
  const duration = nowMs - currentStartMs;
  if (duration <= 0) return null;
  return {
    startMs: currentStartMs - duration,
    endMs: currentStartMs,
  };
}

function bucketStartFor(ms: number, bucket: AnalyticsBucket): number {
  const d = new Date(ms);
  if (bucket === "hour") {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours()
    ).getTime();
  }
  if (bucket === "day") {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }
  if (bucket === "week") {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff).getTime();
  }
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function nextBucketStart(ms: number, bucket: AnalyticsBucket): number {
  const d = new Date(ms);
  if (bucket === "hour") {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours() + 1
    ).getTime();
  }
  if (bucket === "day") {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  }
  if (bucket === "week") {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getTime();
  }
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}

function bucketLabel(ms: number, bucket: AnalyticsBucket): string {
  const d = new Date(ms);
  if (bucket === "hour") {
    const hh = String(d.getHours()).padStart(2, "0");
    return hh + ":00";
  }
  const month = d.toLocaleDateString("en-GH", { month: "short" });
  if (bucket === "month") {
    return month + " " + String(d.getFullYear()).slice(-2);
  }
  return month + " " + d.getDate();
}

function generateBuckets(
  startMs: number,
  endMs: number,
  bucket: AnalyticsBucket
): number[] {
  const buckets: number[] = [];
  let cursor = bucketStartFor(startMs, bucket);
  const safeEnd = bucketStartFor(endMs, bucket);
  let guard = 0;
  while (cursor <= safeEnd && guard < 1000) {
    buckets.push(cursor);
    const next = nextBucketStart(cursor, bucket);
    if (next <= cursor) break;
    cursor = next;
    guard += 1;
  }
  return buckets;
}

function revenueFor(orders: CustomerOrder[]): number {
  let total = 0;
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    total += Number.isFinite(o.total) ? o.total : 0;
  }
  return total;
}

function customerCountFor(orders: CustomerOrder[]): number {
  const set = new Set<string>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    if (o.customerEmail) set.add(o.customerEmail.toLowerCase());
  }
  return set.size;
}

function withinRange(
  order: CustomerOrder,
  startMs: number,
  endMs: number
): boolean {
  return order.createdAt >= startMs && order.createdAt < endMs;
}

function deltaFor(
  current: number,
  previous: number
): KpiDelta {
  const changePct =
    previous === 0
      ? null
      : ((current - previous) / previous) * 100;
  let direction: KpiDirection = "flat";
  if (changePct !== null) {
    if (changePct > 0.01) direction = "up";
    else if (changePct < -0.01) direction = "down";
  } else if (current > previous) {
    direction = "up";
  } else if (current < previous) {
    direction = "down";
  }
  return { current, previous, changePct, direction, label: "" };
}

function buildKpis(
  currentWindow: CustomerOrder[],
  previousWindow: CustomerOrder[] | null
): AnalyticsKpis {
  const currentRevenue = revenueFor(currentWindow);
  const currentOrderCount = currentWindow.filter(
    (o) => o.status !== "cancelled"
  ).length;
  const currentAov =
    currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const currentCustomers = customerCountFor(currentWindow);

  let previousRevenue = 0;
  let previousOrderCount = 0;
  let previousAov = 0;
  let previousCustomers = 0;

  if (previousWindow) {
    previousRevenue = revenueFor(previousWindow);
    previousOrderCount = previousWindow.filter(
      (o) => o.status !== "cancelled"
    ).length;
    previousAov =
      previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
    previousCustomers = customerCountFor(previousWindow);
  }

  return {
    revenue: deltaFor(currentRevenue, previousRevenue),
    orders: deltaFor(currentOrderCount, previousOrderCount),
    averageOrderValue: deltaFor(currentAov, previousAov),
    customers: deltaFor(currentCustomers, previousCustomers),
  };
}

function buildSeries(
  windowOrders: CustomerOrder[],
  rangeStartMs: number,
  nowMs: number,
  bucket: AnalyticsBucket
): SeriesPoint[] {
  const bucketStarts = generateBuckets(rangeStartMs, nowMs, bucket);
  const buckets = new Map<
    number,
    { revenue: number; orders: number }
  >();
  for (const start of bucketStarts) {
    buckets.set(start, { revenue: 0, orders: 0 });
  }
  for (const order of windowOrders) {
    if (order.status === "cancelled") continue;
    const key = bucketStartFor(order.createdAt, bucket);
    const entry = buckets.get(key);
    if (!entry) continue;
    entry.orders += 1;
    entry.revenue += Number.isFinite(order.total) ? order.total : 0;
  }
  return bucketStarts.map((start) => {
    const entry = buckets.get(start) ?? { revenue: 0, orders: 0 };
    return {
      bucketStart: start,
      label: bucketLabel(start, bucket),
      revenue: entry.revenue,
      orders: entry.orders,
    };
  });
}

function buildTopProducts(windowOrders: CustomerOrder[]): TopProduct[] {
  const map = new Map<string, { unitsSold: number; revenue: number }>();
  for (const order of windowOrders) {
    if (order.status === "cancelled") continue;
    if (!Array.isArray(order.items)) continue;
    for (const item of order.items) {
      const current = map.get(item.name) ?? { unitsSold: 0, revenue: 0 };
      current.unitsSold += item.quantity;
      current.revenue += item.quantity * item.price;
      map.set(item.name, current);
    }
  }
  const sorted = Array.from(map.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, TOP_PRODUCTS_LIMIT);
  const topRevenue = sorted.length > 0 ? sorted[0].revenue : 0;
  return sorted.map((row) => ({
    name: row.name,
    unitsSold: row.unitsSold,
    revenue: row.revenue,
    shareOfTop: topRevenue > 0 ? row.revenue / topRevenue : 0,
  }));
}

function buildStatusBreakdown(
  windowOrders: CustomerOrder[]
): StatusBreakdownRow[] {
  const counts = new Map<CustomerOrderStatus, number>();
  for (const status of STATUS_ORDER) counts.set(status, 0);
  for (const order of windowOrders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  const max = Math.max(...counts.values(), 1);
  return STATUS_ORDER.map((status) => {
    const count = counts.get(status) ?? 0;
    return {
      status,
      count,
      shareOfMax: count / max,
      href: "/merchant/orders?status=" + status,
    };
  });
}

function buildActionQueue(
  allOrders: CustomerOrder[],
  products: MerchantStorefrontProduct[],
  activeReports: CustomerReport[]
): ActionQueueItem[] {
  const items: ActionQueueItem[] = [];

  const unfulfilled = allOrders.filter(
    (o) => o.status === "new" || o.status === "processing"
  ).length;
  if (unfulfilled > 0) {
    items.push({
      kind: "unfulfilled_orders",
      count: unfulfilled,
      title:
        unfulfilled === 1 ? "Order to fulfil" : "Orders to fulfil",
      description:
        unfulfilled === 1
          ? "1 order is waiting on you."
          : unfulfilled + " orders are waiting on you.",
      href: "/merchant/orders",
    });
  }

  const failedPayments = allOrders.filter(
    (o) => o.paymentStatus === "failed"
  ).length;
  if (failedPayments > 0) {
    items.push({
      kind: "failed_payments",
      count: failedPayments,
      title:
        failedPayments === 1 ? "Failed payment" : "Failed payments",
      description:
        failedPayments === 1
          ? "1 order did not go through."
          : failedPayments + " orders did not go through.",
      href: "/merchant/orders?payment=failed",
    });
  }

  const lowStock = products.filter(
    (p) =>
      typeof p.stockLevel === "number" &&
      p.stockLevel > 0 &&
      p.stockLevel <= LOW_STOCK_THRESHOLD
  ).length;
  if (lowStock > 0) {
    items.push({
      kind: "low_stock",
      count: lowStock,
      title: lowStock === 1 ? "Low stock" : "Low stock",
      description:
        lowStock === 1
          ? "1 product is running low."
          : lowStock + " products are running low.",
      href: "/merchant/products",
    });
  }

  if (activeReports.length > 0) {
    items.push({
      kind: "active_reports",
      count: activeReports.length,
      title:
        activeReports.length === 1
          ? "Customer report"
          : "Customer reports",
      description:
        activeReports.length === 1
          ? "1 customer report is on file with Atlas."
          : activeReports.length + " customer reports are on file.",
      href: "/merchant/customers",
    });
  }

  return items;
}

export interface ProjectAnalyticsInput {
  orders: CustomerOrder[];
  customers: StoreCustomer[];
  products: MerchantStorefrontProduct[];
  activeReports: CustomerReport[];
  range: AnalyticsRange;
  nowMs: number;
}

export function projectMerchantAnalytics(
  input: ProjectAnalyticsInput
): AnalyticsSnapshot {
  const { orders, customers, products, activeReports, range, nowMs } = input;

  const earliestOrderAt =
    orders.length > 0
      ? orders.reduce(
          (min, o) => (o.createdAt < min ? o.createdAt : min),
          orders[0].createdAt
        )
      : null;

  const rangeStartMs = rangeStartFor(range, nowMs, earliestOrderAt);
  const rangeEndMs = nowMs;
  const previous = previousWindowFor(range, rangeStartMs, nowMs);

  const windowOrders = orders.filter((o) =>
    withinRange(o, rangeStartMs, rangeEndMs)
  );

  const previousOrders = previous
    ? orders.filter((o) =>
        withinRange(o, previous.startMs, previous.endMs)
      )
    : null;

  const bucket = RANGE_BUCKET[range];

  const kpis = buildKpis(windowOrders, previousOrders);
  const series = buildSeries(windowOrders, rangeStartMs, rangeEndMs, bucket);
  const topProducts = buildTopProducts(windowOrders);
  const statusBreakdown = buildStatusBreakdown(windowOrders);
  const actionQueue = buildActionQueue(orders, products, activeReports);

  return {
    range,
    bucket,
    kpis,
    series,
    topProducts,
    statusBreakdown,
    actionQueue,
    hasOrdersInRange: windowOrders.length > 0,
    hasOrdersAtAll: orders.length > 0,
    rangeStartMs,
    rangeEndMs,
  };
}

export const CHART_TITLES = {
  revenue: CHART_REVENUE_TITLE,
  orders: CHART_ORDERS_TITLE,
} as const;

export const CHART_BUCKET_MS: Record<AnalyticsBucket, number> = {
  hour: HOUR_MS,
  day: DAY_MS,
  week: 7 * DAY_MS,
  month: 30 * DAY_MS,
};

export type { AnalyticsKpis, AnalyticsSnapshot };