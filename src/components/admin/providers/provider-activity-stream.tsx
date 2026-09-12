/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityEvent, ActivityEventType } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { ACTIVITY_PAGE_SIZE } from "@/lib/admin/providers/constants";

interface ProviderActivityStreamProps {
  events: ActivityEvent[];
}

const typeConfig: Record<
  ActivityEventType,
  { label: string; icon: AtlasIconName; color: string }
> = {
  health_check: { label: "Health check", icon: "activity", color: "text-info-600" },
  transaction: { label: "Transaction", icon: "receipt", color: "text-brand-600" },
  config_change: { label: "Config change", icon: "settings", color: "text-warning-600" },
  credential_event: { label: "Credentials", icon: "lock", color: "text-danger-600" },
  routing_change: { label: "Routing", icon: "link", color: "text-success-600" },
};

const statusDot: Record<ActivityEvent["status"], string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
};

const statusLabel: Record<ActivityEvent["status"], string> = {
  success: "Success",
  warning: "Warning",
  danger: "Failure",
  info: "Info",
};

export function ProviderActivityStream({ events }: ProviderActivityStreamProps) {
  const now = useNow();
  const [typeFilter, setTypeFilter] = useState<ActivityEventType | "">("");
  const [visibleCount, setVisibleCount] = useState(ACTIVITY_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(ACTIVITY_PAGE_SIZE);
  }, [events]);

  const filtered = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (!typeFilter) return sorted;
    return sorted.filter((e) => e.type === typeFilter);
  }, [events, typeFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const groups = useMemo(() => groupByDay(visible), [visible]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Provider activity</CardTitle>
        <select
          aria-label="Filter events by type"
          className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as ActivityEventType | "");
            setVisibleCount(ACTIVITY_PAGE_SIZE);
          }}
        >
          <option value="">All events</option>
          {(Object.keys(typeConfig) as ActivityEventType[]).map((key) => (
            <option key={key} value={key}>
              {typeConfig[key].label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {events.length === 0
              ? "No activity recorded."
              : "No events match this filter."}
          </p>
        ) : (
          <>
            {groups.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {group.label}
                </p>
                <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
                  {group.events.map((event) => {
                    const config = typeConfig[event.type];
                    return (
                      <li key={event.id} className="relative">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-neutral-900",
                            statusDot[event.status]
                          )}
                        >
                          <AtlasIcon
                            name={config.icon}
                            className="h-2 w-2 text-white"
                          />
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="neutral" size="sm">
                            {config.label}
                          </Badge>
                          <p className="text-sm font-medium">{event.title}</p>
                          <span className="sr-only">
                            Status: {statusLabel[event.status]}
                          </span>
                        </div>
                        {event.description && (
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                          <span title={formatDateTime(event.timestamp)}>
                            {formatRelative(event.timestamp, now)}
                          </span>
                          {event.actor && <span>by {event.actor}</span>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((v) => v + ACTIVITY_PAGE_SIZE)}
                >
                  Show {Math.min(ACTIVITY_PAGE_SIZE, filtered.length - visibleCount)}{" "}
                  more
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function groupByDay(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
  const today = new Date();
  const todayKey = today.toDateString();
  const yesterday = new Date(today.getTime() - 86_400_000).toDateString();

  const buckets = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const d = new Date(e.timestamp);
    const key =
      d.toDateString() === todayKey
        ? "Today"
        : d.toDateString() === yesterday
        ? "Yesterday"
        : d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(e);
  }

  return Array.from(buckets.entries()).map(([label, events]) => ({
    label,
    events,
  }));
}