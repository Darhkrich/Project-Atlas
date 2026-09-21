"use client";

import { Badge } from "@/components/admin/ui/badge";
import { formatNumber } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import type { TreasurySummary } from "@/lib/admin/types/treasury";
import {
  TREASURY_COVERAGE_LABELS,
  TREASURY_COVERAGE_VARIANTS,
} from "@/lib/admin/treasury/treasury-labels";

interface TreasuryCoverageBannerProps {
  summary: TreasurySummary;
}

export function TreasuryCoverageBanner({ summary }: TreasuryCoverageBannerProps) {
  const { coverageStatus, coverageRatio, unmatchedCount } = summary;

  const containerClass =
    coverageStatus === "danger"
      ? "border-danger-300 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20"
      : coverageStatus === "warning"
      ? "border-warning-300 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20"
      : "border-success-300 bg-success-50 dark:border-success-800 dark:bg-success-900/20";

  const textClass =
    coverageStatus === "danger"
      ? "text-danger-800 dark:text-danger-200"
      : coverageStatus === "warning"
      ? "text-warning-800 dark:text-warning-200"
      : "text-success-800 dark:text-success-200";

  const pct = Math.round(coverageRatio * 1000) / 10;

  return (
    <div
      role="region"
      aria-label="Treasury coverage"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3",
        containerClass
      )}
    >
      <div className="flex items-center gap-3">
        <Badge variant={TREASURY_COVERAGE_VARIANTS[coverageStatus]}>
          {TREASURY_COVERAGE_LABELS[coverageStatus]}
        </Badge>
        <div className={cn("text-sm", textClass)}>
          <span className="font-semibold">
            {pct >= 0 ? pct + "%" : "Negative"}
          </span>{" "}
          free cash to liabilities
        </div>
      </div>
      {unmatchedCount > 0 && (
        <div className={cn("text-xs font-medium", textClass)}>
          {formatNumber(unmatchedCount)} unmatched{" "}
          {unmatchedCount === 1 ? "event" : "events"} need review
        </div>
      )}
    </div>
  );
}