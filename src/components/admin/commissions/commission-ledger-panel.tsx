/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import { ResellerCommissionSummaryCards } from "@/components/admin/commissions/commission-summary-cards";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/admin/formatters";
import { Can } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import {
  COMMISSION_SORT_LABELS,
  COMMISSION_STATUS_FILTERS,
  SERVICE_CATEGORY_FILTERS,
  type CommissionFilters,
  type CommissionSortKey,
} from "@/lib/admin/commissions/commission-constants";
import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_VARIANT,
  SERVICE_CATEGORY_LABEL,
} from "@/lib/admin/commissions/commission-labels";
import type {
  CommissionRow,
  CommissionSummary,
} from "@/lib/admin/commissions/commission-projection";
import type { ResellerCommission } from "@/lib/admin/types/commission";

type ColumnKey =
  | "order"
  | "service"
  | "category"
  | "tier"
  | "rate"
  | "commission"
  | "atlasCut"
  | "resellerCut";

const DEFAULT_COLUMNS: ColumnKey[] = [
  "service",
  "category",
  "tier",
  "commission",
];

const COLUMN_LABEL: Record<ColumnKey, string> = {
  order: "Order",
  service: "Service",
  category: "Category",
  tier: "Tier",
  rate: "Extra cut",
  commission: "Commission",
  atlasCut: "Atlas cut",
  resellerCut: "Reseller cut",
};

const COLUMNS_STORAGE_KEY = "atlas-commissions-columns-v1";
const VIEWS_STORAGE_KEY = "atlas-commissions-views-v1";
const PAGE_SIZE = 20;

interface Props {
  rows: CommissionRow[];
  summary: CommissionSummary;
  loading: boolean;
  filters: CommissionFilters;
  setFilters: (patch: Partial<CommissionFilters>) => void;
  clearFilters: () => void;
  hasActive: boolean;
  onViewCommission: (c: ResellerCommission) => void;
  onBulkCancel: (ids: string[]) => void;
}

export function CommissionLedgerPanel({
  rows,
  summary,
  loading,
  filters,
  setFilters,
  clearFilters,
  hasActive,
  onViewCommission,
  onBulkCancel,
}: Props) {
  const debouncedSearch = useDebouncedValue(filters.q, 300);
  const searchRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] =
    useState<ColumnKey[]>(DEFAULT_COLUMNS);
  const [columnsLoaded, setColumnsLoaded] = useState(false);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ColumnKey[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((k) =>
            (Object.keys(COLUMN_LABEL) as ColumnKey[]).includes(k)
          );
          if (valid.length > 0) setVisibleColumns(valid);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setColumnsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!columnsLoaded) return;
    try {
      window.localStorage.setItem(
        COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleColumns)
      );
    } catch {
      /* ignore */
    }
  }, [visibleColumns, columnsLoaded]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEWS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedView[];
        if (Array.isArray(parsed)) setSavedViews(parsed);
      }
    } catch {
      setSavedViews([]);
    } finally {
      setViewsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!viewsLoaded) return;
    try {
      window.localStorage.setItem(
        VIEWS_STORAGE_KEY,
        JSON.stringify(savedViews)
      );
    } catch {
      /* ignore */
    }
  }, [savedViews, viewsLoaded]);

  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
  }, [filters.status, filters.category, filters.sort, filters.tab]);

  const filtered = useMemo(() => {
    let list = rows;
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const hay = (
          r.resellerName +
          " " +
          r.orderId +
          " " +
          r.id +
          " " +
          r.service
        ).toLowerCase();
        return hay.includes(q);
      });
    }
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.category) {
      list = list.filter((r) => r.serviceCategory === filters.category);
    }
    if (filters.sort === "oldest") {
      list = [...list].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (filters.sort === "commission_largest") {
      list = [...list].sort((a, b) => b.totalCommission - a.totalCommission);
    } else if (filters.sort === "commission_smallest") {
      list = [...list].sort((a, b) => a.totalCommission - b.totalCommission);
    }
    return list;
  }, [rows, debouncedSearch, filters.status, filters.category, filters.sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.status) snapshot.status = filters.status;
    if (filters.category) snapshot.category = filters.category;
    if (filters.sort && filters.sort !== "newest") snapshot.sort = filters.sort;
    setSavedViews((prev) => [...prev, { name, filters: snapshot }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({
      q: view.filters.q ?? "",
      status: (view.filters.status as CommissionFilters["status"]) ?? "",
      category:
        (view.filters.category as CommissionFilters["category"]) ?? "",
      sort: (view.filters.sort as CommissionSortKey) ?? "newest",
      page: "1",
    });
  };

const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const columns = useMemo<Column<CommissionRow>[]>(() => {
    const all: Column<CommissionRow>[] = [
      {
        key: "__select__",
        header: "",
        cell: (r) => {
          const cancellable = r.status === "pending";
          return (
            <input
              type="checkbox"
              aria-label={"Select " + r.id}
              disabled={!cancellable}
              checked={selectedIds.includes(r.id)}
              onChange={() => toggleSelect(r.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 disabled:opacity-40"
            />
          );
        },
      },
      {
        key: "id",
        header: "Commission",
        cell: (r) => (
          <div className="min-w-0">
            <div className="truncate font-mono text-xs">{r.id}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {r.resellerName}
            </div>
          </div>
        ),
      },
      {
        key: "order",
        header: COLUMN_LABEL.order,
        cell: (r) => <span className="font-mono text-xs">{r.orderId}</span>,
      },
      {
        key: "service",
        header: COLUMN_LABEL.service,
        cell: (r) => <span className="text-sm">{r.service}</span>,
      },
      {
        key: "category",
        header: COLUMN_LABEL.category,
        cell: (r) => (
          <Badge variant="neutral" size="sm">
            {r.serviceCategoryLabel}
          </Badge>
        ),
      },
      {
        key: "tier",
        header: COLUMN_LABEL.tier,
        cell: (r) =>
          r.tierName ? (
            <Badge variant="brand" size="sm">
              {r.tierName}
            </Badge>
          ) : (
            <span className="text-xs text-neutral-400">None</span>
          ),
      },
      {
        key: "rate",
        header: COLUMN_LABEL.rate,
        cell: (r) =>
          r.effectiveExtraCutPercent !== null ? (
            <span className="text-xs">
              Atlas {r.effectiveExtraCutPercent}% / Reseller{" "}
              {100 - r.effectiveExtraCutPercent}%
            </span>
          ) : (
            <span className="text-xs text-neutral-400">No extra</span>
          ),
      },
      {
        key: "commission",
        header: COLUMN_LABEL.commission,
        cell: (r) => (
          <span className="font-semibold">
            {formatCurrency(r.totalCommission)}
          </span>
        ),
      },
      {
        key: "atlasCut",
        header: COLUMN_LABEL.atlasCut,
        cell: (r) => (
          <span className="text-xs">{formatCurrency(r.atlasExtraCut)}</span>
        ),
      },
      {
        key: "resellerCut",
        header: COLUMN_LABEL.resellerCut,
        cell: (r) => (
          <span className="text-xs">{formatCurrency(r.resellerExtraCut)}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <Badge variant={COMMISSION_STATUS_VARIANT[r.status]}>
              {COMMISSION_STATUS_LABEL[r.status]}
            </Badge>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {r.statusReason}
            </span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (r) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewCommission(r.raw);
            }}
            aria-label={"View " + r.id}
          >
            View
          </Button>
        ),
      },
    ];
    return all.filter((c) => {
      if (c.key === "__select__") return true;
      if (c.key === "id") return true;
      if (c.key === "status") return true;
      if (c.key === "actions") return true;
      return visibleColumns.includes(c.key as ColumnKey);
    });
  }, [visibleColumns, selectedIds, onViewCommission]);

  const bulkActive = selectedIds.length > 0;

  return (
    <div className="space-y-4">
      <ResellerCommissionSummaryCards summary={summary} />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <label
            htmlFor="commission-search"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Search
          </label>
          <Input
            id="commission-search"
            ref={searchRef}
            aria-label="Search commissions"
            placeholder="Reseller, order, commission ID"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value, page: "1" })}
          />
        </div>
        <div>
          <label
            htmlFor="commission-status"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Status
          </label>
          <select
            id="commission-status"
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) =>
              setFilters({
                status: e.target.value as CommissionFilters["status"],
                page: "1",
              })
            }
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="">All statuses</option>
            {COMMISSION_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {COMMISSION_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="commission-category"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Category
          </label>
          <select
            id="commission-category"
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              setFilters({
                category: e.target.value as CommissionFilters["category"],
                page: "1",
              })
            }
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="">All categories</option>
            {SERVICE_CATEGORY_FILTERS.map((c) => (
              <option key={c} value={c}>
                {SERVICE_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="commission-sort"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Sort
          </label>
          <select
            id="commission-sort"
            aria-label="Sort commissions"
            value={filters.sort}
            onChange={(e) =>
              setFilters({
                sort: e.target.value as CommissionSortKey,
                page: "1",
              })
            }
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {(Object.keys(COMMISSION_SORT_LABELS) as CommissionSortKey[]).map(
              (k) => (
                <option key={k} value={k}>
                  {COMMISSION_SORT_LABELS[k]}
                </option>
              )
            )}
          </select>
        </div>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Columns:
        </span>
        {(Object.keys(COLUMN_LABEL) as ColumnKey[]).map((key) => {
          const isVisible = visibleColumns.includes(key);
          return (
            <label key={key} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                aria-label={"Toggle " + COLUMN_LABEL[key] + " column"}
                checked={isVisible}
                onChange={() => toggleColumn(key)}
                className="h-3 w-3"
              />
              {COLUMN_LABEL[key]}
            </label>
          );
        })}
      </div>

      {bulkActive ? (
        <div
          role="region"
          aria-label="Bulk commission actions"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
        >
          <span
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
            aria-live="polite"
          >
            {selectedIds.length} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Can permission={PERMISSIONS.COMMISSIONS_MANAGE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkCancel(selectedIds)}
              >
                Cancel commissions
              </Button>
            </Can>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length} commission{filtered.length === 1 ? "" : "s"}
          {hasActive ? " (filtered)" : ""}
        </p>
      )}

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading commissions"
          className="space-y-2"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No commissions match these filters"
              description="Try a wider period or clear the filters."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no_data"
              title="No commissions yet"
              description="Commissions appear here as reseller orders settle."
            />
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginated}
          isLoading={false}
          rowKey={(r) => r.id}
          onRowClick={(r) => onViewCommission(r.raw)}
          rowAriaLabel={(r) => "Open commission " + r.id}
          emptyMessage="No commissions found."
          caption="Reseller commissions"
          pageSize={PAGE_SIZE}
          currentPage={safePage}
          totalCount={filtered.length}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}