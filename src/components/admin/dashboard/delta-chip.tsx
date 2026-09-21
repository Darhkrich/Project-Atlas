// components/admin/dashboard/delta-chip.tsx
"use client";

import { cn } from "@/lib/utils";

interface DeltaChipProps {
  delta?: number | null;
  label?: string;
  className?: string;
}

export function DeltaChip({
  delta,
  label = "vs prev",
  className,
}: DeltaChipProps) {
  if (delta === undefined || delta === null) return null;
  if (!Number.isFinite(delta)) return null;
  if (delta === 0) return null;

  const isUp = delta > 0;
  const arrow = isUp ? "▲" : "▼";
  const sign = isUp ? "+" : "";
  const absolute = Math.abs(delta);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium tabular-nums",
        isUp
          ? "text-success-700 dark:text-success-300"
          : "text-danger-700 dark:text-danger-300",
        className
      )}
      aria-label={
        (isUp ? "Increased " : "Decreased ") +
        absolute +
        " percent " +
        label
      }
    >
      <span aria-hidden="true">{arrow}</span>
      <span>{sign + delta + "%"}</span>
      <span className="font-normal text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </span>
  );
}