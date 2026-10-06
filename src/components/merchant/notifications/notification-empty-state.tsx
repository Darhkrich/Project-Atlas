"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { NotificationFilter } from "@/lib/merchant/notifications/use-notification-filters";

interface NotificationEmptyStateProps {
  filter: NotificationFilter;
  onCta: () => void;
}

interface Copy {
  title: string;
  body: string;
  cta: string;
}

const COPY: Record<NotificationFilter, Copy> = {
  all: {
    title: "You are clear",
    body: "Everything has been read, snoozed, or dismissed.",
    cta: "Go to dashboard",
  },
  unread: {
    title: "No unread notifications",
    body: "You have looked at everything that has come in.",
    cta: "View all",
  },
  read: {
    title: "Nothing read yet",
    body: "Notifications you have opened will live here.",
    cta: "Back to unread",
  },
  snoozed: {
    title: "Nothing is snoozed",
    body: "Notifications you defer will wait here until they are due.",
    cta: "View all",
  },
};

export function NotificationEmptyState({
  filter,
  onCta,
}: NotificationEmptyStateProps) {
  const { title, body, cta } = COPY[filter];
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <AtlasIcon name="bell" className="h-6 w-6 text-neutral-400" />
      </div>
      <p className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">{body}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {cta}
      </button>
    </div>
  );
}