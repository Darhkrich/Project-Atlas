"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";

interface NotificationSummaryStripProps {
  unread: number;
  awaitingAction: number;
  snoozed: number;
}

interface CardSpec {
  label: string;
  value: number;
  detail: string;
  icon: AtlasIconName;
  accent: string;
}

export function NotificationSummaryStrip({
  unread,
  awaitingAction,
  snoozed,
}: NotificationSummaryStripProps) {
  const cards: CardSpec[] = [
    {
      label: "Unread",
      value: unread,
      detail:
        unread === 0
          ? "You are caught up"
          : unread === 1
          ? "1 since last visit"
          : unread + " since last visit",
      icon: "bell",
      accent: "text-brand-700 dark:text-brand-300",
    },
    {
      label: "Awaiting action",
      value: awaitingAction,
      detail:
        awaitingAction === 0
          ? "No decisions owed"
          : "Needs your input",
      icon: "alert-triangle",
      accent: "text-warning-700 dark:text-warning-300",
    },
    {
      label: "Snoozed",
      value: snoozed,
      detail:
        snoozed === 0
          ? "Nothing on hold"
          : "Returns on schedule",
      icon: "clock",
      accent: "text-neutral-600 dark:text-neutral-300",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Notification summary"
      className="grid gap-3 sm:grid-cols-3"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {card.label}
            </span>
            <AtlasIcon
              name={card.icon}
              className={"h-4 w-4 " + card.accent}
            />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}