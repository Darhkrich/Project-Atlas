import { serviceLabel } from "@/lib/domains/orders/reseller-order-labels";
import type { ResellerOrderRow } from "@/lib/domains/orders/reseller-order-types";
import type { ResellerStorefrontConfig } from "@/types/reseller-storefront";
import {
  DAY_MS,
  FAILED_ORDERS_WINDOW_MS,
  RECENT_ORDERS_LIMIT,
  ROUTES,
  TOP_SERVICES_LIMIT,
} from "./constants";
import { ACTION_QUEUE_COPY } from "./labels";
import type {
  ActionQueueItem,
  ProjectActionQueueInput,
  StorefrontHealth,
  TodayMetrics,
  TopService,
} from "./types";

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function projectToday(
  orders: ResellerOrderRow[],
  nowMs: number,
  commissionsThisMonth: number | null,
  walletBalance: number | null
): TodayMetrics {
  const dayStart = startOfUtcDay(nowMs);
  const dayEnd = dayStart + DAY_MS;
  let ordersToday = 0;
  let revenueToday = 0;
  for (const o of orders) {
    const t = new Date(o.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    if (t < dayStart || t >= dayEnd) continue;
    ordersToday += 1;
    if (o.status === "successful") revenueToday += o.amount;
  }
  return {
    ordersToday,
    revenueToday: Math.round(revenueToday * 100) / 100,
    commissionsThisMonth,
    walletBalance,
  };
}

export function projectTopServices(orders: ResellerOrderRow[]): TopService[] {
  const counts = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const current = counts.get(o.serviceId) ?? { count: 0, revenue: 0 };
    current.count += 1;
    if (o.status === "successful") current.revenue += o.amount;
    counts.set(o.serviceId, current);
  }
  const total = orders.length;
  if (total === 0) return [];
  return Array.from(counts.entries())
    .map(([serviceId, data]) => ({
      serviceId,
      label: serviceLabel(serviceId),
      orderCount: data.count,
      revenue: Math.round(data.revenue * 100) / 100,
      percentage: Math.round((data.count / total) * 100),
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, TOP_SERVICES_LIMIT);
}

export function projectRecentOrders(
  orders: ResellerOrderRow[]
): ResellerOrderRow[] {
  return orders.slice(0, RECENT_ORDERS_LIMIT);
}

export function projectStorefrontHealth(
  config: ResellerStorefrontConfig,
  orders: ResellerOrderRow[]
): StorefrontHealth | null {
  if (!config.slug) return null;
  const serviceCount = config.services.filter((s) => s.enabled).length;
  const lastOrderAt = orders.length > 0 ? orders[0].createdAt : null;
  return {
    status: config.status === "live" ? "live" : "draft",
    slug: config.slug,
    serviceCount,
    lastOrderAt,
  };
}

export function projectActionQueue(
  input: ProjectActionQueueInput
): ActionQueueItem[] {
  const { reseller, orders, pendingWithdrawalsCount, resellerConfig, nowMs } =
    input;
  const items: ActionQueueItem[] = [];

  if (reseller.verificationStatus && reseller.verificationStatus !== "verified") {
    const copy = ACTION_QUEUE_COPY.verification;
    items.push({
      id: "verification",
      kind: "verification",
      headline: copy.headline,
      body: copy.body,
      href: ROUTES.settings,
      tone: "warning",
    });
  }

  const cutoff = nowMs - FAILED_ORDERS_WINDOW_MS;
  const failedRecent = orders.filter((o) => {
    if (o.status !== "failed") return false;
    const t = new Date(o.createdAt).getTime();
    return !Number.isNaN(t) && t >= cutoff;
  });
  if (failedRecent.length > 0) {
    const copy = ACTION_QUEUE_COPY.failed_orders;
    items.push({
      id: "failed_orders",
      kind: "failed_orders",
      headline: copy.headline,
      body:
        String(failedRecent.length) +
        (failedRecent.length === 1 ? " order needs review." : " orders need review."),
      href: ROUTES.ordersFailed,
      tone: "danger",
    });
  }

  if (pendingWithdrawalsCount > 0) {
    const copy = ACTION_QUEUE_COPY.pending_withdrawals;
    items.push({
      id: "pending_withdrawals",
      kind: "pending_withdrawals",
      headline: copy.headline,
      body:
        String(pendingWithdrawalsCount) +
        (pendingWithdrawalsCount === 1
          ? " withdrawal in progress."
          : " withdrawals in progress."),
      href: ROUTES.wallet,
      tone: "info",
    });
  }

  if (resellerConfig.slug && resellerConfig.status !== "live") {
    const copy = ACTION_QUEUE_COPY.unpublished_storefront;
    items.push({
      id: "unpublished_storefront",
      kind: "unpublished_storefront",
      headline: copy.headline,
      body: copy.body,
      href: ROUTES.storefront,
      tone: "warning",
    });
  }

  const enabledServices = resellerConfig.services.filter((s) => s.enabled);
  if (resellerConfig.services.length > 0 && enabledServices.length === 0) {
    const copy = ACTION_QUEUE_COPY.no_services;
    items.push({
      id: "no_services",
      kind: "no_services",
      headline: copy.headline,
      body: copy.body,
      href: ROUTES.services,
      tone: "warning",
    });
  }

  return items;
}