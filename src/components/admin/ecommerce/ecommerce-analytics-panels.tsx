"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  VelocityRow,
  VerificationRow,
} from "@/lib/admin/ecommerce/analytics-projection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import {
  VELOCITY_TREND_LABEL,
  VELOCITY_TREND_VARIANT,
  VERIFICATION_STATUS_LABEL,
  VERIFICATION_STATUS_VARIANT,
} from "@/lib/admin/ecommerce/analytics-labels";

/* ======================================================================
   Verification funnel
   ====================================================================== */

interface VerificationPanelProps {
  rows: VerificationRow[];
  loading?: boolean;
}

export function VerificationPanel({ rows, loading }: VerificationPanelProps) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Verification funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : total === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No merchants yet.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.status}
                className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0 dark:border-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={VERIFICATION_STATUS_VARIANT[row.status]} size="sm">
                    {VERIFICATION_STATUS_LABEL[row.status]}
                  </Badge>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {row.percent.toFixed(0)}%
                  </span>
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatNumber(row.count)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ======================================================================
   Revenue velocity
   ====================================================================== */

interface VelocityPanelProps {
  rows: VelocityRow[];
  loading?: boolean;
}

const INITIAL_VISIBLE = 10;

export function VelocityPanel({ rows, loading }: VelocityPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, INITIAL_VISIBLE);
  const hasMore = rows.length > INITIAL_VISIBLE;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Revenue velocity</CardTitle>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {rows.length} merchant{rows.length === 1 ? "" : "s"}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No merchant revenue data yet.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Revenue velocity by merchant
                </caption>
                <thead>
                  <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                    <th scope="col" className="py-2">
                      Merchant
                    </th>
                    <th scope="col" className="py-2 text-right">
                      Lifetime
                    </th>
                    <th scope="col" className="py-2 text-right">
                      30-day
                    </th>
                    <th scope="col" className="py-2 text-right">
                      Monthly avg
                    </th>
                    <th scope="col" className="py-2 text-right">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => {
                    const monthlyAvg =
                      row.monthsActive === 0
                        ? 0
                        : row.lifetimeRevenue / row.monthsActive;
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="py-2">
                          <Link
                            href={row.href}
                            className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(row.lifetimeRevenue)}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(row.revenue30d)}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(Math.round(monthlyAvg))}
                        </td>
                        <td className="py-2 text-right">
                          <Badge
                            variant={VELOCITY_TREND_VARIANT[row.trend]}
                            size="sm"
                          >
                            {VELOCITY_TREND_LABEL[row.trend]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="mt-3 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                >
                  <AtlasIcon
                    name="chevron-down"
                    aria-hidden="true"
                    className={cn(
                      "mr-1 h-3.5 w-3.5 transition-transform",
                      showAll && "rotate-180"
                    )}
                  />
                  {showAll
                    ? "Show top 10"
                    : "Show all " + rows.length + " merchants"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}