import type {
  OrderAudience,
} from "@/lib/admin/types/orders";
import type { RevenueRange, TrendGranularity } from "./revenue-constants";

export type RevenueStreamId = "digital_services" | "resellers" | "ecommerce";

export const STREAM_LABEL: Record<RevenueStreamId, string> = {
  digital_services: "Digital services",
  resellers: "Resellers",
  ecommerce: "Ecommerce",
};

export const AUDIENCE_TO_STREAM: Record<OrderAudience, RevenueStreamId> = {
  direct: "digital_services",
  storefront_user: "resellers",
  reseller: "resellers",
};

export const RANGE_LABEL: Record<RevenueRange, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

export const GRANULARITY_LABEL: Record<TrendGranularity, string> = {
  month: "Monthly",
  week: "Weekly",
};

export const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const WEEKDAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function streamLabel(id: string): string {
  return STREAM_LABEL[id as RevenueStreamId] ?? id;
}