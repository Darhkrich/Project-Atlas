import type { PaymentMethodId } from "@/lib/admin/types/payment";

// direct: an Atlas D2C customer buys from Atlas.
// storefront_user: a reseller's customer buys from that reseller's storefront.
// reseller: the reseller buys through their dashboard services page, for
// themselves or on behalf of a third party. The reseller's own payment
// methods fund the order and the reseller earns the commission.
export type OrderAudience = "direct" | "storefront_user" | "reseller";

export type OrderStatus =
  | "pending"
  | "processing"
  | "retrying"
  | "successful"
  | "failed"
  | "cancelled";

export type OrderFailureClass = "system" | "customer";

export type OrderFailureReason =
  | "provider_timeout"
  | "provider_error"
  | "provider_unavailable"
  | "atlas_internal_error"
  | "insufficient_balance"
  | "invalid_recipient"
  | "cancelled_by_customer"
  | "cancelled_by_admin"
  | "duplicate_detected"
  | "limit_exceeded";

export type OrderWalletOwner = "customer" | "reseller" | "storefront_user";

export type OrderWalletDebitStatus = "held" | "captured" | "released";

export interface OrderWalletDebit {
  walletId: string;
  walletOwner: OrderWalletOwner;
  amount: number;
  status: OrderWalletDebitStatus;
  heldAt: string;
  capturedAt?: string;
  releasedAt?: string;
  releaseReason?: OrderFailureReason;
}

export interface OrderFailure {
  class: OrderFailureClass;
  reason: OrderFailureReason;
  occurredAt: string;
  providerMessage?: string;
}

export type OrderTimelineEventType =
  | "order_created"
  | "payment_held"
  | "dispatch_attempt"
  | "provider_response"
  | "retry_scheduled"
  | "delivered"
  | "settled"
  | "released"
  | "cancelled";

export type OrderTimelineEventStatus = "success" | "warning" | "danger" | "info";

export interface OrderTimelineEvent {
  type: OrderTimelineEventType;
  status: OrderTimelineEventStatus;
  timestamp: string;
  attempt?: number;
  label: string;
  description?: string;
}

// Display cache. Live values resolve from stores when the join succeeds.
export interface OrderCustomerSnapshot {
  name: string;
  phone: string;
}

export interface OrderResellerSnapshot {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  audience: OrderAudience;
  status: OrderStatus;

  customer: OrderCustomerSnapshot;
  reseller: OrderResellerSnapshot | null;

  customerId?: string;
  storefrontUserId?: string;
  storefrontId?: string;
  resellerId?: string;

  serviceId: string;
  providerId: string;
  networkId?: string;
  paymentMethodId: PaymentMethodId;
  paymentId?: string;

  amount: number;
  commission: number;

  // Provider cost from the catalog for this order's plan. Drives the
  // treasury accrual into provider_settlement_pending on success. Null
  // or undefined skips the accrual. Populated at placement from the
  // catalog; never fabricated.
  providerCost?: number;

  failure?: OrderFailure;

  retryAttempts: number;
  maxRetryAttempts: number;
  nextRetryAt?: string;
  lastRetriedAt?: string;
  idempotencyKey: string;

  // Present only when paymentMethodId === "wallet". Absent for card,
  // mobile_money, bank_transfer, atlas_points.
  walletDebit?: OrderWalletDebit;

  createdAt: string;
  timeline: OrderTimelineEvent[];
}