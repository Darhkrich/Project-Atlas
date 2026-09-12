// lib/admin/types/analytics.ts

import type { AtlasSection } from "./settings";

export type DateRangeKey =
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "12m"
  | "custom";

export type AnalyticsSegment =
  | "all"
  | "customers"
  | "resellers"
  | "merchants";

export type Granularity = "day" | "week" | "month";

export interface AnalyticsComparison {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  successRate: number;
  avgOrderValue: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  successRate: number;
  avgOrderValue: number;
  comparison: AnalyticsComparison;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface OrderVolumePoint {
  date: string;
  orders: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface ServiceDistribution {
  service: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface HeatmapData {
  day: string;
  hour: string;
  value: number;
}

export interface CohortData {
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
}

export interface SectionBreakdownRow {
  section: AtlasSection;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  successRate: number;
}

export interface ProviderPerformanceRow {
  providerId: string;
  providerName: string;
  transactions: number;
  successRate: number;
  avgResponseMs: number;
}

export interface PaymentMethodRow {
  method: string;
  volume: number;
  share: number;
}

export interface TopServiceRow {
  serviceId: string;
  service: string;
  section: AtlasSection;
  orders: number;
  revenue: number;
}

export interface TopResellerRow {
  resellerId: string;
  resellerName: string;
  tier: string;
  orders: number;
  commissionPaid: number;
}

export interface TopMerchantRow {
  merchantId: string;
  merchantName: string;
  plan: string;
  orders: number;
  revenue: number;
}

export interface FailureReasonRow {
  reason: string;
  count: number;
  section: AtlasSection;
}