"use client";

import type { KeyboardEvent } from "react";
import type { MerchantNotificationKind } from "@/lib/merchant/notifications/types";
import { NOTIFICATION_KIND_LABEL } from "@/lib/merchant/notifications/labels";
import type {
  KindFilter,
  NotificationFilter,
} from "@/lib/merchant/notifications/use-notification-filters";

interface NotificationTabsProps {
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  counts: {
    all: number;
    unread: number;
    read: number;
    snoozed: number;
  };
  kindFilter: KindFilter;
  onKindChange: (kind: KindFilter) => void;
  kindCounts: Record<MerchantNotificationKind, number>;
}

const FILTERS: NotificationFilter[] = ["all", "unread", "read", "snoozed"];
const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: "All",
  unread: "Unread",
  read: "Read",
  snoozed: "Snoozed",
};

export function NotificationTabs({
  filter,
  onFilterChange,
  counts,
  kindFilter,
  onKindChange,
  kindCounts,
}: NotificationTabsProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % FILTERS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + FILTERS.length) % FILTERS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = FILTERS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onFilterChange(FILTERS[next]);
    const parent = event.currentTarget.parentElement;
    const tabs = parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  };

  const kindsWithCounts = (
    Object.keys(kindCounts) as MerchantNotificationKind[]
  ).filter((k) => kindCounts[k] > 0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Notification filter"
        className="flex gap-1 overflow-x-auto rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800"
      >
        {FILTERS.map((tab, index) => {
          const selected = filter === tab;
          const count = counts[tab];
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={() => onFilterChange(tab)}
              className={
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition " +
                (selected
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300")
              }
            >
              {FILTER_LABELS[tab]}
              {count > 0 && (
                <span
                  className={
                    "ml-1.5 text-xs " +
                    (selected
                      ? "text-neutral-500 dark:text-neutral-400"
                      : "text-neutral-400")
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="sr-only">Filter by notification type</span>
        <select
          value={kindFilter}
          onChange={(e) => onKindChange(e.target.value as KindFilter)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="all">All types</option>
          {kindsWithCounts.map((k) => (
            <option key={k} value={k}>
              {NOTIFICATION_KIND_LABEL[k]} ({kindCounts[k]})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}