import type { ServiceCategory } from "@/lib/admin/types/commission";

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  data: "Data",
  airtime: "Airtime",
  bills: "Bills",
  tv: "TV",
  exam_pins: "Exam Pins",
  other: "Other",
};

export const RATE_UNITS = {
  dataGHS: "GHS per order",
  percent: "% of order value",
} as const;

export const TIER_NAME_MAX = 40;
export const PERK_MAX_LENGTH = 60;
export const MAX_PERKS = 10;