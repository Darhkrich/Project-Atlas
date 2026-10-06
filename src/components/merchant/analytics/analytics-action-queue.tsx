"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { ACTION_QUEUE_EMPTY } from "@/lib/merchant/analytics/labels";
import type { ActionQueueItem } from "@/lib/merchant/analytics/types";

interface AnalyticsActionQueueProps {
  items: ActionQueueItem[];
}

const ICON_BY_KIND: Record<ActionQueueItem["kind"], AtlasIconName> = {
  unfulfilled_orders: "package",
  failed_payments: "alert",
  low_stock: "alert",
  active_reports: "alert",
};

export function AnalyticsActionQueue({ items }: AnalyticsActionQueueProps) {
  return (
    <section
      aria-labelledby="analytics-action-queue-heading"
      className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <h2
        id="analytics-action-queue-heading"
        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        What needs you now
      </h2>

      {items.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4 text-brand-600"
            aria-hidden="true"
          />
          <span>{ACTION_QUEUE_EMPTY}</span>
        </div>
      ) : (
        <ul role="list" className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
          {items.map((item) => (
            <li key={item.kind}>
              <Link
                href={item.href}
                className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <AtlasIcon
                    name={ICON_BY_KIND[item.kind]}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-neutral-900 group-hover:text-brand-700 dark:text-neutral-100 dark:group-hover:text-brand-200">
                      {item.title}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      {item.count}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}