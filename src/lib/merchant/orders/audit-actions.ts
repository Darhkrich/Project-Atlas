export const ORDER_AUDIT_ACTIONS = {
  statusChange: "order.merchant.status_change",
  ship: "order.merchant.ship",
  cancel: "order.merchant.cancel",
  noteAdd: "order.merchant.note_add",
  paymentConfirm: "order.merchant.payment_confirm",
  paymentFail: "order.merchant.payment_fail",
  refundCreate: "order.merchant.refund_create",
} as const;

export type OrderAuditAction =
  (typeof ORDER_AUDIT_ACTIONS)[keyof typeof ORDER_AUDIT_ACTIONS];