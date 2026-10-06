import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
  OrderCancelReason,
  OrderCancelRecord,
  OrderEvent,
  OrderEventActor,
  OrderNote,
  OrderShippingAddress,
} from "./types";
import {
  buildPlacedEvent,
  buildStatusChangedEvent,
} from "./timeline";
import { mutationError, type OrderMutationError } from "./errors";
import {
  validateCancelAllowed,
  validateCancelNote,
  validateCarrier,
  validateOrderNote,
  validateOrderStatusTransition,
  validateShipAllowed,
  validateTrackingNumber,
} from "./validation";

export interface MutableOrder {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  total: number;
  createdAt: number;
  updatedAt: number;
  events?: OrderEvent[];
  notes?: OrderNote[];
  cancelRecord?: OrderCancelRecord | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  refundIds?: string[];
  shippingAddress?: OrderShippingAddress | null;
}

export interface OrderMutationResult {
  ok: boolean;
  error?: OrderMutationError;
  patch?: Partial<MutableOrder>;
  event?: OrderEvent;
}

function mergeEventList(
  order: MutableOrder,
  event: OrderEvent | undefined
): OrderEvent[] | undefined {
  if (!event) return undefined;
  const existing = Array.isArray(order.events) ? order.events : [];
  return [...existing, event];
}

/* --------------------------- status transition -------------------------- */

export interface TransitionStatusInput {
  to: CustomerOrderStatus;
  description?: string;
}

export function transitionOrderStatus(
  order: MutableOrder,
  input: TransitionStatusInput,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  const validation = validateOrderStatusTransition(order.status, input.to);
  if (validation) return { ok: false, error: validation };

  const description =
    input.description && input.description.trim().length > 0
      ? input.description.trim()
      : defaultStatusDescription(order.status, input.to);

  const event = buildStatusChangedEvent(
    order.status,
    input.to,
    actor,
    description,
    nowMs
  );

  return {
    ok: true,
    event,
    patch: {
      status: input.to,
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

function defaultStatusDescription(
  from: CustomerOrderStatus,
  to: CustomerOrderStatus
): string {
  return "Status changed from " + labelFor(from) + " to " + labelFor(to) + ".";
}

function labelFor(status: CustomerOrderStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

/* ------------------------------- ship ---------------------------------- */

export interface ShipOrderInput {
  carrier: string;
  trackingNumber: string;
}

export function shipOrder(
  order: MutableOrder,
  input: ShipOrderInput,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  const statusError = validateShipAllowed(order.status);
  if (statusError) return { ok: false, error: statusError };

  const carrierError = validateCarrier(input.carrier);
  if (carrierError) return { ok: false, error: carrierError };

  const trackingError = validateTrackingNumber(input.trackingNumber);
  if (trackingError) return { ok: false, error: trackingError };

  const carrier = input.carrier.trim();
  const tracking = input.trackingNumber.trim();

  const event: OrderEvent = {
    id: crypto.randomUUID(),
    type: "shipped",
    description:
      "Order shipped via " + carrier + ". Tracking " + tracking + ".",
    actor,
    createdAt: nowMs,
    fromStatus: "processing",
    toStatus: "shipped",
    metadata: { carrier, trackingNumber: tracking },
  };

  return {
    ok: true,
    event,
    patch: {
      status: "shipped",
      carrier,
      trackingNumber: tracking,
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

/* ------------------------------- cancel -------------------------------- */

export interface CancelOrderInput {
  reason: OrderCancelReason;
  note?: string;
  restock: boolean;
}

export function cancelOrder(
  order: MutableOrder,
  input: CancelOrderInput,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  const statusError = validateCancelAllowed(order.status);
  if (statusError) return { ok: false, error: statusError };

  const noteError = validateCancelNote(input.note);
  if (noteError) return { ok: false, error: noteError };

  const trimmedNote =
    input.note && input.note.trim().length > 0
      ? input.note.trim()
      : undefined;

  const record: OrderCancelRecord = {
    reason: input.reason,
    note: trimmedNote,
    restock: input.restock,
    cancelledBy: actor,
    cancelledAt: nowMs,
  };

  const from = order.status;
  const event: OrderEvent = {
    id: crypto.randomUUID(),
    type: "cancelled",
    description:
      "Order cancelled. Reason: " + cancelReasonLabel(input.reason) + ".",
    actor,
    createdAt: nowMs,
    fromStatus: from,
    toStatus: "cancelled",
    metadata: {
      reason: input.reason,
      restock: input.restock ? "yes" : "no",
    },
  };

  return {
    ok: true,
    event,
    patch: {
      status: "cancelled",
      cancelRecord: record,
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

function cancelReasonLabel(reason: OrderCancelReason): string {
  switch (reason) {
    case "customer_request":
      return "Customer requested";
    case "out_of_stock":
      return "Out of stock";
    case "unable_to_fulfill":
      return "Unable to fulfil";
    case "other":
      return "Other";
  }
}

/* ------------------------------- note ---------------------------------- */

export interface AddNoteInput {
  body: string;
}

export function addOrderNote(
  order: MutableOrder,
  input: AddNoteInput,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  const noteError = validateOrderNote(input.body);
  if (noteError) return { ok: false, error: noteError };

  const body = input.body.trim();
  const note: OrderNote = {
    id: crypto.randomUUID(),
    body,
    author: actor,
    createdAt: nowMs,
  };

  const existingNotes = Array.isArray(order.notes) ? order.notes : [];

  const event: OrderEvent = {
    id: crypto.randomUUID(),
    type: "note_added",
    description: body.length > 80 ? body.slice(0, 77) + "..." : body,
    actor,
    createdAt: nowMs,
  };

  return {
    ok: true,
    event,
    patch: {
      notes: [...existingNotes, note],
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

/* ------------------------------ payments -------------------------------- */

export function markPaymentConfirmed(
  order: MutableOrder,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  if (order.paymentStatus !== "pending") {
    return {
      ok: false,
      error: mutationError(
        "payment_status_conflict",
        "Payment can only be confirmed while it is pending."
      ),
    };
  }

  const event: OrderEvent = {
    id: crypto.randomUUID(),
    type: "payment_confirmed",
    description: "Payment confirmed.",
    actor,
    createdAt: nowMs,
  };

  return {
    ok: true,
    event,
    patch: {
      paymentStatus: "paid",
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

export function markPaymentFailed(
  order: MutableOrder,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  if (order.paymentStatus !== "pending") {
    return {
      ok: false,
      error: mutationError(
        "payment_status_conflict",
        "Payment can only be marked failed while it is pending."
      ),
    };
  }

  const event: OrderEvent = {
    id: crypto.randomUUID(),
    type: "payment_failed",
    description: "Payment failed.",
    actor,
    createdAt: nowMs,
  };

  return {
    ok: true,
    event,
    patch: {
      paymentStatus: "failed",
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

/* ---------------------------- refund bookkeeping ----------------------- */

export interface MarkRefundedInput {
  amount: number;
  refundId: string;
  isPartial: boolean;
  description: string;
}

export function markOrderRefunded(
  order: MutableOrder,
  input: MarkRefundedInput,
  actor: OrderEventActor,
  nowMs: number
): OrderMutationResult {
  if (
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "partially_refunded"
  ) {
    return {
      ok: false,
      error: mutationError(
        "payment_status_conflict",
        "Only paid or partially refunded orders can be refunded."
      ),
    };
  }

  const nextStatus: CustomerOrderPaymentStatus = input.isPartial
    ? "partially_refunded"
    : "refunded";

  const existingRefunds = Array.isArray(order.refundIds)
    ? order.refundIds
    : [];

  const event: OrderEvent = {
    id: crypto.randomUUID(),
    type: "refunded",
    description: input.description,
    actor,
    createdAt: nowMs,
    metadata: {
      refundId: input.refundId,
      amount: input.amount.toFixed(2),
      partial: input.isPartial ? "yes" : "no",
    },
  };

  return {
    ok: true,
    event,
    patch: {
      paymentStatus: nextStatus,
      refundIds: [...existingRefunds, input.refundId],
      updatedAt: nowMs,
      events: mergeEventList(order, event),
    },
  };
}

/* ------------------------------ placed --------------------------------- */

export function buildInitialPlacedEvent(
  actor: OrderEventActor,
  nowMs: number
): OrderEvent {
  return buildPlacedEvent(actor, nowMs);
}

/* ------------------------------ helpers -------------------------------- */

export function orderAlreadyRefundedAmount(
  order: MutableOrder,
  refundAmountsById: Record<string, number>
): number {
  const ids = Array.isArray(order.refundIds) ? order.refundIds : [];
  let total = 0;
  for (const id of ids) {
    const amount = refundAmountsById[id];
    if (typeof amount === "number" && Number.isFinite(amount)) {
      total += amount;
    }
  }
  return total;
}