import type {
  RefundAudience,
  RefundReasonCustomer,
  RefundReasonSystem,
  RefundStatus,
  RefundType,
} from "@/lib/admin/types/refund";

export const REFUNDS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_REFUNDS_PAGE_SIZE = 20;

export const REFUNDS_DEFAULT_RANGE_DAYS = 30;

export const REFUND_STATUS_ORDER: RefundStatus[] = [
  "pending_admin",
  "approved",
  "processing",
  "completed",
  "rejected",
];

export const REFUND_TYPES: RefundType[] = ["automatic", "requested"];

export const REFUND_AUDIENCES: RefundAudience[] = [
  "direct",
  "storefront_user",
  "reseller",
];

export const SYSTEM_REASONS: RefundReasonSystem[] = [
  "provider_failure",
  "service_not_delivered",
  "atlas_internal_error",
];

export const CUSTOMER_REASONS: RefundReasonCustomer[] = [
  "customer_request",
  "duplicate_charge",
  "fraud_suspected",
  "other",
];

// Coverage split by audience. Atlas pays the refund in full up front.
// The reseller share is the portion Atlas recovers from future commissions.
export const COVERAGE_SPLIT: Record<
  RefundAudience,
  { atlas: number; reseller: number }
> = {
  direct: { atlas: 1, reseller: 0 },
  storefront_user: { atlas: 0.5, reseller: 0.5 },
  reseller: { atlas: 0, reseller: 1 },
};

export const RISK_THRESHOLDS = {
  lowMaxRefunds: 2,
  mediumMinRefunds: 3,
  mediumMinRejections: 1,
  highMinRefunds: 3,
  highMinRejections: 2,
};

export const REFUNDS_OVERDUE_HOURS = 24;