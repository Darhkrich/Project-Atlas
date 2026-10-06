// components/admin/audit-logs/financial-audit-row.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { SECTION_LABEL } from "@/lib/admin/settings/constant";
import type { FinancialAuditRow } from "@/lib/admin/audit-logs/financial-projection";

interface FinancialAuditRowProps {
  row: FinancialAuditRow;
  focused: boolean;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

export function FinancialAuditRow({
  row,
  focused,
  onOpen,
  onFocus,
}: FinancialAuditRowProps) {
  const now = useNow();

  return (
    <li
      data-audit-id={row.id}
      onMouseEnter={() => onFocus(row.id)}
      className={cn(
        "rounded-lg border bg-white transition-colors dark:bg-neutral-900",
        "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60",
        focused && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(row.id)}
        className="w-full px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            )}
          >
            <AtlasIcon
              name="activity"
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {row.actorName}
              </span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {row.actionLabel}
              </span>
              {row.section && (
                <Badge variant="brand" size="sm">
                  {SECTION_LABEL[row.section]}
                </Badge>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="text-neutral-700 dark:text-neutral-300">
                {row.resourceLabel}
              </span>
              <span aria-hidden="true">{"\u00B7"}</span>
              <span className="font-mono">{row.resourceId}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="truncate">{row.actorEmail}</span>
              <time
                dateTime={row.timestamp}
                title={formatAbsolute(row.timestamp)}
              >
                {formatRelative(row.timestamp, now)}
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