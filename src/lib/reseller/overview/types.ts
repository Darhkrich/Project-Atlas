import type { ResellerOrderRow } from "@/lib/domains/orders/reseller-order-types";
import type { CurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import type { ResellerStorefrontConfig } from "@/types/reseller-storefront";

export interface TodayMetrics {
  ordersToday: number;
  revenueToday: number;
  commissionsThisMonth: number | null;
  walletBalance: number | null;
}

export interface TopService {
  serviceId: string;
  label: string;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export type ActionQueueKind =
  | "verification"
  | "failed_orders"
  | "pending_withdrawals"
  | "unpublished_storefront"
  | "no_services";

export type ActionQueueTone = "info" | "warning" | "danger";

export interface ActionQueueItem {
  id: string;
  kind: ActionQueueKind;
  headline: string;
  body: string;
  href: string;
  tone: ActionQueueTone;
}

export interface StorefrontHealth {
  status: "live" | "draft";
  slug: string;
  serviceCount: number;
  lastOrderAt: string | null;
}

export interface ResellerTierView {
  currentTierName: string;
  currentTierRate: number;
  currentExtraCutPercent: number;
  nextTierName: string | null;
  nextTierRate: number | null;
  nextExtraCutPercent: number | null;
  nextTierPerks: string[];
  metricLabel: string;
  currentValue: number;
  thresholdValue: number;
  progressPercent: number;
}

export interface ResellerOverviewData {
  reseller: CurrentReseller;
  today: TodayMetrics;
  actionQueue: ActionQueueItem[];
  storefrontHealth: StorefrontHealth | null;
  recentOrders: ResellerOrderRow[];
  topServices: TopService[];
  hasOrders: boolean;
}

export interface ProjectActionQueueInput {
  reseller: CurrentReseller;
  orders: ResellerOrderRow[];
  pendingWithdrawalsCount: number;
  resellerConfig: ResellerStorefrontConfig;
  nowMs: number;
}