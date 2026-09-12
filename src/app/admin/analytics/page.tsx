/* eslint-disable react-hooks/purity */
// app/(admin)/analytics/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import {
  AnalyticsToolbar,
  type AnalyticsFilterValues,
} from "@/components/admin/analytics/analytics-toolbar";
import { AnalyticsSummaryCards } from "@/components/admin/analytics/analytics-summary-cards";
import { AnalyticsCharts } from "@/components/admin/analytics/analytics-charts";
import { SectionBreakdown } from "@/components/admin/analytics/section-breakdown";
import { ProviderPerformance } from "@/components/admin/analytics/provider-performance";
import { FailureAnalysis } from "@/components/admin/analytics/failure-analysis";
import { CohortGrid } from "@/components/admin/analytics/cohort-grid";
import { TopPerformersTable } from "@/components/admin/analytics/top-performers-table";
import {
  mockAnalyticsSummary,
  mockCohortData,
  mockFailureReasons,
  mockFunnelData,
  mockHeatmapData,
  mockOrderSeries,
  mockPaymentMethodSplit,
  mockProviderPerformance,
  mockRevenueSeries,
  mockSectionBreakdown,
  mockServiceDistribution,
  mockTopMerchants,
  mockTopResellers,
  mockTopServices,
  mockUserGrowth,
} from "@/lib/admin/mock/analytics";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  aggregateSeries,
  computeTrend,
  filterPointsByRange,
  filterPointsForPreviousRange,
} from "@/lib/admin/analytics/data-range";
import {
  defaultGranularity,
  SEGMENT_SCALE,
  SECTION_SCALE,
} from "@/lib/admin/analytics/contants";
import {
  sectionBreakdownToCsv,
  summaryToCsv,
} from "@/lib/admin/analytics/csv-export";
import type {
  AnalyticsSegment,
  DateRangeKey,
  Granularity,
} from "@/lib/admin/types/analytics";
import type { AtlasSection } from "@/lib/admin/types/settings";

const DEFAULT_FILTERS: AnalyticsFilterValues = {
  range: "30d",
  segment: "all",
  section: "all",
  granularity: "day",
  compare: "false",
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsPageInner />
    </Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function AnalyticsPageInner() {
  const { filters, setFilters } = useUrlFilters<AnalyticsFilterValues>(
    DEFAULT_FILTERS
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    () => new Date().toISOString()
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date().toISOString());
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const range = filters.range as DateRangeKey;
    if (filters.granularity === "day" && defaultGranularity(range) !== "day") {
      setFilters({ granularity: defaultGranularity(range) });
    }
  }, [filters.range, filters.granularity, loading, setFilters]);

  const range = filters.range as DateRangeKey;
  const segment = filters.segment as AnalyticsSegment;
  const sectionFilter = filters.section as AtlasSection | "all";
  const granularity = filters.granularity as Granularity;

  const nowMs = useMemo(() => Date.now(), []);

  const scale =
    SEGMENT_SCALE[segment] *
    SECTION_SCALE[sectionFilter as AtlasSection | "all"];

  const revenueSeries = useMemo(() => {
    const filtered = filterPointsByRange(mockRevenueSeries, range, nowMs);
    const scaled = filtered.map((p) => ({
      ...p,
      revenue: Math.round(p.revenue * scale),
    }));
    return aggregateSeries(scaled, granularity, "revenue");
  }, [range, granularity, nowMs, scale]);

  const orderSeries = useMemo(() => {
    const filtered = filterPointsByRange(mockOrderSeries, range, nowMs);
    const scaled = filtered.map((p) => ({
      ...p,
      orders: Math.round(p.orders * scale),
    }));
    return aggregateSeries(scaled, granularity, "orders");
  }, [range, granularity, nowMs, scale]);

  const summary = useMemo(() => {
    const currentRevenue = revenueSeries.reduce((s, p) => s + p.revenue, 0);
    const currentOrders = orderSeries.reduce((s, p) => s + p.orders, 0);

    const priorRevenuePoints = filterPointsForPreviousRange(
      mockRevenueSeries,
      range,
      nowMs
    ).map((p) => ({ ...p, revenue: Math.round(p.revenue * scale) }));
    const priorOrderPoints = filterPointsForPreviousRange(
      mockOrderSeries,
      range,
      nowMs
    ).map((p) => ({ ...p, orders: Math.round(p.orders * scale) }));

    const priorRevenue = priorRevenuePoints.reduce((s, p) => s + p.revenue, 0);
    const priorOrders = priorOrderPoints.reduce((s, p) => s + p.orders, 0);

    const revTrend = computeTrend(currentRevenue, priorRevenue);
    const ordTrend = computeTrend(currentOrders, priorOrders);
    const aov = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const priorAov = priorOrders > 0 ? priorRevenue / priorOrders : 0;
    const aovTrend = computeTrend(aov, priorAov);

    return {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders,
      activeUsers: Math.round(mockAnalyticsSummary.activeUsers * scale),
      successRate: mockAnalyticsSummary.successRate,
      avgOrderValue: Math.round(aov * 100) / 100,
      comparison: {
        totalRevenue: revTrend.percentageChange,
        totalOrders: ordTrend.percentageChange,
        activeUsers: mockAnalyticsSummary.comparison.activeUsers,
        successRate: mockAnalyticsSummary.comparison.successRate,
        avgOrderValue: aovTrend.percentageChange,
      },
    };
  }, [revenueSeries, orderSeries, range, nowMs, scale]);

  const filteredSectionBreakdown = useMemo(() => {
    if (sectionFilter === "all") return mockSectionBreakdown;
    return mockSectionBreakdown.filter((r) => r.section === sectionFilter);
  }, [sectionFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date().toISOString());
    }, 500);
  };

  const handleScrollTo = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `atlas-analytics-${stamp}.csv`,
      `${summaryToCsv(summary)}\r\n\r\n${sectionBreakdownToCsv(
        filteredSectionBreakdown
      )}`
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Cross-platform performance metrics and insights."
        meta={
          <>
            <span>{formatCurrency(summary.totalRevenue)} revenue</span>
            <span aria-hidden="true">·</span>
            <span>{formatNumber(summary.totalOrders)} orders</span>
            <span aria-hidden="true">·</span>
            <span>{summary.successRate}% success</span>
          </>
        }
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <AnalyticsToolbar
        values={filters}
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onChange={(patch) => setFilters(patch)}
        onRefresh={handleRefresh}
      />

      <p aria-live="polite" className="sr-only">
        Showing analytics for the selected range and segment.
      </p>

      <AnalyticsSummaryCards
        data={summary}
        range={range}
        onSelect={handleScrollTo}
      />

      <AnalyticsCharts
        loading={loading}
        revenue={revenueSeries}
        orders={orderSeries}
        users={mockUserGrowth}
        services={mockServiceDistribution}
        funnel={mockFunnelData}
        heatmap={mockHeatmapData}
        onExportSection={() => undefined}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionBreakdown rows={filteredSectionBreakdown} />
        <div id="provider-performance">
          <ProviderPerformance rows={mockProviderPerformance} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FailureAnalysis rows={mockFailureReasons} />
        <CohortGrid rows={mockCohortData} />
      </div>

      <div className="space-y-4">
        <TopPerformersTable
          title="Top services"
          subtitle="Highest revenue services in the current range."
          rows={mockTopServices}
          getId={(r) => r.serviceId}
          getPrimary={(r) => r.service}
          columns={[
            {
              key: "orders",
              label: "Orders",
              align: "right",
              format: (r) => formatNumber(r.orders),
            },
            {
              key: "revenue",
              label: "Revenue",
              align: "right",
              format: (r) => formatCurrency(r.revenue),
            },
          ]}
        />

        <TopPerformersTable
          title="Top resellers"
          subtitle="Ranked by order volume. Commission shown is GHS paid."
          rows={mockTopResellers}
          getId={(r) => r.resellerId}
          getPrimary={(r) => r.resellerName}
          columns={[
            { key: "tier", label: "Tier" },
            {
              key: "orders",
              label: "Orders",
              align: "right",
              format: (r) => formatNumber(r.orders),
            },
            {
              key: "commissionPaid",
              label: "Commission",
              align: "right",
              format: (r) => formatCurrency(r.commissionPaid),
            },
          ]}
        />

        <TopPerformersTable
          title="Top merchants"
          subtitle="Storefront sales for the current range."
          rows={mockTopMerchants}
          getId={(r) => r.merchantId}
          getPrimary={(r) => r.merchantName}
          columns={[
            { key: "plan", label: "Plan" },
            {
              key: "orders",
              label: "Orders",
              align: "right",
              format: (r) => formatNumber(r.orders),
            },
            {
              key: "revenue",
              label: "Revenue",
              align: "right",
              format: (r) => formatCurrency(r.revenue),
            },
          ]}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Payment method split
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Revenue contribution by payment rail.
        </p>
        <ul className="mt-3 space-y-2">
          {mockPaymentMethodSplit.map((row) => (
            <li
              key={row.method}
              className="flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <span className="text-neutral-800 dark:text-neutral-200">
                {row.method}
              </span>
              <span className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                <span>{formatCurrency(row.volume)}</span>
                <span className="w-10 text-right font-medium text-neutral-900 dark:text-neutral-100">
                  {row.share}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}