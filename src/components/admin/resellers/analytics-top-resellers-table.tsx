"use client";

import Link from "next/link";
import type { RevenueByResellerRow } from "@/lib/admin/resellers/analytics-projection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import {
  RESELLER_STATUS_LABEL,
} from "@/lib/admin/resellers/dashboard-labels";

interface AnalyticsTopResellersTableProps {
  rows: RevenueByResellerRow[];
  loading?: boolean;
}

export function AnalyticsTopResellersTable({
  rows,
  loading,
}: AnalyticsTopResellersTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top resellers</CardTitle>
        <Link
          href="/admin/resellers"
          className="rounded-sm text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No reseller revenue recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Top resellers by revenue with tier, status, and commissions
              </caption>
              <thead>
                <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                  <th scope="col" className="w-8 py-2">
                    <span className="sr-only">Rank</span>
                  </th>
                  <th scope="col" className="py-2">
                    Reseller
                  </th>
                  <th scope="col" className="py-2">
                    Tier
                  </th>
                  <th scope="col" className="py-2">
                    Status
                  </th>
                  <th scope="col" className="py-2 text-right">
                    Revenue
                  </th>
                  <th scope="col" className="py-2 text-right">
                    Commissions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rate =
                    row.revenue > 0
                      ? (row.commissions / row.revenue) * 100
                      : 0;
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="py-2 text-right text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                        {index + 1}
                      </td>
                      <td className="py-2">
                        <Link
                          href={row.href}
                          className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="py-2">
                        <Badge variant="neutral" size="sm">
                          {row.tier}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={
                            row.status === "active"
                              ? "success"
                              : row.status === "pending"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {RESELLER_STATUS_LABEL[row.status]}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="py-2 text-right">
                        <span className="font-medium">
                          {formatCurrency(row.commissions)}
                        </span>
                        <span
                          className={cn(
                            "ml-1 text-xs text-neutral-500 dark:text-neutral-400"
                          )}
                        >
                          ({rate.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}