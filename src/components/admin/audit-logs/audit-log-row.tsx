/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/audit-logs/audit-log-row.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ACTION_LABEL,
  RESOURCE_KIND_LABEL,
  RESULT_VARIANT,
  SOURCE_LABEL,
  SOURCE_PATH,
} from "@/lib/admin/audit-logs/constants";
import { SECTION_LABEL } from "@/lib/admin/settings/constant";
import type { AuditLogEntry } from "@/lib/admin/types/audit-log";

interface AuditLogRowProps {
  entry: AuditLogEntry;
  focused: boolean;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

export function AuditLogRow({
  entry,
  focused,
  onOpen,
  onFocus,
}: AuditLogRowProps) {
  const now = useNow();
  const sourcePath = entry.source ? SOURCE_PATH[entry.source] : null;

  return (
    <li
      data-audit-id={entry.id}
      onMouseEnter={() => onFocus(entry.id)}
      className={cn(
        "rounded-lg border bg-white transition-colors dark:bg-neutral-900",
        "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60",
        focused && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(entry.id)}
        className="w-full px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              entry.result === "success"
                ? "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300"
                : "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300"
            )}
          >
            <AtlasIcon
              name={entry.result === "success" ? "check-circle" : "x-circle"}
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {entry.actorName ?? entry.admin}
              </span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {ACTION_LABEL[entry.action]}
              </span>
              <Badge variant={RESULT_VARIANT[entry.result]} size="sm">
                {entry.result}
              </Badge>
              {entry.section && (
                <Badge variant="brand" size="sm">
                  {SECTION_LABEL[entry.section]}
                </Badge>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="text-neutral-700 dark:text-neutral-300">
                {entry.resource}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{entry.resourceId}</span>
              {sourcePath && (
                <>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={sourcePath}
                    className="text-brand-700 hover:underline dark:text-brand-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {entry.source ? SOURCE_LABEL[entry.source] : ""}
                  </Link>
                </>
              )}
            </div>

            {entry.previousValue !== undefined &&
              entry.newValue !== undefined && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="line-through text-neutral-400 dark:text-neutral-500">
                    {entry.previousValue}
                  </span>
                  <span aria-hidden="true" className="text-neutral-400">
                    →
                  </span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {entry.newValue}
                  </span>
                </div>
              )}

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-mono">{entry.ip}</span>
              <time
                dateTime={entry.timestamp}
                title={formatAbsolute(entry.timestamp)}
              >
                {formatRelative(entry.timestamp, now)}
              </time>
            </div>
          </div>

          <span
            className="mt-1 shrink-0 text-neutral-400 dark:text-neutral-500"
            aria-hidden="true"
          >
            <AtlasIcon name="chevron-right" className="h-4 w-4" />
          </span>
        </div>
      </button>
    </li>
  );
}