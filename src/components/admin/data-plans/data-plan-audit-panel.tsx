"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import type { DataPlanAuditEntry } from "@/lib/admin/data-plans/audit";
import { dataPlanAuditToCsv } from "@/lib/admin/data-plans/csv-export";
import { cn } from "@/lib/utils";

interface DataPlanAuditPanelProps {
  entries: DataPlanAuditEntry[];
}

const INITIAL_VISIBLE = 8;

export function DataPlanAuditPanel({ entries }: DataPlanAuditPanelProps) {
  const now = useNow();
  const [open, setOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [entries]
  );

  const visible = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visibleCount;

  const handleExport = () => {
    const csv = dataPlanAuditToCsv(sorted);
    downloadCsv(
      `atlas-data-plans-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 text-left"
        >
          <AtlasIcon
            name="chevron-down"
            aria-hidden="true"
            className={cn(
              "h-4 w-4 transition-transform",
              !open && "-rotate-90"
            )}
          />
          <CardTitle className="text-sm">Recent activity</CardTitle>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {sorted.length}
          </span>
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          aria-label="Export audit log as CSV"
        >
          <AtlasIcon
            name="download"
            aria-hidden="true"
            className="mr-1 h-4 w-4"
          />
          Export
        </Button>
      </CardHeader>
      {open && (
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No activity recorded yet.
            </p>
          ) : (
            <>
              <ul role="list" className="space-y-2">
                {visible.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0 dark:border-neutral-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-900 dark:text-neutral-100">
                        {entry.summary}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {entry.adminName} · {entry.networkName} · {entry.action}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                      {formatRelative(entry.timestamp, now)}
                    </span>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + INITIAL_VISIBLE)}
                  className="mt-3 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Show{" "}
                  {Math.min(INITIAL_VISIBLE, sorted.length - visibleCount)}{" "}
                  more
                </button>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}