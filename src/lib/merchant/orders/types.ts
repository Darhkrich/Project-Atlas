export type CustomerOrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CustomerOrderPaymentStatus =
  | "pending"
  | "paid"
  | "refunded"
  | "partially_refunded"
  | "failed";

export type OrderEventType =
  | "placed"
  | "payment_confirmed"
  | "payment_failed"
  | "status_changed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "note_added";

export interface OrderEventActor {
  id: string;
  name: string;
  email: string;
}

export interface OrderEvent {
  id: string;
  type: OrderEventType;
  description: string;
  actor: OrderEventActor;
  createdAt: number;
  fromStatus?: CustomerOrderStatus;
  toStatus?: CustomerOrderStatus;
  metadata?: Record<string, string>;
}

export interface OrderShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  landmark?: string;
  instructions?: string;
}

export type OrderCancelReason =
  | "customer_request"
  | "out_of_stock"
  | "unable_to_fulfill"
  | "other";

export interface OrderCancelRecord {
  reason: OrderCancelReason;
  note?: string;
  restock: boolean;
  cancelledBy: OrderEventActor;
  cancelledAt: number;
}

export interface OrderNote {
  id: string;
  body: string;
  author: OrderEventActor;
  createdAt: number;
}

export interface OrderShippingSnapshot {
  method: string;
  cost: number;
  carrier: string | null;
  trackingNumber: string | null;
}

export type OrderSortKey =
  | "action_first"
  | "recent"
  | "oldest"
  | "value_desc"
  | "value_asc"
  | "customer_asc";

export interface OrderFilterState {
  search: string;
  status: CustomerOrderStatus | "All";
  paymentStatus: CustomerOrderPaymentStatus | "All";
  dateRange: "All" | "Today" | "Last7" | "Last30";
  sort: OrderSortKey;
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  createdAt: number;
  updatedAt: number;
  primaryItemName: string;
}

export interface OrderSummarySnapshot {
  totalOrders: number;
  newCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  awaitingShipmentCount: number;
  pendingPaymentCount: number;
  revenueTotal: number;
  revenueToday: number;
}

export interface OrderTimelineItem {
  id: string;
  type: OrderEventType;
  description: string;
  actorName: string;
  createdAt: number;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
}

export const ORDER_STATUS_TRANSITIONS: Record<
  CustomerOrderStatus,
  CustomerOrderStatus[]
> = {
  new: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrderStatus(
  from: CustomerOrderStatus,
  to: CustomerOrderStatus
): boolean {
  if (from === to) return false;
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalOrderStatus(status: CustomerOrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[status].length === 0;
}