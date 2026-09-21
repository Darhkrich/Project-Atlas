import type { Order } from "@/lib/admin/types/orders";
import {
  MAX_RETRY_ATTEMPTS,
  RETRY_BACKOFF_MS,
  SYSTEM_FAILURE_REASONS,
} from "./orders-constants";

export function isSystemReason(reason: string): boolean {
  return SYSTEM_FAILURE_REASONS.includes(reason as Order["failure"] extends infer F
    ? F extends { reason: infer R }
      ? R
      : never
    : never);
}

export function nextRetryDelayMs(attempt: number): number {
  const idx = Math.min(Math.max(attempt - 1, 0), RETRY_BACKOFF_MS.length - 1);
  return RETRY_BACKOFF_MS[idx];
}

export function canRetry(order: Order): boolean {
  if (order.status !== "retrying") return false;
  if (order.failure?.class !== "system") return false;
  if (order.retryAttempts >= order.maxRetryAttempts) return false;
  return true;
}

export interface RetryState {
  willRetry: boolean;
  attemptsRemaining: number;
  nextAttemptAt?: string;
  exhausted: boolean;
}

export function deriveRetryState(order: Order): RetryState {
  const attemptsRemaining = Math.max(
    0,
    order.maxRetryAttempts - order.retryAttempts
  );

  if (order.status === "retrying") {
    return {
      willRetry: attemptsRemaining > 0,
      attemptsRemaining,
      nextAttemptAt: order.nextRetryAt,
      exhausted: false,
    };
  }

  if (order.status === "failed" && order.failure?.class === "system") {
    return { willRetry: false, attemptsRemaining: 0, exhausted: true };
  }

  return { willRetry: false, attemptsRemaining, exhausted: false };
}

export function defaultMaxRetryAttempts(): number {
  return MAX_RETRY_ATTEMPTS;
}