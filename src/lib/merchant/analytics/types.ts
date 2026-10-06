import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
} from "@/lib/merchant/orders/types";

export type AnalyticsRange = "today" | "7d" | "30d" | "90d" | "all";

export type AnalyticsBucket = "hour" | "day" | "week" | "month";

export type KpiDirection = "up" | "down" | "flat";

export interface KpiDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: KpiDirection;
  label: string;
}

export interface AnalyticsKpis {
  revenue: KpiDelta;
  orders: KpiDelta;
  averageOrderValue: KpiDelta;
  customers: KpiDelta;
}

export interface SeriesPoint {
  bucketStart: number;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  unitsSold: number;
  revenue: number;
  shareOfTop: number;
}

export interface StatusBreakdownRow {
  status: CustomerOrderStatus;
  count: number;
  shareOfMax: number;
  href: string;
}

export interface ActionQueueItem {
  kind: "unfulfilled_orders" | "failed_payments" | "low_stock" | "active_reports";
  count: number;
  title: string;
  description: string;
  href: string;
}

export interface AnalyticsSnapshot {
  range: AnalyticsRange;
  bucket: AnalyticsBucket;
  kpis: AnalyticsKpis;
  series: SeriesPoint[];
  topProducts: TopProduct[];
  statusBreakdown: StatusBreakdownRow[];
  actionQueue: ActionQueueItem[];
  hasOrdersInRange: boolean;
  hasOrdersAtAll: boolean;
  rangeStartMs: number | null;
  rangeEndMs: number;
}

export interface PaymentStatusCount {
  status: CustomerOrderPaymentStatus;
  count: number;
}