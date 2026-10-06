import type { AnalyticsBucket, AnalyticsRange } from "./types";

export const RANGE_OPTIONS: AnalyticsRange[] = [
  "today",
  "7d",
  "30d",
  "90d",
  "all",
];

export const RANGE_BUCKET: Record<AnalyticsRange, AnalyticsBucket> = {
  today: "hour",
  "7d": "day",
  "30d": "day",
  "90d": "week",
  all: "month",
};

export const TOP_PRODUCTS_LIMIT = 5;
export const CHART_HEIGHT_DESKTOP = 240;
export const CHART_HEIGHT_MOBILE = 200;

export const LOW_STOCK_THRESHOLD = 5;

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;