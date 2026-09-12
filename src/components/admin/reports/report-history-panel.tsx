// components/admin/reports/report-history-panel.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ALL_FORMATS,
  ALL_REPORT_TYPES,
  FORMAT_LABEL,
  REPORT_TYPE_LABEL,
  RETENTION_DAYS,
  SECTION_SCOPE_LABEL,
  formatBytes,
} from "@/lib/admin/reports/constants";
import type {
  ReportFormat,
  ReportHistoryItem,
  ReportType,
} from "@/lib/admin/types/report";

interface ReportHistoryPanelProps {
  items: ReportHistoryItem[];
  onDownload: (item: ReportHistoryItem) => void;
}

type FormatFilter = ReportFormat | "all";
type TypeFilter = ReportType | "all";

const PAGE_SIZE = 6;

export function ReportHistoryPanel({
  items,
  onDownload,
}: ReportHistoryPanelProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [page, setPage] = useState(1);
  const now = useNow();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "all" && item.reportType !== typeFilter) return false;
      if (formatFilter !== "all" && item.format !== formatFilter) return false;
      if (q) {
        const haystack = [
          item.reportName,
          item.fileName,
          item.generatedByName ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, typeFilter, formatFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters =
    search.trim().length > 0 ||
    typeFilter !== "all" ||
    formatFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setFormatFilter("all");
    setPage(1);
  };

  const selectClass =
    "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Report history</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Generated files are retained for {RETENTION_DAYS} days. Downloads
            are regenerated from current data.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            aria-label="Search report history"
            placeholder="Search by name, file, or author…"
            className="max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            aria-label="Filter by report type"
            className={selectClass}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TypeFilter);
              setPage(1);
            }}
          >
            <option value="all">All report types</option>
            {ALL_REPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {REPORT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by format"
            className={selectClass}
            value={formatFilter}
            onChange={(e) => {
              setFormatFilter(e.target.value as FormatFilter);
              setPage(1);
            }}
          >
            <option value="all">All formats</option>
            {ALL_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABEL[f]}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length} of {items.length} entries
        </p>

        {slice.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {hasActiveFilters
              ? "No history entries match these filters."
              : "No reports have been generated yet."}
          </p>
        ) : (
          <ul className="space-y-2">
            {slice.map((item) => {
              const isExpiringSoon =
                now !== null &&
                new Date(item.expiresAt).getTime() - now < 7 * 86_400_000;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.fileName}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {FORMAT_LABEL[item.format]}
                      </Badge>
                    </div>

                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.reportName} ·{" "}
                      {SECTION_SCOPE_LABEL[item.section]}
                    </p>

                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.generatedByName
                        ? `By ${item.generatedByName} · `
                        : ""}
                      <time
                        dateTime={item.generatedAt}
                        title={formatAbsolute(item.generatedAt)}
                      >
                        {formatRelative(item.generatedAt, now)}
                      </time>
                      {" · "}
                      {item.rowCount.toLocaleString("en-GH")} rows
                      {" · "}
                      {formatBytes(item.fileSizeBytes)}
                    </p>

                    <p
                      className={
                        isExpiringSoon
                          ? "mt-0.5 text-xs text-warning-700 dark:text-warning-300"
                          : "mt-0.5 text-xs text-neutral-400 dark:text-neutral-500"
                      }
                    >
                      Expires{" "}
                      <time
                        dateTime={item.expiresAt}
                        title={formatAbsolute(item.expiresAt)}
                      >
                        {formatRelative(item.expiresAt, now)}
                      </time>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(item)}
                    >
                      Download
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}