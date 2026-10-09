import type {
  OrderAudience,
  OrderStatus,
} from "@/lib/admin/types/orders";

export type ResellerBadgeVariant =
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

export const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  ResellerBadgeVariant
> = {
  pending: "warning",
  processing: "info",
  retrying: "warning",
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
};

export const ORDER_AUDIENCE_LABELS: Record<OrderAudience, string> = {
  direct: "Atlas direct",
  storefront_user: "Storefront order",
  reseller: "Direct sale",
};

export const ORDER_AUDIENCE_VARIANTS: Record<
  OrderAudience,
  ResellerBadgeVariant
> = {
  direct: "info",
  storefront_user: "brand",
  reseller: "neutral",
};

const ORDER_SERVICE_LABELS: Record<string, string> = {
  "svc-mtn-data": "MTN Data",
  "svc-airtime": "Airtime",
  "svc-ecg": "ECG",
  "svc-dstv": "DSTV",
  "svc-gotv": "GOtv",
  "svc-waec": "WAEC",
};

export function serviceLabel(serviceId: string): string {
  return ORDER_SERVICE_LABELS[serviceId] ?? serviceId;
}