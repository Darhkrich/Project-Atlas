import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

interface SubCardWithChartProps {
  label: string;
  value: string | number;
  chart: ReactNode;

  /**
   * Small contextual value shown beside the metric.
   * Example: "vs last month"
   */
  breakdown?: string;

  /**
   * Optional metric change.
   * Example: "+12.5%"
   */
  trend?: string;

  /**
   * Direction controls the semantic styling of the trend.
   */
  trendDirection?: TrendDirection;

  /**
   * Optional secondary description.
   */
  description?: string;

  /**
   * Optional icon displayed beside the label.
   */
  icon?: ReactNode;

  /**
   * Indicates that the metric is loading.
   */
  loading?: boolean;

  /**
   * Optional status indicator.
   */
  status?: "success" | "warning" | "danger" | "neutral";

  className?: string;
}

export function SubCardWithChart({
  label,
  value,
  chart,
  breakdown,
  trend,
  trendDirection = "neutral",
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
          "rounded-md border border-neutral-200 bg-neutral-50 p-3",
          "dark:border-neutral-700 dark:bg-neutral-800/50",
          className
        )}
        aria-busy="true"
        aria-label={`Loading ${label}`}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-5 w-28 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group rounded-md border border-neutral-200 bg-neutral-50 p-3",
        "transition-colors duration-150",
        "hover:border-neutral-300 hover:bg-white",
        "dark:border-neutral-700 dark:bg-neutral-800/50",
        "dark:hover:border-neutral-600 dark:hover:bg-neutral-800",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {icon && (
              <span className="shrink-0 text-neutral-400 dark:text-neutral-500">
                {icon}
              </span>
            )}

            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {label}
            </p>

            {status && (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  status === "success" && "bg-emerald-500",
                  status === "warning" && "bg-amber-500",
                  status === "danger" && "bg-red-500",
                  status === "neutral" && "bg-neutral-400"
                )}
                aria-label={`${status} status`}
              />
            )}
          </div>

          {/* Value */}
          <p className="mt-0.5 truncate text-base font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <span className="shrink-0 text-right text-[10px] text-neutral-500 dark:text-neutral-400">
            {breakdown}
          </span>
        )}
      </div>

      {/* Trend */}
      {(trend || description) && (
        <div className="mt-1.5 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-[10px] font-medium",
                trendDirection === "up" &&
                  "text-emerald-600 dark:text-emerald-400",
                trendDirection === "down" &&
                  "text-red-600 dark:text-red-400",
                trendDirection === "neutral" &&
                  "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {trend}
            </span>
          )}

          {description && (
            <span className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">
              {description}
            </span>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="mt-2 min-h-[32px]">
        {chart}
      </div>
    </div>
  );
}