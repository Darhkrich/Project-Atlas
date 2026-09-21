"use client";

import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnalyticsSummaryCards } from "@/components/admin/resellers/analytics-summary-cards";
import { AnalyticsCharts } from "@/components/admin/resellers/analytics-charts";
import { AnalyticsTopResellersTable } from "@/components/admin/resellers/analytics-top-resellers-table";
import { useResellerAnalytics } from "@/lib/admin/hooks/use-reseller-analytics";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface AnalyticsFilters {
  top: string;
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  top: "10",
};

const TOP_OPTIONS = [5, 10, 20] as const;

export default function ResellerAnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <ResellerAnalyticsPageInner />
    </Suspense>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function ResellerAnalyticsPageInner() {
  const { filters, setFilters } = useUrlFilters<AnalyticsFilters>(
    DEFAULT_FILTERS
  );

  const parsedTop = Number(filters.top);
  const topN = (TOP_OPTIONS as readonly number[]).includes(parsedTop)
    ? parsedTop
    : 10;

  const { summary, revenueByReseller, revenueByTier, byVerification, loading } =
    useResellerAnalytics(topN);

  const meta = (
    <>
      <span>{summary.totalCount} resellers</span>
      <span aria-hidden="true">·</span>
      <span>{formatCurrency(summary.totalRevenue)} revenue</span>
      <span aria-hidden="true">·</span>
      <span>{summary.effectiveRatePercent.toFixed(1)}% effective rate</span>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller analytics"
        description="Revenue, tier, and verification performance across the reseller channel."
        meta={meta}
        actions={
          <div
            role="group"
            aria-label="Number of resellers to show"
            className="flex gap-1"
          >
            {TOP_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={topN === n}
                onClick={() => setFilters({ top: String(n) })}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  topN === n
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                )}
              >
                Top {n}
              </button>
            ))}
          </div>
        }
      />

      <AnalyticsSummaryCards summary={summary} loading={loading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4 lg:col-span-2">
          <AnalyticsCharts
            revenueByReseller={revenueByReseller}
            revenueByTier={revenueByTier}
            byVerification={byVerification}
            topN={topN}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-2">
          <AnalyticsTopResellersTable
            rows={revenueByReseller}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}