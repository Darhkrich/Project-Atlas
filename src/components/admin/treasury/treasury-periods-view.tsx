"use client";

import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatAbsolute } from "@/lib/admin/support/format";
import {
  PERIOD_STATUS_LABELS,
  PERIOD_STATUS_VARIANTS,
  formatPeriodLabel,
} from "@/lib/domains/treasury/period-labels";
import type {
  CloseReadiness,
  PeriodState,
  TreasuryPeriodId,
} from "@/lib/domains/treasury/period-types";

interface Props {
  loading: boolean;
  periods: PeriodState[];
  nextClosablePeriodId: TreasuryPeriodId;
  nextClosableReadiness: CloseReadiness | null;
  nowMs: number | null;
  canClose: boolean;
  onClosePeriod: (periodId: TreasuryPeriodId) => void;
}

export function TreasuryPeriodsView({
  loading,
  periods,
  nextClosablePeriodId,
  nextClosableReadiness,
  nowMs,
  canClose,
  onClosePeriod,
}: Props) {
  void nowMs;

  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading periods"
        className="space-y-2"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          variant="no_data"
          title="No periods yet"
          description="Periods appear here as the treasury ledger accumulates events."
        />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <caption className="sr-only">Treasury periods</caption>
        <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Period
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Closed
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Cash at bank
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Free cash
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Events
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => {
            const isNextClosable = period.periodId === nextClosablePeriodId;
            const close = period.close;
            const snapshot = close?.snapshot;
            const readinessBlocked =
              isNextClosable &&
              nextClosableReadiness !== null &&
              !nextClosableReadiness.ready;
            return (
              <tr
                key={period.periodId}
                className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800"
              >
                <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {formatPeriodLabel(period.periodId)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={PERIOD_STATUS_VARIANTS[period.status]}>
                    {PERIOD_STATUS_LABELS[period.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400">
                  {close ? formatAbsolute(close.closedAt) : "—"}
                  {close && (
                    <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-500">
                      by {close.closedBy.name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-neutral-900 dark:text-neutral-100">
                  {snapshot ? formatCurrency(snapshot.cashAtBank) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-neutral-900 dark:text-neutral-100">
                  {snapshot ? formatCurrency(snapshot.freeCash) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm tabular-nums text-neutral-900 dark:text-neutral-100">
                  {snapshot ? snapshot.eventCount : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {isNextClosable && canClose ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onClosePeriod(period.periodId)}
                      disabled={readinessBlocked}
                      aria-label={
                        "Close period " + formatPeriodLabel(period.periodId)
                      }
                    >
                      Close period
                    </Button>
                  ) : isNextClosable && !canClose ? (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      No permission
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      —
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {nextClosableReadiness && !nextClosableReadiness.ready && (
        <div className="border-t border-warning-200 bg-warning-50 px-4 py-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100">
          <p className="font-medium">
            {formatPeriodLabel(nextClosablePeriodId)} is not ready to close.
          </p>
          <ul role="list" className="mt-1 list-disc pl-4">
            {nextClosableReadiness.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}