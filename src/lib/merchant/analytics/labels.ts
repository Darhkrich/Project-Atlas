import type { AnalyticsRange } from "./types";

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

export const RANGE_DESCRIPTIONS: Record<AnalyticsRange, string> = {
  today: "Orders placed today.",
  "7d": "Orders placed in the last 7 days.",
  "30d": "Orders placed in the last 30 days.",
  "90d": "Orders placed in the last 90 days.",
  all: "Every order your store has received.",
};

export const KPI_LABELS = {
  revenue: "Revenue",
  orders: "Orders",
  averageOrderValue: "Avg order value",
  customers: "Customers",
} as const;

export const DELTA_VS_PREV = "vs prev";

export const EMPTY_NO_ORDERS_TITLE = "No orders in this window";
export const EMPTY_NO_ORDERS_BODY =
  "Try a wider range, or come back when a customer buys.";
export const EMPTY_NO_ORDERS_CTA = "View last 30 days";

export const EMPTY_NEVER_TITLE = "No orders yet";
export const EMPTY_NEVER_BODY =
  "When a customer buys from your store, their orders appear here.";
export const EMPTY_NEVER_CTA = "View your storefront";

export const TOP_PRODUCTS_EMPTY = "No product sales in this window.";
export const STATUS_BREAKDOWN_EMPTY = "No orders in this window.";
export const ACTION_QUEUE_EMPTY = "You are all caught up.";
export const CHART_REVENUE_TITLE = "Revenue";
export const CHART_ORDERS_TITLE = "Orders";
export const CHART_EMPTY = "Not enough data in this window.";