// components/admin/analytics/chart-card.tsx
"use client";

import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  height?: number;
  children: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  actions,
  loading = false,
  empty = false,
  emptyMessage = "No data for the current filters.",
  className,
  height = 260,
  children,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div
            aria-busy="true"
            aria-label={`Loading ${title}`}
            className="animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800"
            style={{ height }}
          />
        ) : empty ? (
          <div style={{ minHeight: height }}>
            <EmptyState
              variant="no_results"
              title="Not enough data"
              description={emptyMessage}
              className={cn("py-8")}
            />
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}