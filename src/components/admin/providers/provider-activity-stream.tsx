"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

export type ActivityEventType =
  | "health_check"
  | "transaction"
  | "config_change"
  | "credential_event"
  | "routing_change";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  timestamp: string;
  status: "success" | "warning" | "danger" | "info";
  actor?: string;
}

interface ProviderActivityStreamProps {
  events: ActivityEvent[];
}

const typeConfig: Record<
  ActivityEventType,
  { label: string; icon: AtlasIconName; color: string }
> = {
  health_check: { label: "Health Check", icon: "activity", color: "text-info-600" },
  transaction: { label: "Transaction", icon: "receipt", color: "text-brand-600" },
  config_change: { label: "Config Change", icon: "settings", color: "text-warning-600" },
  credential_event: { label: "Credentials", icon: "lock", color: "text-danger-600" },
  routing_change: { label: "Routing", icon: "link", color: "text-success-600" },
};

const statusDot: Record<string, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
};

const PAGE_SIZE = 10;

export function ProviderActivityStream({ events }: ProviderActivityStreamProps) {
  const [typeFilter, setTypeFilter] = useState<ActivityEventType | "">("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!typeFilter) return events;
    return events.filter((e) => e.type === typeFilter);
  }, [events, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Provider Activity Stream</CardTitle>
        <select
          className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as ActivityEventType | "");
            setPage(1);
          }}
        >
          <option value="">All Events</option>
          {(Object.keys(typeConfig) as ActivityEventType[]).map((key) => (
            <option key={key} value={key}>
              {typeConfig[key].label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {paginated.length === 0 ? (
          <p className="text-sm text-neutral-400">No events found.</p>
        ) : (
          <>
            <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
              {paginated.map((event) => {
                const config = typeConfig[event.type];
                return (
                  <li key={event.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-neutral-900",
                        statusDot[event.status]
                      )}
                    >
                      <AtlasIcon name={config.icon} className="h-2 w-2 text-white" />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">{config.label}</Badge>
                      <p className="text-sm font-medium">{event.title}</p>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-400">
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                      {event.actor && <span>by {event.actor}</span>}
                    </div>
                  </li>
                );
              })}
            </ol>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Page {page} of {totalPages} · {filtered.length} events
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}