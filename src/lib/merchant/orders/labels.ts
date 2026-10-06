import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
  OrderCancelReason,
  OrderEventType,
  OrderSortKey,
} from "./types";

export const ORDER_STATUS_LABELS: Record<CustomerOrderStatus, string> = {
  new: "New",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<
  CustomerOrderPaymentStatus,
  string
> = {
  pending: "Payment pending",
  paid: "Paid",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
  failed: "Payment failed",
};

export const PAYMENT_STATUS_SHORT_LABELS: Record<
  CustomerOrderPaymentStatus,
  string
> = {
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
  partially_refunded: "Partial",
  failed: "Failed",
};

export const CANCEL_REASON_LABELS: Record<OrderCancelReason, string> = {
  customer_request: "Customer requested",
  out_of_stock: "Out of stock",
  unable_to_fulfill: "Unable to fulfil",
  other: "Other",
};

export const ORDER_EVENT_LABELS: Record<OrderEventType, string> = {
  placed: "Order placed",
  payment_confirmed: "Payment confirmed",
  payment_failed: "Payment failed",
  status_changed: "Status updated",
  shipped: "Order shipped",
  delivered: "Order delivered",
  cancelled: "Order cancelled",
  refunded: "Refund issued",
  note_added: "Note added",
};

export const ORDER_SORT_LABELS: Record<OrderSortKey, string> = {
  action_first: "Needs action first",
  recent: "Newest first",
  oldest: "Oldest first",
  value_desc: "Highest value",
  value_asc: "Lowest value",
  customer_asc: "Customer (A to Z)",
};

export const ORDER_STATUS_FILTER_ALL = "All";
export const ORDER_PAYMENT_FILTER_ALL = "All";
export const ORDER_DATE_RANGE_ALL = "All";

export const DATE_RANGE_LABELS: Record<
  "All" | "Today" | "Last7" | "Last30",
  string
> = {
  All: "All time",
  Today: "Today",
  Last7: "Last 7 days",
  Last30: "Last 30 days",
};

export const ORDER_EMPTY_NO_ORDERS_TITLE = "No orders yet";
export const ORDER_EMPTY_NO_ORDERS_BODY =
  "When a customer buys from your store, their order will appear here.";
export const ORDER_EMPTY_NO_ORDERS_CTA = "View your storefront";

export const ORDER_EMPTY_NO_MATCHES_TITLE = "No orders match your filters";
export const ORDER_EMPTY_NO_MATCHES_BODY =
  "Try adjusting your search or filter criteria.";
export const ORDER_EMPTY_NO_MATCHES_CTA = "Clear filters";

export const ORDER_NOT_FOUND_TITLE = "Order not found";
export const ORDER_NOT_FOUND_BODY = "This order may have been removed.";
export const ORDER_NOT_FOUND_CTA = "Back to orders";

export const ORDER_SHIPPING_NOT_CAPTURED =
  "Shipping details were not captured on this order.";
export const ORDER_TIMELINE_EMPTY = "No activity recorded yet.";