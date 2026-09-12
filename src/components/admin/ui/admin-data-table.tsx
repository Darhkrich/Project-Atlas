"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { Button } from "./button";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  dataIndex?: keyof T;
  sortFn?: (a: T, b: T) => number;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  caption?: string;
}

type SortDirection = "asc" | "desc";
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function AdminDataTable<T>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = "No data found.",
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  totalCount,
  rowKey,
  onRowClick,
  caption,
}: AdminDataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const isServerPaginated = typeof totalCount === "number";

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const col = columns.find((c) => c.key === sortConfig.key);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let result = 0;
      if (col.sortFn) {
        result = col.sortFn(a, b);
      } else if (col.dataIndex) {
        const av = a[col.dataIndex];
        const bv = b[col.dataIndex];
        if (av == null && bv == null) result = 0;
        else if (av == null) result = 1;
        else if (bv == null) result = -1;
        else if (av < bv) result = -1;
        else if (av > bv) result = 1;
      }
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [data, sortConfig, columns]);

  const totalPages = isServerPaginated
    ? Math.max(1, Math.ceil((totalCount as number) / pageSize))
    : Math.max(1, Math.ceil(data.length / pageSize));

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const displayData = isServerPaginated
    ? sortedData
    : sortedData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load data" description={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} variant={"no_data"} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label={caption}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                const ariaSort = isSorted
                  ? sortConfig.direction === "asc"
                    ? ("ascending" as const)
                    : ("descending" as const)
                  : undefined;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? ariaSort : undefined}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400",
                      col.sortable &&
                        "cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-300",
                      col.headerClassName,
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && isSorted && (
                        <span aria-hidden="true">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayData.map((item) => (
              <tr
                key={rowKey(item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                aria-label={onRowClick ? `Open details` : undefined}
                className={cn(
                  "border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50",
                  onRowClick &&
                    "cursor-pointer focus:outline-none focus-visible:bg-neutral-100 dark:focus-visible:bg-neutral-800"
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => {
                  if (!onRowClick) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3", col.cellClassName)}>
                    {col.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <span className="text-xs text-neutral-500">
            Page {safePage} of {totalPages}
            {isServerPaginated && ` · ${totalCount} total`}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => onPageChange?.(safePage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange?.(safePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}