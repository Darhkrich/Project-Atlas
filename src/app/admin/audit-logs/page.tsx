/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/audit-logs/page.tsx
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import {
  AuditLogTabs,
  type AuditTab,
} from "@/components/admin/audit-logs/audit-log-tabs";
import {
  AuditLogToolbar,
  type AuditFilterValues,
} from "@/components/admin/audit-logs/audit-log-toolbar";
import { AuditLogRow } from "@/components/admin/audit-logs/audit-log-row";
import { AuditLogDetailDrawer } from "@/components/admin/audit-logs/audit-log-detail-drawer";
import { AuditLogEmptyState } from "@/components/admin/audit-logs/audit-log-empty-state";
import { AuditLogPagination } from "@/components/admin/audit-logs/audit-log-paginations";
import {
  FinancialAuditToolbar,
  type FinancialAuditFilterValues,
} from "@/components/admin/audit-logs/financial-audit-toolbar";
import { FinancialAuditRow } from "@/components/admin/audit-logs/financial-audit-row";
import { FinancialAuditDetailDrawer } from "@/components/admin/audit-logs/financial-audit-detail-drawer";
import { mockAuditLogs } from "@/lib/admin/mock/audit-logs";
import { mockAdminUsers } from "@/lib/admin/mock/admin-users";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useAuditEntries } from "@/lib/admin/hooks/use-audit-entries";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { auditLogsToCsv } from "@/lib/admin/audit-logs/csv-export";
import {
  projectFinancialRows,
  type FinancialAuditRow as FinancialRow,
} from "@/lib/admin/audit-logs/financial-projection";
import {
  TIME_RANGE_MS,
  type AuditTimeRange,
} from "@/lib/admin/audit-logs/constants";
import type { AuditLogEntry } from "@/lib/admin/types/audit-log";

const PAGE_SIZE = 10;
const STORAGE_KEY = "atlas-audit-log-views-v3";

type SecurityFilters = AuditFilterValues & Record<string, string>;
type FinancialFilters = FinancialAuditFilterValues & Record<string, string>;

const DEFAULT_SECURITY_FILTERS: SecurityFilters = {
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

const DEFAULT_FINANCIAL_FILTERS: FinancialFilters = {
  q: "",
  actor: "",
  action: "",
  resourceType: "",
  section: "",
  range: "7d",
  resourceId: "",
  page: "1",
};

interface SavedViewWithTab extends SavedView {
  tab?: AuditTab;
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab: AuditTab =
    searchParams.get("tab") === "financial" ? "financial" : "security";

  const [savedViews, setSavedViews] = useState<SavedViewWithTab[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedViewWithTab[];
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
        STORAGE_KEY,
        JSON.stringify(savedViews)
      );
    } catch {
      // Storage full or unavailable. The UI keeps working in-memory.
    }
  }, [savedViews, viewsLoaded]);

  const handleTabChange = useCallback(
    (next: AuditTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "security") params.delete("tab");
      else params.set("tab", next);
      params.delete("page");
      const query = params.toString();
      router.replace(query ? pathname + "?" + query : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const handleSaveView = useCallback(
    (name: string, filters: Record<string, string>) => {
      const snapshot: SavedViewWithTab = {
        name,
        filters,
        tab: activeTab,
      };
      setSavedViews((prev) => [...prev, snapshot]);
    },
    [activeTab]
  );

  const handleLoadView = useCallback(
    (view: SavedView) => {
      const loadedTab: AuditTab =
        (view as SavedViewWithTab).tab === "financial"
          ? "financial"
          : "security";
      const params = new URLSearchParams();
      if (loadedTab === "financial") params.set("tab", "financial");
      for (const [key, value] of Object.entries(view.filters)) {
        if (!value) continue;
        if (key === "tab") continue;
        if (key === "page") {
          params.set("page", "1");
          continue;
        }
        params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? pathname + "?" + query : pathname, {
        scroll: false,
      });
    },
    [pathname, router]
  );

  const handleDeleteView = useCallback((name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit logs"
        description="Immutable record of admin actions. Security actions and financial actions are recorded on separate streams."
      />

      <AuditLogTabs
        value={activeTab}
        onChange={handleTabChange}
        securityCount={mockAuditLogs.length}
        financialCount={0}
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={(name) => handleSaveView(name, {})}
      />

      {activeTab === "security" ? (
        <SecurityAuditPanel onSaveView={handleSaveView} />
      ) : (
        <FinancialAuditPanel onSaveView={handleSaveView} />
      )}
    </div>
  );
}

/* -------------------------- Security panel --------------------------- */

function SecurityAuditPanel({
  onSaveView,
}: {
  onSaveView: (name: string, filters: Record<string, string>) => void;
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<SecurityFilters>(DEFAULT_SECURITY_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLogs(mockAuditLogs);
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

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

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = auditLogsToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv("atlas-audit-logs-security-" + stamp + ".csv", csv);
  };

  const handleSave = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.admin) snapshot.admin = filters.admin;
    if (filters.action) snapshot.action = filters.action;
    if (filters.resourceKind) snapshot.resourceKind = filters.resourceKind;
    if (filters.section) snapshot.section = filters.section;
    if (filters.result) snapshot.result = filters.result;
    if (filters.range) snapshot.range = filters.range;
    onSaveView(name, snapshot);
  };

  return (
    <div
      role="tabpanel"
      id="audit-panel-security"
      aria-labelledby="audit-tab-security"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length.toLocaleString("en-GH")} matching entr
          {filtered.length === 1 ? "y" : "ies"}
        </p>
        <ExportMenu onExport={handleExport} formats={["csv"]} />
      </div>

      <AuditLogToolbar
        values={filters}
        admins={admins}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSave("Untitled view")}
        >
          Save current filters
        </Button>
      </div>

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

/* -------------------------- Financial panel -------------------------- */

function FinancialAuditPanel({
  onSaveView,
}: {
  onSaveView: (name: string, filters: Record<string, string>) => void;
}) {
  const domainEntries = useAuditEntries();
  const rows: FinancialRow[] = useMemo(
    () => projectFinancialRows(domainEntries),
    [domainEntries]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<FinancialFilters>(DEFAULT_FINANCIAL_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const cutoff =
      TIME_RANGE_MS[filters.range as AuditTimeRange] === null
        ? 0
        : Date.now() -
          (TIME_RANGE_MS[filters.range as AuditTimeRange] ?? 0);

    const q = filters.q.trim().toLowerCase();

    return rows.filter((row) => {
      if (cutoff) {
        const t = new Date(row.timestamp).getTime();
        if (t < cutoff) return false;
      }

      if (filters.actor && row.actorEmail !== filters.actor) return false;
      if (filters.action && row.action !== filters.action) return false;
      if (
        filters.resourceType &&
        row.resourceType !== filters.resourceType
      ) {
        return false;
      }
      if (filters.section && row.section !== filters.section) return false;
      if (filters.resourceId && row.resourceId !== filters.resourceId) {
        return false;
      }

      if (q) {
        const haystack = [
          row.actorName,
          row.actorEmail,
          row.action,
          row.actionLabel,
          row.resourceType,
          row.resourceLabel,
          row.resourceId,
          row.metadata ? JSON.stringify(row.metadata) : "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, filters]);

  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const filteredIds = useMemo(() => paginated.map((r) => r.id), [paginated]);

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

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled: selectedId === null,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const actors = useMemo(
    () =>
      mockAdminUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      })),
    []
  );

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const header = [
      "id",
      "timestamp",
      "actorName",
      "actorEmail",
      "action",
      "resourceType",
      "resourceId",
      "section",
    ];
    const body = filtered.map((row) => [
      row.id,
      row.timestamp,
      row.actorName,
      row.actorEmail,
      row.action,
      row.resourceType,
      row.resourceId,
      row.section ?? "",
    ]);
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const csv = [header, ...body]
      .map((r) => r.map(escape).join(","))
      .join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv("atlas-audit-logs-financial-" + stamp + ".csv", csv);
  };

  const handleSave = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.actor) snapshot.actor = filters.actor;
    if (filters.action) snapshot.action = filters.action;
    if (filters.resourceType) snapshot.resourceType = filters.resourceType;
    if (filters.section) snapshot.section = filters.section;
    if (filters.range) snapshot.range = filters.range;
    onSaveView(name, snapshot);
  };

  return (
    <div
      role="tabpanel"
      id="audit-panel-financial"
      aria-labelledby="audit-tab-financial"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length.toLocaleString("en-GH")} matching entr
          {filtered.length === 1 ? "y" : "ies"}
        </p>
        <ExportMenu onExport={handleExport} formats={["csv"]} />
      </div>

      <FinancialAuditToolbar
        values={filters}
        actors={actors}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSave("Untitled view")}
        >
          Save current filters
        </Button>
      </div>

      {paginated.length === 0 ? (
        <AuditLogEmptyState
          hasActiveFilters={hasActive}
          onClearFilters={clearFilters}
        />
      ) : (
        <ul role="list" className="space-y-2">
          {paginated.map((row) => (
            <FinancialAuditRow
              key={row.id}
              row={row}
              focused={focusedId === row.id}
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

      <FinancialAuditDetailDrawer
        row={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}