// lib/admin/analytics/constants.ts

import type {
  AnalyticsSegment,
  DateRangeKey,
  Granularity,
} from "@/lib/admin/types/analytics";
import type { AtlasSection } from "@/lib/admin/types/settings";

export const DATE_RANGE_LABEL: Record<DateRangeKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  custom: "Custom range",
};

export const COMPARISON_LABEL: Record<DateRangeKey, string> = {
  today: "vs yesterday",
  "7d": "vs prior 7 days",
  "30d": "vs prior 30 days",
  "90d": "vs prior 90 days",
  "12m": "vs prior 12 months",
  custom: "vs prior period",
};

export const SEGMENT_LABEL: Record<AnalyticsSegment, string> = {
  all: "All users",
  customers: "Customers",
  resellers: "Resellers",
  merchants: "Merchants",
};

export const GRANULARITY_LABEL: Record<Granularity, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

export const SECTION_FILTER_LABEL: Record<AtlasSection | "all", string> = {
  all: "All sections",
  digital_services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
  admin: "Admin",
};

export const ANALYTICS_SECTIONS: (AtlasSection | "all")[] = [
  "all",
  "digital_services",
  "resellers",
  "ecommerce",
];

export const ALL_SEGMENTS: AnalyticsSegment[] = [
  "all",
  "customers",
  "resellers",
  "merchants",
];

export const ALL_DATE_RANGES: DateRangeKey[] = [
  "today",
  "7d",
  "30d",
  "90d",
  "12m",
];

export const ALL_GRANULARITIES: Granularity[] = ["day", "week", "month"];

export const SEGMENT_SCALE: Record<AnalyticsSegment, number> = {
  all: 1,
  customers: 0.74,
  resellers: 0.12,
  merchants: 0.14,
};

export const SECTION_SCALE: Record<AtlasSection | "all", number> = {
  all: 1,
  digital_services: 0.78,
  resellers: 0.03,
  ecommerce: 0.19,
  admin: 0,
};

export function defaultGranularity(range: DateRangeKey): Granularity {
  if (range === "today") return "day";
  if (range === "7d" || range === "30d") return "day";
  if (range === "90d") return "week";
  return "month";
}