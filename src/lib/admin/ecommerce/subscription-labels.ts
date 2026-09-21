import type {
  InvoiceStatus,
  SubscriptionStatus,
} from "@/lib/admin/types/ecommerce";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const SUBSCRIPTION_STATUS_LABEL: Record<
  SubscriptionStatus,
  string
> = {
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const SUBSCRIPTION_STATUS_VARIANT: Record<
  SubscriptionStatus,
  BadgeVariant
> = {
  active: "success",
  past_due: "warning",
  cancelled: "neutral",
  expired: "danger",
};

export const SUBSCRIPTION_STATUS_COLOR: Record<
  SubscriptionStatus,
  string
> = {
  active: "#166e59",
  past_due: "#f59e0b",
  cancelled: "#94a3b8",
  expired: "#ef4444",
};

export const ALL_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "active",
  "past_due",
  "cancelled",
  "expired",
];

export const BILLING_CYCLE_LABEL: Record<"monthly" | "annual", string> = {
  monthly: "Monthly",
  annual: "Annual",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  void: "Void",
};

export const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  paid: "success",
  unpaid: "warning",
  void: "neutral",
};