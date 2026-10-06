export type OrderMutationErrorCode =
  | "invalid_transition"
  | "terminal_status"
  | "not_found"
  | "payment_status_conflict"
  | "invalid_reason"
  | "invalid_note"
  | "invalid_carrier"
  | "invalid_tracking"
  | "insufficient_refundable"
  | "refund_exceeds_total"
  | "refund_actor_missing"
  | "cancel_after_delivered"
  | "ship_without_processing";

export interface OrderMutationError {
  code: OrderMutationErrorCode;
  message: string;
}

export function mutationError(
  code: OrderMutationErrorCode,
  message: string
): OrderMutationError {
  return { code, message };
}