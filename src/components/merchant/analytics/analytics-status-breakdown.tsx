"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/merchant/orders/labels";
import { STATUS_BREAKDOWN_EMPTY } from "@/lib/merchant/analytics/labels";
import type { StatusBreakdownRow } from "@/lib/merchant/analytics/types";

interface AnalyticsStatusBreakdownProps {
  rows: StatusBreakdownRow[];
}

function barClass(status: StatusBreakdownRow["status"]): string {
  switch (status) {
    case "new":
      return "bg-warning-500";
    case "processing":
      return "bg-info-500";
    case "shipped":
      return "bg-brand-500";
    case "delivered":
      return "bg-success-500";
    case "cancelled":
      return "bg-neutral-400";
  }
}

export function AnalyticsStatusBreakdown({
  rows,
}: AnalyticsStatusBreakdownProps) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <section
      aria-labelledby="analytics-status-heading"
      className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <h2
        id="analytics-status-heading"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Orders by status
      </h2>

      {total === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          {STATUS_BREAKDOWN_EMPTY}
        </p>
      ) : (
        <ul role="list" className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.status}>
              <Link
                href={row.href}
                className="block rounded-lg transition hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <div className="flex items-baseline justify-between gap-2 px-1">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {ORDER_STATUS_LABELS[row.status]}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                    {row.count}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      barClass(row.status)
                    )}
                    style={{
                      width: Math.max(2, row.shareOfMax * 100) + "%",
                    }}
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}