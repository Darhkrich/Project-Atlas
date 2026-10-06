import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
} from "./types";
import {
  canTransitionOrderStatus,
  isTerminalOrderStatus,
} from "./types";
import { mutationError, type OrderMutationError } from "./errors";
import {
  ORDER_CANCEL_NOTE_MAX_LENGTH,
  ORDER_CARRIER_MAX_LENGTH,
  ORDER_NOTE_MAX_LENGTH,
  ORDER_NOTE_MIN_LENGTH,
  ORDER_TRACKING_NUMBER_MAX_LENGTH,
} from "./constants";

export const PAYMENT_TRANSITIONS: Record<
  CustomerOrderPaymentStatus,
  CustomerOrderPaymentStatus[]
> = {
  pending: ["paid", "failed"],
  paid: ["refunded", "partially_refunded"],
  partially_refunded: ["refunded", "partially_refunded"],
  refunded: [],
  failed: [],
};

export function canTransitionPaymentStatus(
  from: CustomerOrderPaymentStatus,
  to: CustomerOrderPaymentStatus
): boolean {
  if (from === to && to !== "partially_refunded") return false;
  return PAYMENT_TRANSITIONS[from].includes(to);
}

export function validateOrderStatusTransition(
  from: CustomerOrderStatus,
  to: CustomerOrderStatus
): OrderMutationError | null {
  if (isTerminalOrderStatus(from)) {
    return mutationError(
      "terminal_status",
      "This order is in a terminal state and cannot change further."
    );
  }
  if (!canTransitionOrderStatus(from, to)) {
    return mutationError(
      "invalid_transition",
      "That status change is not allowed from the current state."
    );
  }
  return null;
}

export function validateCancelAllowed(
  status: CustomerOrderStatus
): OrderMutationError | null {
  if (status === "delivered") {
    return mutationError(
      "cancel_after_delivered",
      "A delivered order cannot be cancelled. Use a refund instead."
    );
  }
  if (status === "cancelled") {
    return mutationError(
      "terminal_status",
      "This order is already cancelled."
    );
  }
  return null;
}

export function validateShipAllowed(
  status: CustomerOrderStatus
): OrderMutationError | null {
  if (status !== "processing") {
    return mutationError(
      "ship_without_processing",
      "Only orders in Processing can be marked as shipped."
    );
  }
  return null;
}

export function validateCarrier(carrier: string): OrderMutationError | null {
  const trimmed = carrier.trim();
  if (trimmed.length === 0) {
    return mutationError("invalid_carrier", "Enter a carrier name.");
  }
  if (trimmed.length > ORDER_CARRIER_MAX_LENGTH) {
    return mutationError(
      "invalid_carrier",
      "Carrier name is too long."
    );
  }
  return null;
}

export function validateTrackingNumber(
  tracking: string
): OrderMutationError | null {
  const trimmed = tracking.trim();
  if (trimmed.length === 0) {
    return mutationError(
      "invalid_tracking",
      "Enter a tracking number."
    );
  }
  if (trimmed.length > ORDER_TRACKING_NUMBER_MAX_LENGTH) {
    return mutationError(
      "invalid_tracking",
      "Tracking number is too long."
    );
  }
  return null;
}

export function validateCancelNote(
  note: string | undefined
): OrderMutationError | null {
  if (note === undefined) return null;
  if (note.length > ORDER_CANCEL_NOTE_MAX_LENGTH) {
    return mutationError(
      "invalid_reason",
      "Note is too long."
    );
  }
  return null;
}

export function validateOrderNote(body: string): OrderMutationError | null {
  const trimmed = body.trim();
  if (trimmed.length < ORDER_NOTE_MIN_LENGTH) {
    return mutationError("invalid_note", "Note is too short.");
  }
  if (trimmed.length > ORDER_NOTE_MAX_LENGTH) {
    return mutationError("invalid_note", "Note is too long.");
  }
  return null;
}

export function validateRefundAmount(
  amount: number,
  orderTotal: number,
  alreadyRefunded: number
): OrderMutationError | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return mutationError(
      "insufficient_refundable",
      "Enter a refund amount greater than zero."
    );
  }
  const remaining = orderTotal - alreadyRefunded;
  if (remaining <= 0) {
    return mutationError(
      "insufficient_refundable",
      "This order has already been fully refunded."
    );
  }
  if (amount > remaining) {
    return mutationError(
      "refund_exceeds_total",
      "The refund amount exceeds the remaining refundable balance."
    );
  }
  return null;
}