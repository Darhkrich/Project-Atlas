// components/admin/dashboard/sub-card-with-chart.tsx
"use client";

import type { ReactNode } from "react";
import { DeltaChip } from "./delta-chip";
import { cn } from "@/lib/utils";

type SubCardStatus = "success" | "warning" | "danger" | "neutral";

interface SubCardWithChartProps {
  label: string;
  value: string | number;
  chart?: ReactNode;
  delta?: number | null;
  deltaLabel?: string;
  description?: string;
  icon?: ReactNode;
  loading?: boolean;
  status?: SubCardStatus;
  className?: string;
}

const STATUS_DOT_CLASS: Record<SubCardStatus, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  neutral: "bg-neutral-400",
};

export function SubCardWithChart({
  label,
  value,
  chart,
  delta,
  deltaLabel,
  description,
  icon,
  loading = false,
  status,
  className,
}: SubCardWithChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50",
          className
        )}
        aria-busy="true"
        aria-label={"Loading " + label}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-5 w-28 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-neutral-50 p-3",
        "dark:border-neutral-700 dark:bg-neutral-800/50",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon ? (
          <span className="shrink-0 text-neutral-400 dark:text-neutral-500">
            {icon}
          </span>
        ) : null}
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        {status ? (
          <span
            className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[status])}
            aria-label={status + " status"}
          />
        ) : null}
      </div>

      <p className="mt-0.5 truncate text-base font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {value}
      </p>

      {delta !== undefined || description ? (
        <div className="mt-1 flex items-center gap-2">
          <DeltaChip delta={delta} label={deltaLabel} />
          {description ? (
            <span className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">
              {description}
            </span>
          ) : null}
        </div>
      ) : null}

      {chart ? <div className="mt-2 min-h-[32px]">{chart}</div> : null}
    </div>
  );
}