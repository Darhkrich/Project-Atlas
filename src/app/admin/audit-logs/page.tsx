/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/audit-logs/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import {
  AuditLogToolbar,
  type AuditFilterValues,
} from "@/components/admin/audit-logs/audit-log-toolbar";
import { AuditLogRow } from "@/components/admin/audit-logs/audit-log-row";
import { AuditLogDetailDrawer } from "@/components/admin/audit-logs/audit-log-detail-drawer";
import { AuditLogEmptyState } from "@/components/admin/audit-logs/audit-log-empty-state";
import { AuditLogPagination } from "@/components/admin/audit-logs/audit-log-paginations";
import { mockAuditLogs } from "@/lib/admin/mock/audit-logs";
import { mockAdminUsers } from "@/lib/admin/mock/admin-users";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { auditLogsToCsv } from "@/lib/admin/audit-logs/csv-export";
import {
  TIME_RANGE_MS,
  type AuditTimeRange,
} from "@/lib/admin/audit-logs/constants";
import type { AuditLogEntry } from "@/lib/admin/types/audit-log";

type AuditUrlFilterValues = AuditFilterValues & Record<string, string>;

const DEFAULT_FILTERS: AuditUrlFilterValues = {
  q: "",
  admin: "",
  action: "",
  resourceKind: "",
  section: "",
  result: "",
  range: "7d",
  resourceId: "",
  page: "1",
};

const PAGE_SIZE = 10;
const STORAGE_KEY = "atlas-audit-log-views-v2";

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditLogsSkeleton />}>
      <AuditLogsPageInner />
    </Suspense>
  );
}

function AuditLogsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-8 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function AuditLogsPageInner() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<AuditFilterValues>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLogs(mockAuditLogs);
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedViews));
    } catch {
      // Storage full or unavailable. The UI keeps working in-memory.
    }
  }, [savedViews, viewsLoaded]);

  const filtered = useMemo(() => {
    const cutoff =
      TIME_RANGE_MS[filters.range as AuditTimeRange] === null
        ? 0
        : Date.now() -
          (TIME_RANGE_MS[filters.range as AuditTimeRange] ?? 0);

    const q = filters.q.trim().toLowerCase();

    return logs.filter((entry) => {
      if (cutoff) {
        const t = new Date(entry.timestamp).getTime();
        if (t < cutoff) return false;
      }

      if (filters.admin && entry.admin !== filters.admin) return false;
      if (filters.action && entry.action !== filters.action) return false;
      if (
        filters.resourceKind &&
        entry.resourceKind !== filters.resourceKind
      ) {
        return false;
      }
      if (filters.section && entry.section !== filters.section) return false;
      if (filters.result && entry.result !== filters.result) return false;
      if (filters.resourceId && entry.resourceId !== filters.resourceId) {
        return false;
      }

      if (q) {
        const haystack = [
          entry.admin,
          entry.actorName ?? "",
          entry.resource,
          entry.resourceId,
          entry.ip,
          entry.previousValue ?? "",
          entry.newValue ?? "",
          entry.reason ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [logs, filters]);

  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const filteredIds = useMemo(() => paginated.map((e) => e.id), [paginated]);

  useEffect(() => {
    if (page > totalPages) {
      setFilters({ page: "1" });
    }
  }, [page, totalPages, setFilters]);

  useEffect(() => {
    if (focusedId && !filteredIds.includes(focusedId)) {
      setFocusedId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-audit-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled: selectedId === null,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selected = useMemo(
    () => logs.find((l) => l.id === selectedId) ?? null,
    [logs, selectedId]
  );

  const admins = useMemo(
    () =>
      mockAdminUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      })),
    []
  );

  const failureCount = useMemo(
    () => filtered.filter((e) => e.result === "failure").length,
    [filtered]
  );

  const handleSaveView = (name: string) => {
    const filtersSnapshot: Record<string, string> = {};
    if (filters.q) filtersSnapshot.q = filters.q;
    if (filters.admin) filtersSnapshot.admin = filters.admin;
    if (filters.action) filtersSnapshot.action = filters.action;
    if (filters.resourceKind)
      filtersSnapshot.resourceKind = filters.resourceKind;
    if (filters.section) filtersSnapshot.section = filters.section;
    if (filters.result) filtersSnapshot.result = filters.result;
    if (filters.range) filtersSnapshot.range = filters.range;
    setSavedViews((prev) => [
      ...prev,
      { name, filters: filtersSnapshot },
    ]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({
      ...DEFAULT_FILTERS,
      ...view.filters,
      page: "1",
    });
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = auditLogsToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`atlas-audit-logs-${stamp}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit logs"
        description="Immutable record of security-relevant admin actions."
        meta={
          <>
            <span>
              {logs.length.toLocaleString("en-GH")} total
            </span>
            <span aria-hidden="true">·</span>
            <span>{filtered.length.toLocaleString("en-GH")} matching</span>
            {failureCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-danger-700 dark:text-danger-300">
                  {failureCount} failure{failureCount === 1 ? "" : "s"}
                </span>
              </>
            )}
          </>
        }
        actions={
          <ExportMenu onExport={handleExport} formats={["csv"]} />
        }
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <AuditLogToolbar
        values={filters}
        admins={admins}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      <p
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        Showing {paginated.length} of{" "}
        {filtered.length.toLocaleString("en-GH")} matching entries
      </p>

      {loading ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Loading audit logs"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <AuditLogEmptyState
          hasActiveFilters={hasActive}
          onClearFilters={clearFilters}
        />
      ) : (
        <ul role="list" className="space-y-2">
          {paginated.map((entry) => (
            <AuditLogRow
              key={entry.id}
              entry={entry}
              focused={focusedId === entry.id}
              onOpen={setSelectedId}
              onFocus={setFocusedId}
            />
          ))}
        </ul>
      )}

      <AuditLogPagination
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={filtered.length}
        onPageChange={(next) => setFilters({ page: String(next) })}
      />

      <AuditLogDetailDrawer
        entry={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}