// components/admin/security/security-events-table.tsx
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  EVENT_TYPE_ICON,
  EVENT_TYPE_LABEL,
  RESOURCE_KIND_LABEL,
  SEVERITY_LABEL,
  SEVERITY_VARIANT,
} from "@/lib/admin/security/constants";
import { SECTION_LABEL } from "@/lib/admin/settings/constant";
import type { SecurityEvent } from "@/lib/admin/types/security";

type SortKey = "timestamp" | "severity" | "ip" | "user";
type SortDir = "asc" | "desc";

interface SecurityEventsTableProps {
  events: SecurityEvent[];
  focusedId: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

const SEVERITY_RANK = { info: 0, warning: 1, critical: 2 };

export function SecurityEventsTable({
  events,
  focusedId,
  page,
  pageSize,
  onPageChange,
  onOpen,
  onFocus,
}: SecurityEventsTableProps) {
  const now = useNow();
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));

  useEffect(() => {
    if (page > totalPages) onPageChange(1);
  }, [page, totalPages, onPageChange]);

  const sorted = [...events].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "timestamp") {
      cmp =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortKey === "severity") {
      cmp = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    } else if (sortKey === "ip") {
      cmp = a.ip.localeCompare(b.ip);
    } else {
      cmp = a.user.localeCompare(b.user);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <th scope="col" className="px-4 py-3">
                Event
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("user")}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  User{sortIndicator("user")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("ip")}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  IP{sortIndicator("ip")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("severity")}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Severity{sortIndicator("severity")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("timestamp")}
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Time{sortIndicator("timestamp")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400"
                >
                  No events match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((event) => {
                const focused = focusedId === event.id;
                return (
                  <tr
                    key={event.id}
                    data-security-event-id={event.id}
                    onMouseEnter={() => onFocus(event.id)}
                    className={cn(
                      "border-t border-neutral-100 transition-colors dark:border-neutral-800",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
                      focused && "bg-brand-50/60 dark:bg-brand-900/20"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AtlasIcon
                          name={EVENT_TYPE_ICON[event.type] ?? "alert-circle"}
                          className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                        />
                        <span className="text-neutral-900 dark:text-neutral-100">
                          {EVENT_TYPE_LABEL[event.type] ?? event.type}
                        </span>
                        {event.handled && (
                          <Badge variant="success" size="sm">
                            Handled
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {event.actorName ?? event.user}
                      </p>
                      {event.actorName && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {event.user}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        <span>{event.ip}</span>
                        {event.countryCode && (
                          <span className="rounded bg-neutral-100 px-1 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                            {event.countryCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusDot
                          tone={
                            event.severity === "critical"
                              ? "danger"
                              : event.severity === "warning"
                              ? "warning"
                              : "info"
                          }
                          size="sm"
                        />
                        <Badge variant={SEVERITY_VARIANT[event.severity]}>
                          {SEVERITY_LABEL[event.severity]}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <time
                        dateTime={event.timestamp}
                        title={formatAbsolute(event.timestamp)}
                      >
                        {formatRelative(event.timestamp, now)}
                      </time>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {event.section && (
                          <span className="hidden text-[10px] text-neutral-400 md:inline dark:text-neutral-500">
                            {SECTION_LABEL[event.section]}
                          </span>
                        )}
                        {event.resourceKind && (
                          <span className="hidden text-[10px] text-neutral-400 lg:inline dark:text-neutral-500">
                            {RESOURCE_KIND_LABEL[event.resourceKind]}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpen(event.id)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Page {page} of {totalPages} · {events.length} events
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}