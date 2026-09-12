// components/admin/analytics/section-breakdown.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { SECTION_FILTER_LABEL } from "@/lib/admin/analytics/contants";
import type { SectionBreakdownRow } from "@/lib/admin/types/analytics";

interface SectionBreakdownProps {
  rows: SectionBreakdownRow[];
}

export function SectionBreakdown({ rows }: SectionBreakdownProps) {
  const maxRevenue = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section breakdown</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Revenue and volume across Atlas surfaces.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No section data for the current filters.
          </p>
        ) : (
          rows.map((row) => {
            const widthPct = Math.round((row.revenue / maxRevenue) * 100);
            return (
              <div
                key={row.section}
                className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {SECTION_FILTER_LABEL[row.section]}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(row.revenue)}
                  </span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                  role="img"
                  aria-label={`${formatCurrency(row.revenue)} in ${SECTION_FILTER_LABEL[row.section]}`}
                >
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Orders
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
                      {formatNumber(row.orders)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Avg order
                    </dt>
                    <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(row.avgOrderValue)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Success
                    </dt>
                    <dd
                      className={cn(
                        "mt-0.5 font-medium",
                        row.successRate >= 95
                          ? "text-success-700 dark:text-success-300"
                          : row.successRate >= 90
                          ? "text-warning-700 dark:text-warning-300"
                          : "text-danger-700 dark:text-danger-300"
                      )}
                    >
                      {row.successRate}%
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}