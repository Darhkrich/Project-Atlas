import type {
  OrderAudience,
  OrderFailureClass,
  OrderFailureReason,
  OrderStatus,
  OrderTimelineEventStatus,
  OrderTimelineEventType,
} from "@/lib/admin/types/orders";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  retrying: "Retrying",
  successful: "Successful",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  processing: "info",
  retrying: "warning",
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
};

export const ORDER_AUDIENCE_LABELS: Record<OrderAudience, string> = {
  direct: "Atlas direct",
  storefront_user: "Reseller customer",
  reseller: "Reseller",
};

export const ORDER_AUDIENCE_VARIANTS: Record<OrderAudience, BadgeVariant> = {
  direct: "info",
  storefront_user: "brand",
  reseller: "neutral",
};

export const ORDER_FAILURE_CLASS_LABELS: Record<OrderFailureClass, string> = {
  system: "System",
  customer: "Customer",
};

export const ORDER_FAILURE_CLASS_VARIANTS: Record<
  OrderFailureClass,
  BadgeVariant
> = {
  system: "danger",
  customer: "neutral",
};

export const ORDER_FAILURE_REASON_LABELS: Record<OrderFailureReason, string> = {
  provider_timeout: "Provider timeout",
  provider_error: "Provider error",
  provider_unavailable: "Provider unavailable",
  atlas_internal_error: "Atlas internal error",
  insufficient_balance: "Insufficient balance",
  invalid_recipient: "Invalid recipient",
  cancelled_by_customer: "Cancelled by customer",
  cancelled_by_admin: "Cancelled by admin",
  duplicate_detected: "Duplicate detected",
  limit_exceeded: "Limit exceeded",
};

export const ORDER_TIMELINE_STATUS_VARIANTS: Record<
  OrderTimelineEventStatus,
  BadgeVariant
> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

export const ORDER_TIMELINE_TYPE_LABELS: Record<OrderTimelineEventType, string> = {
  order_created: "Order created",
  payment_held: "Payment held",
  dispatch_attempt: "Dispatch attempt",
  provider_response: "Provider response",
  retry_scheduled: "Retry scheduled",
  delivered: "Delivered",
  settled: "Settled",
  released: "Hold released",
  cancelled: "Cancelled",
};

export const ORDER_SERVICE_LABELS: Record<string, string> = {
  "svc-mtn-data": "MTN Data",
  "svc-airtime": "Airtime",
  "svc-ecg": "ECG",
  "svc-dstv": "DSTV",
  "svc-gotv": "GOtv",
  "svc-waec": "WAEC",
};

export const ORDER_NETWORK_LABELS: Record<string, string> = {
  "net-mtn": "MTN",
  "net-telecel": "Telecel",
  "net-airteltigo": "AirtelTigo",
};

export const ORDER_PROVIDER_LABELS: Record<string, string> = {
  "prov-mtn-gh": "MTN Ghana",
  "prov-telecel-gh": "Telecel Ghana",
  "prov-airteltigo-gh": "AirtelTigo",
  "prov-ecg-gh": "ECG Ghana",
  "prov-multichoice": "MultiChoice",
  "prov-waec": "WAEC",
};

export function serviceLabel(serviceId: string): string {
  return ORDER_SERVICE_LABELS[serviceId] ?? serviceId;
}

export function networkLabel(networkId: string | undefined): string {
  if (!networkId) return "—";
  return ORDER_NETWORK_LABELS[networkId] ?? networkId;
}

export function providerLabel(providerId: string | undefined): string {
  if (!providerId) return "—";
  return ORDER_PROVIDER_LABELS[providerId] ?? providerId;
}