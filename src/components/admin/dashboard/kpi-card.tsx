"use client";

import Link from "next/link";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

export type KpiDeltaPolarity = "up-good" | "up-bad" | "neutral";

export interface KpiCardProps {
  label: string;
  value: string;
  delta: number | null;
  deltaPolarity: KpiDeltaPolarity;
  icon: AtlasIconName;
  href: string;
  sublabel?: string;
  tone?: "neutral" | "warning" | "danger";
}

export function KpiCard({
  label,
  value,
  delta,
  deltaPolarity,
  icon,
  href,
  sublabel,
  tone = "neutral",
}: KpiCardProps) {
  const valueClass = {
    neutral: "text-neutral-900 dark:text-neutral-100",
    warning: "text-warning-700 dark:text-warning-300",
    danger: "text-danger-700 dark:text-danger-300",
  }[tone];

  const deltaTone =
    delta === null
      ? "text-neutral-400 dark:text-neutral-500"
      : deltaPolarity === "neutral"
      ? "text-neutral-600 dark:text-neutral-400"
      : (delta >= 0) === (deltaPolarity === "up-good")
      ? "text-success-700 dark:text-success-400"
      : "text-danger-700 dark:text-danger-400";

  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Card className="transition-shadow group-hover:shadow-md">
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {label}
            </p>
            <AtlasIcon
              name={icon}
              aria-hidden="true"
              className="h-4 w-4 text-neutral-400"
            />
          </div>
          <p className={cn("mt-2 text-2xl font-bold tabular-nums", valueClass)}>
            {value}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs">
            {sublabel ? (
              <span className="text-neutral-500 dark:text-neutral-400">
                {sublabel}
              </span>
            ) : (
              <span />
            )}
            <span className={cn("font-medium tabular-nums", deltaTone)}>
              {delta === null
                ? "No prior data"
                : (delta >= 0 ? "+" : "") +
                  delta.toFixed(1) +
                  "%"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}