import type { Order, OrderFailureReason } from "../types/orders";
import {
  getOrders,
  internalReplaceOrder,
  notify,
  resetForTest as resetStoreForTest,
} from "./orders-store";
import { RETRY_TICK_MS } from "../orders/orders-constants";
import { getRetryScenario, isSuccessAttempt } from "./orders-retry-scenarios";
import { nextRetryDelayMs } from "../orders/retry";
import { fireAutomaticRefund } from "../refunds/automatic-refund";
import { appendAuditEntry, type AuditActor } from "@/lib/domains/audit";
import { emitOrderSettled } from "@/lib/domains/orders/emit-order-settled";

interface ActivityEntry {
  orderId: string;
  audience: Order["audience"];
  message: string;
}

function writeActivity(entry: ActivityEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[activity]", entry);
  }
}

let tickHandle: ReturnType<typeof setInterval> | null = null;

export function startRetryTick(): void {
  if (tickHandle !== null) return;
  if (typeof window === "undefined") return;
  tickHandle = setInterval(() => {
    runRetryTick(Date.now());
  }, RETRY_TICK_MS);
}

export function stopRetryTick(): void {
  if (tickHandle !== null) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

export function runRetryTick(nowMs: number): void {
  const orders = getOrders();
  let anyChanged = false;
  for (const order of orders) {
    if (order.status !== "retrying") continue;
    if (!order.nextRetryAt) continue;
    if (new Date(order.nextRetryAt).getTime() > nowMs) continue;
    const next = advanceRetry(order, nowMs);
    if (internalReplaceOrder(order.id, next)) {
      anyChanged = true;
    }
  }
  if (anyChanged) notify();
}

function advanceRetry(order: Order, nowMs: number): Order {
  const nextAttempt = order.retryAttempts + 1;
  const scenario = getRetryScenario(order.id);
  const succeeds = isSuccessAttempt(scenario, nextAttempt);
  const nowIso = new Date(nowMs).toISOString();

  const attemptEvent = {
    type: "dispatch_attempt" as const,
    status: "info" as const,
    timestamp: nowIso,
    attempt: nextAttempt,
    label: "Dispatch attempt #" + nextAttempt,
  };

  if (succeeds) {
    const deliveredAt = new Date(nowMs + 300).toISOString();
    const settledAt = new Date(nowMs + 600).toISOString();
    const next: Order = {
      ...order,
      status: "successful",
      retryAttempts: nextAttempt,
      lastRetriedAt: nowIso,
      nextRetryAt: undefined,
      failure: undefined,
      walletDebit: order.walletDebit
        ? {
            ...order.walletDebit,
            status: "captured",
            capturedAt: settledAt,
          }
        : undefined,
      timeline: [
        ...order.timeline,
        attemptEvent,
        {
          type: "provider_response",
          status: "success",
          timestamp: deliveredAt,
          attempt: nextAttempt,
          label: "Provider response #" + nextAttempt,
        },
        {
          type: "delivered",
          status: "success",
          timestamp: deliveredAt,
          label: "Delivered",
        },
        {
          type: "settled",
          status: "success",
          timestamp: settledAt,
          label: "Settled",
        },
      ],
    };
    emitOrderSettled({
      order: next,
      providerCost: next.providerCost ?? null,
    });
    writeActivity({
      orderId: order.id,
      audience: order.audience,
      message: "Order recovered on retry attempt " + nextAttempt,
    });
    return next;
  }

  if (nextAttempt >= order.maxRetryAttempts) {
    const releasedAt = new Date(nowMs + 400).toISOString();
    const next: Order = {
      ...order,
      status: "failed",
      retryAttempts: nextAttempt,
      lastRetriedAt: nowIso,
      nextRetryAt: undefined,
      walletDebit: order.walletDebit
        ? {
            ...order.walletDebit,
            status: "released",
            releasedAt,
            releaseReason: order.failure?.reason,
          }
        : undefined,
      timeline: [
        ...order.timeline,
        attemptEvent,
        {
          type: "provider_response",
          status: "danger",
          timestamp: releasedAt,
          attempt: nextAttempt,
          label: "Provider response #" + nextAttempt,
        },
      ],
    };

    fireAutomaticRefund(next);

    writeActivity({
      orderId: order.id,
      audience: order.audience,
      message: "Order failed permanently after " + nextAttempt + " attempts",
    });
    return next;
  }

  const delayMs = nextRetryDelayMs(nextAttempt);
  const scheduledAt = new Date(nowMs + delayMs).toISOString();
  return {
    ...order,
    retryAttempts: nextAttempt,
    lastRetriedAt: nowIso,
    nextRetryAt: scheduledAt,
    timeline: [
      ...order.timeline,
      attemptEvent,
      {
        type: "provider_response",
        status: "danger",
        timestamp: nowIso,
        attempt: nextAttempt,
        label: "Provider response #" + nextAttempt,
      },
      {
        type: "retry_scheduled",
        status: "warning",
        timestamp: nowIso,
        attempt: nextAttempt,
        label: "Retry scheduled",
      },
    ],
  };
}

export function cancelOrder(
  orderId: string,
  reason: string,
  actor: AuditActor
): boolean {
  const trimmed = reason.trim();
  if (!trimmed) return false;

  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (order.status !== "pending") return false;

  const nowIso = new Date().toISOString();
  const adminReason: OrderFailureReason = "cancelled_by_admin";

  const next: Order = {
    ...order,
    status: "cancelled",
    failure: {
      class: "customer",
      reason: adminReason,
      occurredAt: nowIso,
    },
    walletDebit: order.walletDebit
      ? {
          ...order.walletDebit,
          status: "released",
          releasedAt: nowIso,
          releaseReason: adminReason,
        }
      : undefined,
    timeline: [
      ...order.timeline,
      {
        type: "cancelled",
        status: "warning",
        timestamp: nowIso,
        label: "Cancelled",
        description: trimmed,
      },
      ...(order.walletDebit
        ? [
            {
              type: "released" as const,
              status: "warning" as const,
              timestamp: nowIso,
              label: "Hold released",
              description: "Cancelled by admin",
            },
          ]
        : []),
    ],
  };

  if (!internalReplaceOrder(orderId, next)) return false;

  appendAuditEntry({
    action: "order.cancel",
    resourceType: "order",
    resourceId: orderId,
    actor,
    metadata: { reason: trimmed, audience: order.audience },
  });
  writeActivity({
    orderId,
    audience: order.audience,
    message: "Order cancelled: " + trimmed,
  });
  notify();
  return true;
}

export function resetOrdersForTest(): void {
  stopRetryTick();
  resetStoreForTest();
}