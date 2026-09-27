"use client";

import { Suspense, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { useRevenueRange } from "@/lib/admin/hooks/use-revenue-range";
import { useRevenue } from "@/lib/admin/hooks/use-revenue";
import {
  overviewToCsv,
  sourcesToCsv,
  healthToCsv,
} from "@/lib/admin/revenue/revenue-csv-export";
import {
  RevenueTabNav,
  RevenueTabPanel,
  type RevenueTabKey,
} from "@/components/admin/revenue/revenue-tab-nav";
import { RevenueNoteStrip } from "@/components/admin/revenue/revenue-note-strip";
import { RevenueFilters } from "@/components/admin/revenue/revenue-filters";
import { RevenueSummaryCards } from "@/components/admin/revenue/revenue-summary-cards";
import { RevenueTrendChart } from "@/components/admin/revenue/revenue-trend-chart";
import {
  RevenueStreamBreakdown,
  TopServicesRevenue,
  PaymentMethodRevenueChart,
  NetworkRevenueChart,
  TopPerformersTable,
  TopCustomersCard,
  WeekdayRevenueCard,
  SourceRevenueCard,
} from "@/components/admin/revenue/revenue-source-cards";
import {
  RefundImpactCard,
  PaymentSuccessRateCard,
  ProfitMarginCard,
  LowMarginAlertsCard,
} from "@/components/admin/revenue/revenue-health-cards";
import {
  MRRARRCard,
  ARPUByStreamCard,
} from "@/components/admin/revenue/revenue-recurring-cards";
import { formatCurrency } from "@/lib/admin/formatters";

export default function RevenuePage() {
  return (
    <Suspense fallback={<RevenueSkeleton />}>
      <RevenuePageInner />
    </Suspense>
  );
}

function RevenueSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

function RevenuePageInner() {
  const admin = useCurrentAdmin();
  const { range, setRange } = useRevenueRange();
  const [tab, setTab] = useState<RevenueTabKey>("overview");
  const { overview, sources, health, loading, error } = useRevenue(range);

  const headerMeta = useMemo(() => {
    if (loading) return <span>Loading…</span>;
    const total = overview.kpis.totalPlatform;
    const topStream = sources.streams.reduce<null | {
      stream: string;
      amount: number;
    }>((acc, row) => {
      if (!acc || row.amount > acc.amount) {
        return { stream: row.stream, amount: row.amount };
      }
      return acc;
    }, null);

    return (
      <>
        <span>{formatCurrency(total)} platform revenue</span>
        {topStream && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              top stream:{" "}
              {topStream.stream === "digital_services"
                ? "Digital services"
                : "Resellers"}
            </span>
          </>
        )}
      </>
    );
  }, [loading, overview.kpis.totalPlatform, sources.streams]);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const stamp = new Date().toISOString().slice(0, 10);
    if (tab === "overview") {
      downloadCsv(
        "atlas-revenue-overview-" + stamp + ".csv",
        overviewToCsv(overview.kpis, overview.trend, overview.recurring)
      );
    } else if (tab === "sources") {
      downloadCsv(
        "atlas-revenue-sources-" + stamp + ".csv",
        sourcesToCsv(
          sources.streams,
          sources.topServices,
          sources.paymentMethods,
          sources.networks,
          sources.topPerformers,
          sources.topCustomers,
          sources.weekday,
          sources.source
        )
      );
    } else {
      downloadCsv(
        "atlas-revenue-health-" + stamp + ".csv",
        healthToCsv(
          health.refundImpact,
          health.paymentSuccess,
          health.profitMargin,
          health.lowMarginAlerts
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform revenue"
        description="Aggregate flows across Atlas direct and reseller streams."
        meta={headerMeta}
        actions={
          <Can permission={PERMISSIONS.REVENUE_EXPORT}>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
          </Can>
        }
      />

      <RevenueNoteStrip />

      <RevenueFilters range={range} onChange={setRange} />

      {error && (
        <p
          role="alert"
          className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
        >
          {error.message}
        </p>
      )}

      <RevenueTabNav active={tab} onChange={setTab} />

      <RevenueTabPanel tabKey="overview" active={tab}>
        <div className="space-y-4">
          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading revenue"
              className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ) : (
            <>
              <RevenueSummaryCards kpis={overview.kpis} />

              <RevenueTrendChart trend={overview.trend} />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <MRRARRCard metrics={overview.recurring} />
                <ARPUByStreamCard metrics={overview.recurring} />
              </div>
            </>
          )}
        </div>
      </RevenueTabPanel>

      <RevenueTabPanel tabKey="sources" active={tab}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RevenueStreamBreakdown rows={sources.streams} />
            <TopServicesRevenue rows={sources.topServices} />
            <PaymentMethodRevenueChart rows={sources.paymentMethods} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <NetworkRevenueChart rows={sources.networks} />
            <TopPerformersTable
              resellers={sources.topPerformers.resellers}
              merchants={sources.topPerformers.merchants}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopCustomersCard rows={sources.topCustomers} />
            <WeekdayRevenueCard rows={sources.weekday} />
          </div>

          <SourceRevenueCard rows={sources.source} />
        </div>
      </RevenueTabPanel>

      <RevenueTabPanel tabKey="health" active={tab}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RefundImpactCard impact={health.refundImpact} />
            <PaymentSuccessRateCard success={health.paymentSuccess} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProfitMarginCard margin={health.profitMargin} />
            <LowMarginAlertsCard alerts={health.lowMarginAlerts} />
          </div>
        </div>
      </RevenueTabPanel>
    </div>
  );
}