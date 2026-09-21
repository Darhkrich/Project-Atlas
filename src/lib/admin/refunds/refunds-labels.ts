import type {
  RefundAudience,
  RefundReasonCustomer,
  RefundReasonSystem,
  RefundStatus,
  RefundTimelineEventStatus,
  RefundTimelineEventType,
  RefundType,
  RiskBand,
} from "@/lib/admin/types/refund";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const REFUND_TYPE_LABELS: Record<RefundType, string> = {
  automatic: "Automatic",
  requested: "Requested",
};

export const REFUND_TYPE_VARIANTS: Record<RefundType, BadgeVariant> = {
  automatic: "info",
  requested: "warning",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending_admin: "Awaiting approval",
  approved: "Approved",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

export const REFUND_STATUS_VARIANTS: Record<RefundStatus, BadgeVariant> = {
  pending_admin: "warning",
  approved: "info",
  processing: "info",
  completed: "success",
  failed: "danger",
  rejected: "neutral",
};

export const REFUND_AUDIENCE_LABELS: Record<RefundAudience, string> = {
  direct: "Atlas direct",
  storefront_user: "Reseller customer",
  reseller: "Reseller",
};

export const REFUND_AUDIENCE_VARIANTS: Record<RefundAudience, BadgeVariant> = {
  direct: "info",
  storefront_user: "brand",
  reseller: "neutral",
};

export const REFUND_REASON_SYSTEM_LABELS: Record<RefundReasonSystem, string> = {
  provider_failure: "Provider failure",
  service_not_delivered: "Service not delivered",
  atlas_internal_error: "Atlas internal error",
};

export const REFUND_REASON_CUSTOMER_LABELS: Record<
  RefundReasonCustomer,
  string
> = {
  customer_request: "Customer request",
  duplicate_charge: "Duplicate charge",
  fraud_suspected: "Fraud suspected",
  other: "Other",
};

export const REFUND_REASON_LABELS: Record<
  RefundReasonSystem | RefundReasonCustomer,
  string
> = {
  ...REFUND_REASON_SYSTEM_LABELS,
  ...REFUND_REASON_CUSTOMER_LABELS,
};

export const REFUND_TIMELINE_STATUS_VARIANTS: Record<
  RefundTimelineEventStatus,
  BadgeVariant
> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};

export const REFUND_TIMELINE_TYPE_LABELS: Record<
  RefundTimelineEventType,
  string
> = {
  requested: "Refund requested",
  created: "Refund created",
  approved: "Approved",
  rejected: "Rejected",
  processing: "Processing",
  settled: "Settled",
  failed: "Failed",
  recovered: "Recovered from commission",
  automatic: "Automatic refund issued",
};

export const RISK_BAND_LABELS: Record<RiskBand, string> = {
  clean: "Clean",
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export const RISK_BAND_VARIANTS: Record<RiskBand, BadgeVariant> = {
  clean: "success",
  low: "success",
  medium: "warning",
  high: "danger",
};

export function reasonLabel(reason: string): string {
  return (
    (REFUND_REASON_LABELS as Record<string, string>)[reason] ?? reason
  );
}

export function statusLabel(status: RefundStatus): string {
  return REFUND_STATUS_LABELS[status];
}

export function audienceLabel(audience: RefundAudience): string {
  return REFUND_AUDIENCE_LABELS[audience];
}