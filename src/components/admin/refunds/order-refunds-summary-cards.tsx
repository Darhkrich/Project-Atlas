"use client";

import { Card, CardContent } from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import type { RefundSummary } from "@/lib/admin/types/refund";

interface OrderRefundsSummaryCardsProps {
  summary: RefundSummary;
}

type Polarity = "up-good" | "up-bad" | "neutral";

function TriangleUp() {
  return (
    <svg width="6" height="5" viewBox="0 0 6 5" aria-hidden="true" className="shrink-0">
      <path d="M3 0 L6 5 L0 5 Z" fill="currentColor" />
    </svg>
  );
}

function TriangleDown() {
  return (
    <svg width="6" height="5" viewBox="0 0 6 5" aria-hidden="true" className="shrink-0">
      <path d="M0 0 L6 0 L3 5 Z" fill="currentColor" />
    </svg>
  );
}

interface DeltaChipProps {
  current: number;
  previous: number;
  polarity: Polarity;
  unit: "percent" | "points";
}

function DeltaChip({ current, previous, polarity, unit }: DeltaChipProps) {
  if (previous === 0 && current === 0) return null;

  const neutralClass =
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
  const goodClass =
    "bg-success-100 text-success-700 dark:bg-success-900/60 dark:text-success-300";
  const badClass =
    "bg-danger-100 text-danger-700 dark:bg-danger-900/60 dark:text-danger-300";

  if (previous === 0) {
    return (
      <span
        aria-label="No previous-period data to compare"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
          neutralClass
        )}
      >
        <span>New</span>
        <span className="opacity-70">vs prev</span>
      </span>
    );
  }

  const rawDelta =
    unit === "percent"
      ? ((current - previous) / previous) * 100
      : current - previous;

  if (rawDelta === 0) {
    return (
      <span
        aria-label="Flat versus previous period"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
          neutralClass
        )}
      >
        <span>Flat</span>
        <span className="opacity-70">vs prev</span>
      </span>
    );
  }

  const up = rawDelta > 0;
  const isGood = polarity === "neutral" ? null : polarity === "up-good" ? up : !up;
  const colorClass = isGood === null ? neutralClass : isGood ? goodClass : badClass;

  const absValue = Math.abs(Math.round(rawDelta * 10) / 10);
  const suffix = unit === "percent" ? "%" : "pp";
  const formatted = absValue.toFixed(1) + suffix;

  const screenReaderText =
    (up ? "Up " : "Down ") +
    formatted +
    (polarity === "neutral"
      ? " versus previous period"
      : isGood
      ? " versus previous period, positive"
      : " versus previous period, negative");

  return (
    <span
      role="img"
      aria-label={screenReaderText}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        colorClass
      )}
    >
      {up ? <TriangleUp /> : <TriangleDown />}
      <span>{formatted}</span>
      <span className="opacity-70">vs prev</span>
    </span>
  );
}

export function OrderRefundsSummaryCards({
  summary,
}: OrderRefundsSummaryCardsProps) {
  const hasAwaiting = summary.awaitingApprovalCount > 0;
  const hasFailures = summary.failedToday > 0;

  return (
    <div
      role="region"
      aria-label="Order refunds summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Refunded today
              </p>
              <DeltaChip
                current={summary.volumeToday}
                previous={summary.volumeYesterday}
                polarity="up-bad"
                unit="percent"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(summary.volumeToday)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Order refunds settled today
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Requests today
              </p>
              <DeltaChip
                current={summary.countToday}
                previous={summary.countYesterday}
                polarity="up-bad"
                unit="percent"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {summary.countToday}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Automatic and requested
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card
          className={cn(
            hasAwaiting
              ? "border-warning-300 dark:border-warning-800"
              : undefined
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Awaiting approval
              </p>
              <DeltaChip
                current={summary.awaitingApprovalCount}
                previous={summary.awaitingApprovalYesterday}
                polarity="up-bad"
                unit="percent"
              />
            </div>
            <p
              className={cn(
                "mt-2 text-2xl font-bold",
                hasAwaiting
                  ? "text-warning-700 dark:text-warning-300"
                  : "text-neutral-900 dark:text-neutral-100"
              )}
            >
              {summary.awaitingApprovalCount}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {hasAwaiting ? "Review in the queue" : "Nothing outstanding"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card
          className={cn(
            hasFailures
              ? "border-danger-300 dark:border-danger-800"
              : undefined
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Failed today
              </p>
              <DeltaChip
                current={summary.failedToday}
                previous={summary.failedYesterday}
                polarity="up-bad"
                unit="percent"
              />
            </div>
            <p
              className={cn(
                "mt-2 text-2xl font-bold",
                hasFailures
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-neutral-900 dark:text-neutral-100"
              )}
            >
              {summary.failedToday}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {hasFailures ? "Payouts that could not settle" : "No failures today"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}