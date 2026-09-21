/* eslint-disable react/no-unescaped-entities */
"use client";

import { Card, CardContent } from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";
import type { OrdersSummary } from "@/lib/admin/orders/orders-projection";

interface OrdersSummaryCardsProps {
  summary: OrdersSummary;
}

type Polarity = "up-good" | "up-bad" | "neutral";

interface DeltaChipProps {
  current: number;
  previous: number;
  polarity: Polarity;
  unit: "percent" | "points";
}

function TriangleUp() {
  return (
    <svg
      width="6"
      height="5"
      viewBox="0 0 6 5"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M3 0 L6 5 L0 5 Z" fill="currentColor" />
    </svg>
  );
}

function TriangleDown() {
  return (
    <svg
      width="6"
      height="5"
      viewBox="0 0 6 5"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M0 0 L6 0 L3 5 Z" fill="currentColor" />
    </svg>
  );
}

function DeltaChip({ current, previous, polarity, unit }: DeltaChipProps) {
  if (previous === 0 && current === 0) {
    return null;
  }

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
  const isGood =
    polarity === "neutral" ? null : polarity === "up-good" ? up : !up;

  const colorClass =
    isGood === null ? neutralClass : isGood ? goodClass : badClass;

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

export function OrdersSummaryCards({ summary }: OrdersSummaryCardsProps) {
  const hasFailures = summary.failedToday > 0;

  return (
    <div
      role="region"
      aria-label="Orders summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Orders today
              </p>
              <DeltaChip
                current={summary.totalToday}
                previous={summary.totalYesterday}
                polarity="up-good"
                unit="percent"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {summary.totalToday}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {summary.successfulToday} delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Success rate
              </p>
              <DeltaChip
                current={summary.successRateToday}
                previous={summary.successRateYesterday}
                polarity="up-good"
                unit="points"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {summary.successRateToday}%
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Across today's orders
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Retries today
              </p>
              <DeltaChip
                current={summary.retriesToday}
                previous={summary.retriesYesterday}
                polarity="up-bad"
                unit="percent"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {summary.retriesToday}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Automatic system-failure retries
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
              {hasFailures ? "Review on live board" : "No failures today"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}