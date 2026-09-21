"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResellerDashboardSummaryCards } from "@/components/admin/resellers/reseller-dashboard-summary-cards";
import { ResellerDashboardCharts } from "@/components/admin/resellers/reseller-dashboard-charts";
import { ResellerDashboardActivity } from "@/components/admin/resellers/reseller-dashboard-activity";
import { useResellerDashboard } from "@/lib/admin/hooks/use-reseller-dashboard";
import { cn } from "@/lib/utils";

export default function ResellerDashboardPage() {
  const {
    summary,
    growth,
    topResellers,
    commissionsByTier,
    topPendingCommissions,
    recentActivity,
    loading,
  } = useResellerDashboard();

  const meta = (
    <>
      <span>{summary.totalResellers} resellers</span>
      <span aria-hidden="true">·</span>
      <span>{summary.activeResellers} active</span>
      <span aria-hidden="true">·</span>
      <span>{summary.pendingVerification} pending</span>
      {summary.suspendedResellers > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summary.suspendedResellers} suspended
          </span>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller dashboard"
        description="Operational overview of the reseller channel."
        meta={meta}
        actions={
          <>
            <Link
              href="/admin/resellers"
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium",
                "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                "dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              )}
            >
              View resellers
            </Link>
            <Link
              href="/admin/resellers/storefronts"
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium",
                "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                "dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              )}
            >
              Manage storefronts
            </Link>
          </>
        }
      />

      <ResellerDashboardSummaryCards summary={summary} loading={loading} />

      <ResellerDashboardCharts
        growth={growth}
        topResellers={topResellers}
        commissionsByTier={commissionsByTier}
        topPendingCommissions={topPendingCommissions}
        loading={loading}
      />

      <ResellerDashboardActivity activities={recentActivity} />
    </div>
  );
}