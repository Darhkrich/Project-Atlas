"use client";

import { NotificationRow } from "./notification-row";
import type { MerchantNotification } from "@/lib/merchant/notifications/types";

type DayBucket = "today" | "yesterday" | "earlier";

function bucketFor(timestamp: number, now: number): DayBucket {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday.getTime() - 24 * 60 * 60 * 1000;
  if (timestamp >= startOfToday.getTime()) return "today";
  if (timestamp >= startOfYesterday) return "yesterday";
  return "earlier";
}

const BUCKET_LABELS: Record<DayBucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};

interface NotificationListProps {
  notifications: MerchantNotification[];
  now: number;
  focusedId: string | null;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onMarkRead: (id: string) => void;
  onSnooze: (id: string, untilMs: number) => void;
  onDismiss: (notification: MerchantNotification) => void;
  onToggleSelect: (id: string) => void;
  onFocusRow: (id: string) => void;
  onWakeNow: (id: string) => void;
}

export function NotificationList({
  notifications,
  now,
  focusedId,
  selectionMode,
  selectedIds,
  onMarkRead,
  onSnooze,
  onDismiss,
  onToggleSelect,
  onFocusRow,
  onWakeNow,
}: NotificationListProps) {
  const buckets: Record<DayBucket, MerchantNotification[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  for (const n of notifications) {
    buckets[bucketFor(n.createdAt, now)].push(n);
  }

  const order: DayBucket[] = ["today", "yesterday", "earlier"];

  return (
    <div
      aria-label="Notifications list"
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      {order.map((bucket) => {
        const items = buckets[bucket];
        if (items.length === 0) return null;
        return (
          <section key={bucket}>
            <h2 className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
              {BUCKET_LABELS[bucket]}
            </h2>
            <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
              {items.map((n) => (
                <li key={n.id}>
                  <NotificationRow
                    notification={n}
                    now={now}
                    focused={focusedId === n.id}
                    selectionMode={selectionMode}
                    selected={selectedIds.has(n.id)}
                    onMarkRead={onMarkRead}
                    onSnooze={onSnooze}
                    onDismiss={onDismiss}
                    onToggleSelect={onToggleSelect}
                    onFocusRow={onFocusRow}
                    onWakeNow={onWakeNow}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}