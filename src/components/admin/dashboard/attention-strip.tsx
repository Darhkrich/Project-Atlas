// components/admin/dashboard/attention-strip.tsx
"use client";

import Link from "next/link";
import type { AttentionItem } from "@/lib/admin/dashboard/dashboard-projection";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface AttentionStripProps {
  items: AttentionItem[];
  className?: string;
}

const SEVERITY_CLASS: Record<AttentionItem["severity"], string> = {
  critical:
    "border-danger-200 bg-danger-50/70 hover:border-danger-300 dark:border-danger-900/60 dark:bg-danger-950/30 dark:hover:border-danger-800",
  high: "border-warning-200 bg-warning-50/70 hover:border-warning-300 dark:border-warning-900/60 dark:bg-warning-950/30 dark:hover:border-warning-800",
  medium:
    "border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600",
  low: "border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600",
};

const SEVERITY_TEXT_CLASS: Record<AttentionItem["severity"], string> = {
  critical: "text-danger-700 dark:text-danger-300",
  high: "text-warning-700 dark:text-warning-300",
  medium: "text-neutral-700 dark:text-neutral-300",
  low: "text-neutral-600 dark:text-neutral-400",
};

export function AttentionStrip({ items, className }: AttentionStripProps) {
  if (items.length === 0) return null;

  const critical = items.filter((i) => i.severity === "critical").length;
  const heading =
    critical > 0
      ? items.length +
        " item" +
        (items.length === 1 ? "" : "s") +
        " need attention, " +
        critical +
        " critical"
      : items.length +
        " item" +
        (items.length === 1 ? "" : "s") +
        " need attention";

  return (
    <section
      role="region"
      aria-label="Attention queue"
      className={cn("space-y-2", className)}
    >
      <div className="flex items-center gap-2">
        <AtlasIcon
          name="alert"
          aria-hidden="true"
          className="h-4 w-4 text-warning-600 dark:text-warning-400"
        />
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {heading}
        </h2>
      </div>

      <ul
        role="list"
        className="flex snap-x gap-3 overflow-x-auto pb-2"
      >
        {items.map((item) => (
          <li key={item.id} className="snap-start">
            <Link
              href={item.href}
              className={cn(
                "block w-64 rounded-lg border p-3 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                SEVERITY_CLASS[item.severity]
              )}
            >
              <p
                className={cn(
                  "truncate text-xs font-semibold",
                  SEVERITY_TEXT_CLASS[item.severity]
                )}
              >
                {item.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                {item.detail}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}