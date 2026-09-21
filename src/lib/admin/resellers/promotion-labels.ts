import type {
  PromotionScope,
  PromotionServiceCategory,
  PromotionStatus,
} from "@/lib/admin/types/reseller-promotion";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  expired: "Expired",
  ended: "Ended",
};

export const PROMOTION_STATUS_VARIANT: Record<PromotionStatus, BadgeVariant> = {
  scheduled: "info",
  active: "success",
  expired: "neutral",
  ended: "neutral",
};

export const PROMOTION_SCOPE_LABEL: Record<PromotionScope, string> = {
  all: "All resellers",
  tier: "Specific tier",
  resellers: "Specific resellers",
  service: "Specific services",
};

export const SERVICE_CATEGORY_LABEL: Record<
  PromotionServiceCategory,
  string
> = {
  data: "Data",
  airtime: "Airtime",
  bills: "Bills",
  tv: "TV",
  exam_pins: "Exam Pins",
  other: "Other",
};

export const ALL_PROMOTION_SERVICES: PromotionServiceCategory[] = [
  "data",
  "airtime",
  "bills",
  "tv",
  "exam_pins",
  "other",
];

export const ALL_PROMOTION_SCOPES: PromotionScope[] = [
  "all",
  "tier",
  "resellers",
  "service",
];