import type {
  CustomerOrderStatus,
  CustomerOrderPaymentStatus,
  OrderEventType,
  OrderFilterState,
  OrderRow,
  OrderSummarySnapshot,
  OrderTimelineItem,
} from "./types";
import {
  ORDER_STATUS_VARIANT_MAP,
  ORDERS_RECENT_ACTIVITY_DAYS,
  ORDERS_TIMELINE_PREVIEW_LIMIT,
} from "./constants";
import { ORDER_EVENT_LABELS } from "./labels";

export interface ProjectableOrder {
  id: string;
  orderNumber: string;
  storeSlug: string;
  customerEmail: string;
  customerName?: string;
  total: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  items: { name: string; quantity: number; price: number }[];
  createdAt: number;
  updatedAt: number;
  events?: {
    id: string;
    type: OrderEventType;
    description: string;
    actor: { name: string };
    createdAt: number;
  }[];
}

function customerDisplayName(order: ProjectableOrder): string {
  const explicit = (order.customerName ?? "").trim();
  if (explicit.length > 0) return explicit;
  const local = order.customerEmail.split("@")[0] ?? "";
  return local.length > 0 ? local : "Customer";
}

function itemCount(order: ProjectableOrder): number {
  if (!Array.isArray(order.items)) return 0;
  return order.items.reduce(
    (sum, it) => sum + (Number.isFinite(it.quantity) ? it.quantity : 0),
    0
  );
}

function primaryItemName(order: ProjectableOrder): string {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    return "No items";
  }
  const first = order.items[0];
  if (!first?.name) return "No items";
  if (order.items.length === 1) return first.name;
  return first.name + " +" + String(order.items.length - 1);
}

export function projectOrderRow(order: ProjectableOrder): OrderRow {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: customerDisplayName(order),
    customerEmail: order.customerEmail,
    itemCount: itemCount(order),
    total: Number.isFinite(order.total) ? order.total : 0,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    primaryItemName: primaryItemName(order),
  };
}

function matchesSearch(order: ProjectableOrder, term: string): boolean {
  if (term.length === 0) return true;
  const t = term.toLowerCase();
  if (order.orderNumber.toLowerCase().includes(t)) return true;
  if (order.customerEmail.toLowerCase().includes(t)) return true;
  const name = customerDisplayName(order).toLowerCase();
  if (name.includes(t)) return true;
  if (Array.isArray(order.items)) {
    for (const it of order.items) {
      if (it.name.toLowerCase().includes(t)) return true;
    }
  }
  return false;
}

function startOfDayMs(nowMs: number): number {
  const d = new Date(nowMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function matchesDateRange(
  order: ProjectableOrder,
  range: OrderFilterState["dateRange"],
  nowMs: number
): boolean {
  if (range === "All") return true;
  const dayStart = startOfDayMs(nowMs);
  const day = 24 * 60 * 60 * 1000;
  if (range === "Today") return order.createdAt >= dayStart;
  if (range === "Last7") return order.createdAt >= dayStart - 6 * day;
  if (range === "Last30") return order.createdAt >= dayStart - 29 * day;
  return true;
}

function statusPriority(status: CustomerOrderStatus): number {
  switch (status) {
    case "new":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return 4;
  }
}

function sortRows(rows: OrderRow[], key: OrderFilterState["sort"]): OrderRow[] {
  const next = rows.slice();
  switch (key) {
    case "action_first":
      return next.sort((a, b) => {
        const pa = statusPriority(a.status);
        const pb = statusPriority(b.status);
        if (pa !== pb) return pa - pb;
        return b.createdAt - a.createdAt;
      });
    case "recent":
      return next.sort((a, b) => b.createdAt - a.createdAt);
    case "oldest":
      return next.sort((a, b) => a.createdAt - b.createdAt);
    case "value_desc":
      return next.sort((a, b) => b.total - a.total);
    case "value_asc":
      return next.sort((a, b) => a.total - b.total);
    case "customer_asc":
      return next.sort((a, b) =>
        a.customerName.toLowerCase().localeCompare(b.customerName.toLowerCase())
      );
  }
}

export interface ProjectOrdersInput {
  orders: ProjectableOrder[];
  filters: OrderFilterState;
  nowMs: number;
}

export interface ProjectedOrders {
  rows: OrderRow[];
  summary: OrderSummarySnapshot;
  appliedFiltersActive: boolean;
}

export function projectOrders(input: ProjectOrdersInput): ProjectedOrders {
  const { orders, filters, nowMs } = input;

  const summary = summarizeOrders(orders, nowMs);

  const filtered = orders.filter((o) => {
    if (!matchesSearch(o, filters.search)) return false;
    if (filters.status !== "All" && o.status !== filters.status) return false;
    if (
      filters.paymentStatus !== "All" &&
      o.paymentStatus !== filters.paymentStatus
    ) {
      return false;
    }
    if (!matchesDateRange(o, filters.dateRange, nowMs)) return false;
    return true;
  });

  const rows = sortRows(filtered.map(projectOrderRow), filters.sort);

  const appliedFiltersActive =
    filters.search.trim().length > 0 ||
    filters.status !== "All" ||
    filters.paymentStatus !== "All" ||
    filters.dateRange !== "All";

  return { rows, summary, appliedFiltersActive };
}

export function summarizeOrders(
  orders: ProjectableOrder[],
  nowMs: number
): OrderSummarySnapshot {
  const dayStart = startOfDayMs(nowMs);
  let newCount = 0;
  let processingCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;
  let pendingPaymentCount = 0;
  let revenueTotal = 0;
  let revenueToday = 0;

  for (const o of orders) {
    if (o.status === "new") newCount += 1;
    else if (o.status === "processing") processingCount += 1;
    else if (o.status === "shipped") shippedCount += 1;
    else if (o.status === "delivered") deliveredCount += 1;
    else if (o.status === "cancelled") cancelledCount += 1;

    if (o.paymentStatus === "pending" || o.paymentStatus === "failed") {
      pendingPaymentCount += 1;
    }

    if (o.status !== "cancelled") {
      revenueTotal += Number.isFinite(o.total) ? o.total : 0;
      if (o.createdAt >= dayStart) {
        revenueToday += Number.isFinite(o.total) ? o.total : 0;
      }
    }
  }

  return {
    totalOrders: orders.length,
    newCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    awaitingShipmentCount: processingCount,
    pendingPaymentCount,
    revenueTotal,
    revenueToday,
  };
}

export function statusVariantFor(
  status: CustomerOrderStatus
): "warning" | "info" | "brand" | "success" | "neutral" {
  return ORDER_STATUS_VARIANT_MAP[status];
}

export function isAwaitingAction(status: CustomerOrderStatus): boolean {
  return status === "new" || status === "processing";
}

export function isRevenueCounted(status: CustomerOrderStatus): boolean {
  return status !== "cancelled";
}

export function timelineFromOrder(order: ProjectableOrder): OrderTimelineItem[] {
  const events = Array.isArray(order.events) ? order.events : [];
  const rows = events.map((e) => ({
    id: e.id,
    type: e.type,
    description: e.description,
    actorName: e.actor?.name ?? "System",
    createdAt: e.createdAt,
    tone: toneForEvent(e.type),
  }));
  rows.sort((a, b) => b.createdAt - a.createdAt);
  return rows;
}

export function timelinePreviewFromOrder(
  order: ProjectableOrder
): OrderTimelineItem[] {
  return timelineFromOrder(order).slice(0, ORDERS_TIMELINE_PREVIEW_LIMIT);
}

export function recentActivityWindowMs(nowMs: number): number {
  return nowMs - ORDERS_RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000;
}

function toneForEvent(
  type: OrderEventType
): "neutral" | "info" | "success" | "warning" | "danger" {
  switch (type) {
    case "placed":
      return "info";
    case "payment_confirmed":
      return "success";
    case "payment_failed":
      return "danger";
    case "status_changed":
      return "info";
    case "shipped":
      return "info";
    case "delivered":
      return "success";
    case "cancelled":
      return "warning";
    case "refunded":
      return "warning";
    case "note_added":
      return "neutral";
  }
}

export function labelForEventType(type: OrderEventType): string {
  return ORDER_EVENT_LABELS[type];
}