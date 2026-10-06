export const ORDERS_PAGE_SIZE = 50;
export const ORDERS_MAX_RENDERED = 500;
export const ORDERS_TIMELINE_PREVIEW_LIMIT = 8;
export const ORDERS_RECENT_ACTIVITY_DAYS = 7;
export const ORDERS_SEARCH_MIN_LENGTH = 1;
export const ORDER_NOTE_MIN_LENGTH = 2;
export const ORDER_NOTE_MAX_LENGTH = 500;
export const ORDER_CANCEL_NOTE_MAX_LENGTH = 200;
export const ORDER_TRACKING_NUMBER_MAX_LENGTH = 64;
export const ORDER_CARRIER_MAX_LENGTH = 40;
export const ORDER_REFUND_NOTE_MAX_LENGTH = 200;
export const REFUND_AUTO_APPROVE_THRESHOLD_DEFAULT = 5000;
export const ORDER_STATUS_VARIANT_MAP: Record<
  "new" | "processing" | "shipped" | "delivered" | "cancelled",
  "warning" | "info" | "brand" | "success" | "neutral"
> = {
  new: "warning",
  processing: "info",
  shipped: "brand",
  delivered: "success",
  cancelled: "neutral",
};