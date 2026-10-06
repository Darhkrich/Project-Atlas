/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useEcommerceDashboard } from "@/lib/admin/hooks/use-ecommerce-dashboard";
import { EcommerceSummaryCards } from "@/components/admin/ecommerce/ecommerce-summary-cards";
import { EcommerceDashboardCharts } from "@/components/admin/ecommerce/ecommerce-dashboard-charts";
import {
  ACTIVITY_KIND_LABEL,
  ACTIVITY_KIND_VARIANT,
} from "@/lib/admin/ecommerce/dashboard-labels";
import { formatNumber, formatCurrency } from "@/lib/admin/formatters";

export default function EcommerceDashboardPage() {
  const now = useNow();
  const {
    summary,
    planDistribution,
    topMerchants,
    revenueByTemplate,
    recentActivity,
    loading,
  } = useEcommerceDashboard();

  const headerMeta = (
    <>
      <span>
        {summary.totalMerchants} merchant
        {summary.totalMerchants === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.activeSubscriptions} active subscriptions</span>
      {summary.pastDueSubscriptions > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-warning-700 dark:text-warning-300">
            {summary.pastDueSubscriptions} past due
          </span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{formatCurrency(summary.mrr)} MRR</span>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce dashboard"
        description="Operational overview of the Atlas E-commerce platform."
        meta={headerMeta}
        actions={
          <>
            <Link
              href="/admin/ecommerce/merchants"
              className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              View merchants
            </Link>
            <Link
              href="/admin/ecommerce/subscriptions"
              className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Manage subscriptions
            </Link>
          </>
        }
      />

      <EcommerceSummaryCards summary={summary} loading={loading} />

      <EcommerceDashboardCharts
        planDistribution={planDistribution}
        topMerchants={topMerchants}
        revenueByTemplate={revenueByTemplate}
        loading={loading}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Recent activity</CardTitle>
          <span
            className="text-xs text-neutral-500 dark:text-neutral-400"
            aria-live="polite"
          >
            {recentActivity.length} event
            {recentActivity.length === 1 ? "" : "s"}
          </span>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <AtlasIcon
                name="activity"
                aria-hidden="true"
                className="h-4 w-4"
              />
              No recent activity recorded.
            </div>
          ) : (
            <ul role="list" className="space-y-2">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 border-b border-neutral-100 pb-2 text-sm last:border-b-0 last:pb-0 dark:border-neutral-800"
                >
                  <Badge variant={ACTIVITY_KIND_VARIANT[item.kind]} size="sm">
                    {ACTIVITY_KIND_LABEL[item.kind]}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {item.description}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      <Link
                        href={item.href}
                        className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                      >
                        {item.merchantName}
                      </Link>
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
                    title={formatDateTime(item.timestamp)}
                  >
                    {now ? formatRelative(item.timestamp, now) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}