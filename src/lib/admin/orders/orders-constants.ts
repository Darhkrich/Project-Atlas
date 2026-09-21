import type { OrderFailureReason } from "@/lib/admin/types/orders";

export const ORDERS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_ORDERS_PAGE_SIZE = 20;

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_BACKOFF_MS: number[] = [30_000, 120_000];
export const RETRY_TICK_MS = 1000;

export const ORDERS_HISTORY_STATUSES = [
  "successful",
  "failed",
  "cancelled",
] as const;

export const SYSTEM_FAILURE_REASONS: OrderFailureReason[] = [
  "provider_timeout",
  "provider_error",
  "provider_unavailable",
  "atlas_internal_error",
];

export const CUSTOMER_FAILURE_REASONS: OrderFailureReason[] = [
  "insufficient_balance",
  "invalid_recipient",
  "cancelled_by_customer",
  "cancelled_by_admin",
  "duplicate_detected",
  "limit_exceeded",
];

export const ORDERS_DEFAULT_DATE_RANGE_DAYS = 30;

export const ORDERS_ANALYTICS_RANGES = ["today", "7d", "30d"] as const;
export type OrdersAnalyticsRange = (typeof ORDERS_ANALYTICS_RANGES)[number];

export const ORDERS_LIVE_BOARD_COLUMNS = [
  "pending",
  "processing",
  "retrying",
] as const;
export type OrdersLiveBoardColumn = (typeof ORDERS_LIVE_BOARD_COLUMNS)[number];