"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useEcommerceAnalytics } from "@/lib/admin/hooks/use-ecommerce-analytics";
import { EcommerceAnalyticsSummaryCards } from "@/components/admin/ecommerce/ecommerce-analytics-summary-cards";
import { EcommerceAnalyticsCharts } from "@/components/admin/ecommerce/ecommerce-analytics-charts";
import {
  VerificationPanel,
  VelocityPanel,
} from "@/components/admin/ecommerce/ecommerce-analytics-panels";

export default function EcommerceAnalyticsPage() {
  const {
    summary,
    cohorts,
    subscriptionHealth,
    verification,
    velocity,
    loading,
  } = useEcommerceAnalytics();

  const headerMeta = (
    <>
      <span>
        {summary.totalMerchants} merchant
        {summary.totalMerchants === 1 ? "" : "s"}
      </span>
      {summary.atRisk > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summary.atRisk} at risk
          </span>
        </>
      )}
      {summary.newThisMonth > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>{summary.newThisMonth} new this month</span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>
        {cohorts.length} cohort{cohorts.length === 1 ? "" : "s"}
      </span>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce analytics"
        description="Merchant cohorts, subscription health, verification, and revenue velocity."
        meta={headerMeta}
      />

      <EcommerceAnalyticsSummaryCards summary={summary} loading={loading} />

      <EcommerceAnalyticsCharts
        cohorts={cohorts}
        subscriptionHealth={subscriptionHealth}
        loading={loading}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <VerificationPanel rows={verification} loading={loading} />
        <div className="lg:col-span-2">
          <VelocityPanel rows={velocity} loading={loading} />
        </div>
      </div>
    </div>
  );
}