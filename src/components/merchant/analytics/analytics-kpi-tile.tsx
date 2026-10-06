"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { DELTA_VS_PREV } from "@/lib/merchant/analytics/labels";
import type { KpiDelta } from "@/lib/merchant/analytics/types";

interface AnalyticsKpiTileProps {
  label: string;
  value: string;
  icon: AtlasIconName;
  delta: KpiDelta;
  hideDelta?: boolean;
}

function deltaClass(direction: KpiDelta["direction"]): string {
  if (direction === "up") {
    return "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800";
  }
  if (direction === "down") {
    return "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800";
  }
  return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
}

function deltaArrow(direction: KpiDelta["direction"]): string {
  if (direction === "up") return "\u25B2";
  if (direction === "down") return "\u25BC";
  return "\u2014";
}

function deltaText(delta: KpiDelta): string {
  if (delta.changePct !== null) {
    const pct = Math.abs(delta.changePct);
    return pct.toFixed(1) + "%";
  }
  if (delta.current > 0 && delta.previous === 0) {
    return "New";
  }
  return "0%";
}

function showDelta(delta: KpiDelta, hideDelta: boolean | undefined): boolean {
  if (hideDelta) return false;
  if (delta.previous === 0 && delta.current === 0) return false;
  return true;
}

export function AnalyticsKpiTile({
  label,
  value,
  icon,
  delta,
  hideDelta,
}: AnalyticsKpiTileProps) {
  const visible = showDelta(delta, hideDelta);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          <AtlasIcon name={icon} className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-2 truncate text-xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 sm:text-2xl">
        {value}
      </p>

      {visible && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1",
              deltaClass(delta.direction)
            )}
          >
            <span aria-hidden="true">{deltaArrow(delta.direction)}</span>
            <span>{deltaText(delta)}</span>
          </span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {DELTA_VS_PREV}
          </span>
        </div>
      )}
    </div>
  );
}