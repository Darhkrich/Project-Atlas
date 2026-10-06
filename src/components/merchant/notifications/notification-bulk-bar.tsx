"use client";

import { AtlasIcon } from "@/components/atlas/icons";

interface NotificationBulkBarProps {
  count: number;
  onMarkRead: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
  onClear: () => void;
}

export function NotificationBulkBar({
  count,
  onMarkRead,
  onSnooze,
  onDismiss,
  onClear,
}: NotificationBulkBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
    >
      <span className="px-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {count} selected
      </span>
      <span aria-hidden="true" className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
      <button
        type="button"
        onClick={onMarkRead}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Mark read
      </button>
      <button
        type="button"
        onClick={onSnooze}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Snooze
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20"
      >
        Dismiss
      </button>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <AtlasIcon name="x-circle" className="h-4 w-4" />
      </button>
    </div>
  );
}