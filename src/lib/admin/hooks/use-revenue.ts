"use client";

import { useMemo } from "react";
import { useOrders } from "./use-orders";
import { useRefunds } from "./use-refunds";
import { useResellers } from "./use-resellers";
import { useMerchants } from "./use-merchants";
import { useCatalog } from "./use-catalog";
import type {
  RevenueRange,
  TrendGranularity,
} from "@/lib/admin/revenue/revenue-constants";
import {
  rangeToWindow,
  priorWindow,
} from "@/lib/admin/revenue/revenue-helpers";
import {
  projectKpis,
  projectStreamBreakdown,
  projectStreamTrend,
  projectTopServices,
  projectPaymentMethodBreakdown,
  projectNetworkBreakdown,
  projectTopPerformers,
  projectTopCustomers,
  projectWeekdayBreakdown,
  projectSourceBreakdown,
  projectRefundImpact,
  projectPaymentSuccessRate,
  projectProfitMargin,
  projectLowMarginAlerts,
  projectRecurringMetrics,
  type RevenueKpis,
  type StreamRow,
  type TrendPoint,
  type TopServiceRow,
  type MethodRow,
  type NetworkRow,
  type PerformerRow,
  type CustomerRow,
  type WeekdayRow,
  type SourceRow,
  type RefundImpact,
  type PaymentSuccess,
  type ProfitMargin,
  type LowMarginAlert,
  type RecurringMetrics,
} from "@/lib/admin/revenue/revenue-projection";

export interface RevenueOverview {
  kpis: RevenueKpis;
  trend: TrendPoint[];
  recurring: RecurringMetrics;
}

export interface RevenueSources {
  streams: StreamRow[];
  topServices: TopServiceRow[];
  paymentMethods: MethodRow[];
  networks: NetworkRow[];
  topPerformers: { resellers: PerformerRow[]; merchants: PerformerRow[] };
  topCustomers: CustomerRow[];
  weekday: WeekdayRow[];
  source: SourceRow[];
}

export interface RevenueHealth {
  refundImpact: RefundImpact;
  paymentSuccess: PaymentSuccess;
  profitMargin: ProfitMargin;
  lowMarginAlerts: LowMarginAlert[];
}

export interface UseRevenueResult {
  overview: RevenueOverview;
  sources: RevenueSources;
  health: RevenueHealth;
  loading: boolean;
  error: Error | null;
}

const EMPTY_OVERVIEW: RevenueOverview = {
  kpis: {
    totalPlatform: 0,
    todayPlatform: 0,
    monthPlatform: 0,
    yearPlatform: 0,
    avgDailyPlatform: 0,
    deltas: {
      total: null,
      today: null,
      month: null,
      year: null,
      avgDaily: null,
    },
  },
  trend: [],
  recurring: {
    mrr: 0,
    arr: 0,
    arpuByStream: {
      digital_services: 0,
      resellers: 0,
      ecommerce: 0,
    },
  },
};

const EMPTY_SOURCES: RevenueSources = {
  streams: [],
  topServices: [],
  paymentMethods: [],
  networks: [],
  topPerformers: { resellers: [], merchants: [] },
  topCustomers: [],
  weekday: [],
  source: [],
};

const EMPTY_HEALTH: RevenueHealth = {
  refundImpact: {
    totalRefunds: 0,
    netRevenue: 0,
    refundRatePercent: 0,
    priorRatePercent: null,
  },
  paymentSuccess: { rate: 0, priorRate: null, sampleSize: 0 },
  profitMargin: {
    overallPercent: 0,
    byService: [],
    sampleSize: 0,
    hasCostData: false,
  },
  lowMarginAlerts: [],
};

export function useRevenue(
  range: RevenueRange,
  granularity: TrendGranularity = "month"
): UseRevenueResult {
  const { orders, isLoading: ordersLoading } = useOrders();
  const { refunds, isLoading: refundsLoading, nowMs } = useRefunds();
  const { resellers, loading: resellersLoading } = useResellers();
  const { merchants, loading: merchantsLoading } = useMerchants();
  const { categories: catalog, loading: catalogLoading } = useCatalog();

  return useMemo<UseRevenueResult>(() => {
    const loading =
      ordersLoading ||
      refundsLoading ||
      resellersLoading ||
      merchantsLoading ||
      catalogLoading ||
      nowMs === null;

    if (loading || nowMs === null) {
      return {
        overview: EMPTY_OVERVIEW,
        sources: EMPTY_SOURCES,
        health: EMPTY_HEALTH,
        loading: true,
        error: null,
      };
    }

    const current = rangeToWindow(range, nowMs);
    const prior = priorWindow(current);

    try {
      const kpis = projectKpis(orders, current, prior);
      const trend = projectStreamTrend(orders, current, granularity);
      const streams = projectStreamBreakdown(orders, current);
      const topServices = projectTopServices(orders, catalog, current);
      const paymentMethods = projectPaymentMethodBreakdown(orders, current);
      const networks = projectNetworkBreakdown(orders, current);
      const topPerformers = projectTopPerformers(
        orders,
        resellers,
        merchants,
        current,
        prior
      );
      const topCustomers = projectTopCustomers(orders, [], current);
      const weekday = projectWeekdayBreakdown(orders, current);
      const source = projectSourceBreakdown(orders, current);
      const refundImpact = projectRefundImpact(
        orders,
        refunds,
        current,
        prior
      );
      const paymentSuccess = projectPaymentSuccessRate(
        orders,
        current,
        prior
      );
      const profitMargin = projectProfitMargin(orders, catalog, current);
      const lowMarginAlerts = projectLowMarginAlerts(
        orders,
        catalog,
        current
      );
      const recurring = projectRecurringMetrics(
        merchants,
        orders,
        [],
        resellers,
        current
      );

      return {
        overview: { kpis, trend, recurring },
        sources: {
          streams,
          topServices,
          paymentMethods,
          networks,
          topPerformers,
          topCustomers,
          weekday,
          source,
        },
        health: {
          refundImpact,
          paymentSuccess,
          profitMargin,
          lowMarginAlerts,
        },
        loading: false,
        error: null,
      };
    } catch (e) {
      return {
        overview: EMPTY_OVERVIEW,
        sources: EMPTY_SOURCES,
        health: EMPTY_HEALTH,
        loading: false,
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  }, [
    orders,
    refunds,
    resellers,
    merchants,
    catalog,
    ordersLoading,
    refundsLoading,
    resellersLoading,
    merchantsLoading,
    catalogLoading,
    nowMs,
    range,
    granularity,
  ]);
}