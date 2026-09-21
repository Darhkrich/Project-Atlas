"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import Link from "next/link";
import type { PaymentsLedgerRow } from "@/lib/admin/payments/payments-projection";
import { formatCurrency } from "@/lib/admin/formatters";
import { isPaymentRetryable } from "@/lib/admin/payments/payments-labels";

interface Props {
  rows: PaymentsLedgerRow[];
  onViewAll: () => void;
  onRowClick: (row: PaymentsLedgerRow) => void;
  onRetry?: (row: PaymentsLedgerRow) => void;
}

const MAX_DISPLAY = 5;

export function FailedPaymentsCard({
  rows,
  onViewAll,
  onRowClick,
  onRetry,
}: Props) {
  const display = rows.slice(0, MAX_DISPLAY);
  const remaining = Math.max(0, rows.length - MAX_DISPLAY);

  return (
    <Card className="border-l-4 border-l-danger-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-danger-500" />
          </span>
          <CardTitle>Failed payments</CardTitle>
          <span className="rounded-full bg-danger-100 px-2 py-0.5 text-xs font-semibold text-danger-700 dark:bg-danger-900/60 dark:text-danger-300">
            {rows.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No failed payments.
          </p>
        ) : (
          <>
            <ul role="list" className="space-y-2">
              {display.map((row) => {
                const retryable = isPaymentRetryable(row.raw);
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-danger-50/50 p-3 transition-colors hover:bg-danger-50 dark:bg-danger-900/10 dark:hover:bg-danger-900/20"
                  >
                    <button
                      type="button"
                      onClick={() => onRowClick(row)}
                      className="min-w-0 flex-1 text-left"
                      aria-label={"Open payment " + row.id}
                    >
                      <p className="font-mono text-xs font-semibold">
                        {row.id}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {row.user.name}
                      </p>
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(row.amount)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {row.raw.failureReason ?? "Unknown"}
                      </p>
                    </div>
                    <Badge variant={row.statusVariant} className="ml-2">
                      {row.statusLabel}
                    </Badge>
                    {onRetry && retryable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetry(row);
                        }}
                      >
                        Retry
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            {remaining > 0 && (
              <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {"+" + remaining + " more failed - "}
                <Link
                  href="/admin/payments?status=failed"
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  view all
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}