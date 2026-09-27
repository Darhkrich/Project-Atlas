import { CHART_PALETTE } from "@/lib/admin/charts/theme";

export type RevenueRange = "today" | "7d" | "30d" | "90d" | "12m";

export const REVENUE_RANGES: { key: RevenueRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
];

export const DEFAULT_REVENUE_RANGE: RevenueRange = "30d";

export const REVENUE_MONTH_BUCKETS_12M = 12;

export const TREND_GRANULARITIES = [
  { key: "month", label: "Monthly" },
  { key: "week", label: "Weekly" },
] as const;

export type TrendGranularity = (typeof TREND_GRANULARITIES)[number]["key"];

export const LOW_MARGIN_THRESHOLD_PERCENT = 10;

export const PAYMENT_SUCCESS_HEALTHY = 97;
export const PAYMENT_SUCCESS_WARNING = 93;

export const REVENUE_TREND_COLORS = {
  digital_services: CHART_PALETTE.info,
  resellers: CHART_PALETTE.success,
  ecommerce: CHART_PALETTE.warning,
  total: CHART_PALETTE.brand,
};