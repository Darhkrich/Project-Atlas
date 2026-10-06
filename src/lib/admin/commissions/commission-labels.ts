import type {
  CommissionStatus,
  PayoutRunStatus,
  ServiceCategory,
} from "../types/commission";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type StatusVariant = Exclude<Variant, "brand">;

export const COMMISSION_STATUS_LABEL: Record<CommissionStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  reversed: "Reversed",
};

export const COMMISSION_STATUS_VARIANT: Record<
  CommissionStatus,
  StatusVariant
> = {
  pending: "warning",
  paid: "success",
  cancelled: "neutral",
  reversed: "danger",
};

export const PAYOUT_RUN_STATUS_LABEL: Record<PayoutRunStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
};

export const PAYOUT_RUN_STATUS_VARIANT: Record<PayoutRunStatus, Variant> = {
  pending: "warning",
  completed: "success",
  failed: "danger",
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  data: "Data",
  airtime: "Airtime",
  bills: "Bills",
  tv: "TV",
  exam_pins: "Exam pins",
  other: "Other",
};

export const SERVICE_CATEGORY_VARIANT: Record<ServiceCategory, Variant> = {
  data: "brand",
  airtime: "info",
  bills: "neutral",
  tv: "neutral",
  exam_pins: "neutral",
  other: "neutral",
};

export function serviceCategoryLabel(
  category: ServiceCategory
): string {
  return SERVICE_CATEGORY_LABEL[category];
}

export function commissionStatusLabel(status: CommissionStatus): string {
  return COMMISSION_STATUS_LABEL[status];
}