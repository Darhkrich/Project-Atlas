"use client";

import Link from "next/link";
import type { RecentActivity } from "@/lib/admin/types/reseller-dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  ACTIVITY_TYPE_LABEL,
  ACTIVITY_TYPE_VARIANT,
} from "@/lib/admin/resellers/dashboard-labels";

interface ResellerDashboardActivityProps {
  activities: RecentActivity[];
}

export function ResellerDashboardActivity({
  activities,
}: ResellerDashboardActivityProps) {
  const now = useNow();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent reseller activity</CardTitle>
        <span
          className="text-xs text-neutral-500 dark:text-neutral-400"
          aria-live="polite"
        >
          {activities.length} event{activities.length === 1 ? "" : "s"}
        </span>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-200 p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <AtlasIcon
              name="activity"
              aria-hidden="true"
              className="h-4 w-4"
            />
            No reseller activity recorded yet.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-center gap-3 border-b border-neutral-100 pb-2 text-sm last:border-b-0 last:pb-0 dark:border-neutral-800"
              >
                <Badge
                  variant={ACTIVITY_TYPE_VARIANT[activity.type]}
                  size="sm"
                >
                  {ACTIVITY_TYPE_LABEL[activity.type]}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    <Link
                      href={activity.href}
                      className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                    >
                      {activity.resellerName}
                    </Link>
                    {activity.actor && ` · by ${activity.actor}`}
                  </p>
                </div>
                <span
                  className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
                  title={formatDateTime(activity.timestamp)}
                >
                  {formatRelative(activity.timestamp, now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}