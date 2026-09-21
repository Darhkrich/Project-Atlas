"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";

interface ResellerDashboardChartCardProps {
  title: string;
  period?: string;
  /**
   * Plain-text description of the chart's shape. Announced to assistive
   * technology because Recharts SVG output is otherwise opaque. Required
   * when the chart has data.
   */
  srSummary: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  children: ReactNode;
}

export function ResellerDashboardChartCard({
  title,
  period,
  srSummary,
  loading,
  empty,
  emptyMessage = "No data for this period.",
  className,
  children,
}: ResellerDashboardChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        {period && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {period}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            role="status"
            aria-label={`Loading ${title}`}
            className="h-[250px] animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800"
          />
        ) : empty ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
            {emptyMessage}
          </div>
        ) : (
          <div
            role="img"
            aria-label={srSummary}
            className={cn("relative")}
          >
            <span className="sr-only">{srSummary}</span>
            <div aria-hidden="true">{children}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}