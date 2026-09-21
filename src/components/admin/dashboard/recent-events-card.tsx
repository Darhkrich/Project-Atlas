// components/admin/dashboard/recent-events-card.tsx
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/shared/format";

interface RecentEvent {
  id: string | number;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
}

export function RecentEventsCard() {
  const events = mockDashboardData.recentEvents as RecentEvent[];
  useNow();

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Recent System Events
      </h2>
      <ul role="list" className="space-y-2">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex items-start gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50"
          >
            <AtlasIcon
              name="clock"
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {event.actor} {event.action}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {event.resource}
                <span aria-hidden="true"> · </span>
                <time
                  dateTime={event.timestamp}
                  title={formatAbsolute(event.timestamp)}
                >
                  {formatRelative(event.timestamp)}
                </time>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}