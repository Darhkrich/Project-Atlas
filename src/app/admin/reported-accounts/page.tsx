/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/admin/reported-accounts/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import { ReportSummaryCards } from "@/components/admin/reported-accounts/report-summary-cards";
import {
  ReportFilters,
  type ReportFilterValues,
} from "@/components/admin/reported-accounts/report-filters";
import { ReportCard } from "@/components/admin/reported-accounts/report-card";
import {
  ResolveReportModal,
  type ResolveReportPayload,
} from "@/components/admin/reported-accounts/report-action-modals";
import { StorefrontUserDetailDrawer } from "@/components/admin/storefront-users/storefront-user-detail-drawer";
import { MerchantStorefrontUserDetailDrawer } from "@/components/admin/merchant-storefront-users/merchant-storefront-user-detail-drawer";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { mockStorefrontUsers } from "@/lib/admin/mock/storefront-users";
import { mockStorefrontUserOrders } from "@/lib/admin/mock/storefront-user-orders";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  CATEGORY_LABEL,
  PAGE_SIZE,
  type SortKey,
} from "@/lib/admin/reported-accounts/constants";
import {
  type ReportAction,
} from "@/lib/admin/reported-accounts/actions";
import {
  aggregateReports,
  buildReportAuditEntry,
  describeAction,
  slaTone,
  type AggregatedReport,
} from "@/lib/admin/reported-accounts/helpers";
import { reportsToCsv } from "@/lib/admin/reported-accounts/csv-export";
import { appendActivity, appendAuditTrail } from "@/lib/admin/storefront-users/helpers";
import type {
  StorefrontUser,
  StorefrontUserSegment,
} from "@/lib/admin/types/storefront-user";

const VIEWS_KEY = "atlas-reported-accounts-views-v2";

type ReportUrlFilters = ReportFilterValues;

const DEFAULT_FILTERS: ReportUrlFilters = {
  q: "",
  status: "",
  category: "",
  reporterType: "",
  sort: "newest",
  page: "1",
  pageSize: String(PAGE_SIZE),
};

const SYSTEM_ADMIN = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
  role: "super_admin" as const,
  extraPermissions: [],
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

type ResolveContext = {
  report: AggregatedReport;
  action: ReportAction;
};

export default function ReportedAccountsPage() {
  return (
    <Suspense fallback={<ReportedAccountsSkeleton />}>
      <ReportedAccountsPageInner />
    </Suspense>
  );
}

function ReportedAccountsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function ReportedAccountsPageInner() {
  const admin = useCurrentAdmin();
  const now = useNow();

  const [storefrontUsers, setStorefrontUsers] = useState<StorefrontUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [resolving, setResolving] = useState<ResolveContext | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<ReportUrlFilters>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStorefrontUsers(mockStorefrontUsers);
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEWS_KEY);
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
      window.localStorage.setItem(VIEWS_KEY, JSON.stringify(savedViews));
    } catch {
      /* ignore */
    }
  }, [savedViews, viewsLoaded]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const reports = useMemo(
    () => aggregateReports(storefrontUsers),
    [storefrontUsers]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = reports;

    if (q) {
      list = list.filter(
        (r) =>
          r.accountName.toLowerCase().includes(q) ||
          r.accountEmail.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.category) {
      list = list.filter((r) => r.category === filters.category);
    }
    if (filters.reporterType) {
      list = list.filter((r) => r.reporterType === filters.reporterType);
    }

    const sorted = [...list];
    const key = filters.sort as SortKey;
    const nowMs = now ?? Date.now();
    sorted.sort((a, b) => {
      switch (key) {
        case "oldest":
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        case "reporter":
          return a.reporterName.localeCompare(b.reporterName);
        case "account":
          return a.accountName.localeCompare(b.accountName);
        case "sla": {
          const aPending = a.status === "pending" ? 0 : 1;
          const bPending = b.status === "pending" ? 0 : 1;
          if (aPending !== bPending) return aPending - bPending;
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
        case "newest":
        default:
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      }
    });
    return sorted;
  }, [reports, debouncedSearch, filters, now]);

  const pageSize = Math.max(5, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const paginatedIds = useMemo(() => paginated.map((r) => r.id), [paginated]);

  useEffect(() => {
    if (focusedId && !paginatedIds.includes(focusedId)) {
      setFocusedId(paginatedIds[0] ?? null);
    }
  }, [paginatedIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-report-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: paginatedIds,
    focusedId,
    enabled: selectedAccountId === null && resolving === null,
    onFocusChange: setFocusedId,
    onOpen: (id) => {
      const report = reports.find((r) => r.id === id);
      if (report) setSelectedAccountId(report.accountId);
    },
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const summaryData = useMemo(() => {
    const nowMs = now ?? Date.now();
    const pending = reports.filter((r) => r.status === "pending");
    const pendingPastSla = pending.filter(
      (r) => slaTone(r, nowMs) === "danger"
    ).length;

    return {
      total: reports.length,
      pending: pending.length,
      pendingPastSla,
      actionTaken: reports.filter((r) => r.status === "action_taken").length,
      dismissed: reports.filter((r) => r.status === "dismissed").length,
    };
  }, [reports, now]);

  const selectedUser = useMemo(
    () => storefrontUsers.find((u) => u.id === selectedAccountId) ?? null,
    [storefrontUsers, selectedAccountId]
  );

  const selectedUserStorefront = useMemo(
    () =>
      selectedUser
        ? mockStorefronts.find((s) => s.id === selectedUser.storefrontId)
        : undefined,
    [selectedUser]
  );

  const selectedUserOrders = useMemo(
    () =>
      selectedUser
        ? mockStorefrontUserOrders.filter(
            (o) => o.storefrontUserId === selectedUser.id
          )
        : [],
    [selectedUser]
  );

  /* ------------------------------ Update helpers -------------------- */

  const updateUser = (
    id: string,
    patch: (u: StorefrontUser) => StorefrontUser
  ) => {
    setStorefrontUsers((prev) =>
      prev.map((u) => (u.id === id ? patch(u) : u))
    );
  };

  const applyAccountAudit = (
    user: StorefrontUser,
    action: string
  ): StorefrontUser => {
    const entry = buildReportAuditEntry({
      admin: admin ?? SYSTEM_ADMIN,
      action,
    });
    return { ...user, auditTrail: appendAuditTrail(user, entry) };
  };

  /* ------------------------------ Resolve report -------------------- */

  const resolutionNoteFor = (payload: ResolveReportPayload): string => {
    switch (payload.action) {
      case "warn":
        return `Warning sent via ${payload.channel}: ${payload.message}`;
      case "suspend":
        return `Suspended: ${payload.reason}`;
      case "issue_refund":
        return `Refund GHS ${payload.amount.toFixed(2)}: ${payload.reason}`;
      case "escalate":
        return `Escalated to ${payload.team}: ${payload.note}`;
      case "dismiss":
        return `Dismissed: ${payload.reason}`;
    }
  };

  const handleResolveReport = (payload: ResolveReportPayload) => {
    if (!resolving) return;
    const targetReportId = resolving.report.id;
    const targetAccountId = resolving.report.accountId;
    const category = resolving.report.category;
    const adminActor = admin ?? SYSTEM_ADMIN;
    const nowIso = new Date().toISOString();
    const note = resolutionNoteFor(payload);

    const amountForDisplay =
      payload.action === "issue_refund" ? payload.amount : undefined;

    const actionTakenText = describeAction(payload.action, {
      category,
      amount: amountForDisplay,
    });

    updateUser(targetAccountId, (user) => {
      const updatedReports = user.reports.map((r) => {
        if (r.id !== targetReportId) return r;
        return {
          ...r,
          status:
            payload.action === "dismiss"
              ? ("dismissed" as const)
              : ("action_taken" as const),
          actionTaken: actionTakenText,
          actionTimestamp: nowIso,
          adminNote:
            payload.action === "dismiss"
              ? payload.reason
              : payload.action === "suspend"
              ? payload.reason
              : payload.action === "issue_refund"
              ? payload.reason
              : payload.action === "escalate"
              ? payload.note
              : payload.action === "warn"
              ? payload.message
              : undefined,
          resolvedById: adminActor.id,
          resolvedByName: adminActor.name,
          resolvedAt: nowIso,
        };
      });

      const nextStatus: StorefrontUser["status"] =
        payload.action === "suspend" ? "suspended" : user.status;

      let next: StorefrontUser = {
        ...user,
        status: nextStatus,
        reports: updatedReports,
      };

      next = {
        ...next,
        activityLog: appendActivity(
          next,
          `Report ${targetReportId} — ${actionTakenText}`
        ),
      };

      return applyAccountAudit(
        next,
        `Report ${targetReportId} resolved: ${note}`
      );
    });

    setResolving(null);
    setToast({
      kind: "success",
      text: `${actionTakenText} for report ${targetReportId}.`,
    });
  };

  /* ------------------------------ Drawer actions -------------------- */

  const handleAddTag = (id: string, tag: string) => {
    updateUser(id, (u) => {
      if (u.tags.includes(tag)) return u;
      const next: StorefrontUser = { ...u, tags: [...u.tags, tag] };
      return applyAccountAudit(next, `Added tag "${tag}"`);
    });
  };

  const handleRemoveTag = (id: string, tag: string) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = {
        ...u,
        tags: u.tags.filter((t) => t !== tag),
      };
      return applyAccountAudit(next, `Removed tag "${tag}"`);
    });
  };

  const handleAddToSegment = (
    id: string,
    segment: StorefrontUserSegment,
    note: string
  ) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = { ...u, segment };
      const withActivity: StorefrontUser = {
        ...next,
        activityLog: appendActivity(next, `Segment changed to ${segment}`),
      };
      return applyAccountAudit(
        withActivity,
        `Segment: ${u.segment ?? "none"} → ${segment}${
          note ? `. ${note}` : ""
        }`
      );
    });
  };

  const handleDrawerSuspend = (id: string, reason: string) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = { ...u, status: "suspended" };
      const withActivity: StorefrontUser = {
        ...next,
        activityLog: appendActivity(next, `Suspended: ${reason}`),
      };
      return applyAccountAudit(withActivity, `Suspended: ${reason}`);
    });
    setSelectedAccountId(null);
    setToast({ kind: "success", text: "Account suspended." });
  };

  const handleReactivate = (id: string) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = { ...u, status: "active" };
      return applyAccountAudit(next, "Reactivated");
    });
    setToast({ kind: "success", text: "Account reactivated." });
  };

  const handleSendNotification = (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const target = storefrontUsers.find((u) => u.id === id);
    if (!target) return;
    updateUser(id, (u) => {
      const next: StorefrontUser = {
        ...u,
        activityLog: appendActivity(
          u,
          `Notification sent via ${channel.toUpperCase()}`
        ),
      };
      return applyAccountAudit(
        next,
        `Notification sent to ${target.email} via ${channel.toUpperCase()}`
      );
    });
  };

  const handleSendCoupon = (
    id: string,
    code: string,
    amount: number,
    reason: string
  ) => {
    const target = storefrontUsers.find((u) => u.id === id);
    if (!target) return;
    updateUser(id, (u) => {
      const next: StorefrontUser = {
        ...u,
        activityLog: appendActivity(
          u,
          `Coupon ${code} (GHS ${amount.toFixed(2)}) sent`
        ),
      };
      return applyAccountAudit(
        next,
        `Coupon ${code} (GHS ${amount.toFixed(2)}) issued. ${reason}`
      );
    });
  };

  const handleRevealPII = (id: string) => {
    updateUser(id, (u) => applyAccountAudit(u, "Revealed contact details"));
  };

  const handleResetPassword = (id: string) => {
    const target = storefrontUsers.find((u) => u.id === id);
    if (!target) return;
    updateUser(id, (u) =>
      applyAccountAudit(u, `Password reset link sent to ${target.email}`)
    );
  };

  /* ------------------------------ Export ---------------------------- */

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = reportsToCsv(filtered);
    downloadCsv(
      `atlas-reported-accounts-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  /* ---------------------------- Saved views ------------------------ */

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.status) snapshot.status = filters.status;
    if (filters.category) snapshot.category = filters.category;
    if (filters.reporterType) snapshot.reporterType = filters.reporterType;
    if (filters.sort && filters.sort !== "newest") snapshot.sort = filters.sort;
    setSavedViews((prev) => [...prev, { name, filters: snapshot }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({ ...DEFAULT_FILTERS, ...view.filters, page: "1" });
  };

  const handleDeleteView = (view: SavedView) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== view.name));
  };

  const headerMeta = (
    <>
      <span>{summaryData.total} reports</span>
      <span aria-hidden="true">·</span>
      <span>{summaryData.pending} pending</span>
      {summaryData.pendingPastSla > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summaryData.pendingPastSla} past SLA
          </span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{summaryData.actionTaken} action taken</span>
    </>
  );

  const filterValues: ReportFilterValues = filters;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reported accounts"
        description="Review and act on reports filed by resellers and merchants against their storefront customers."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <ReportSummaryCards
        data={summaryData}
        activeStatus={filters.status}
        onFilterAll={() =>
          setFilters({ status: "", category: "", page: "1" })
        }
        onFilterPending={() =>
          setFilters({ status: "pending", category: "", page: "1" })
        }
        onFilterActionTaken={() =>
          setFilters({ status: "action_taken", category: "", page: "1" })
        }
        onFilterDismissed={() =>
          setFilters({ status: "dismissed", category: "", page: "1" })
        }
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <ReportFilters
        value={filterValues}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      <p
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        Showing {paginated.length} of {filtered.length} report
        {filtered.length === 1 ? "" : "s"}
        {hasActive ? " (filtered)" : ""}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Rows per page
          </span>
          <select
            aria-label="Rows per page"
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.pageSize}
            onChange={(e) =>
              setFilters({ pageSize: e.target.value, page: "1" })
            }
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading reports"
          className="space-y-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No reports match these filters"
              description="Try a different search or clear the filters."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no_data"
              title="No reports to review"
              description="Reports filed by resellers and merchants will appear here."
            />
          )}
        </div>
      ) : (
        <>
          <ul role="list" className="space-y-3">
            {paginated.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                focused={focusedId === report.id}
                onOpenAccount={(r) => setSelectedAccountId(r.accountId)}
                onResolve={(r, action) =>
                  setResolving({ report: r, action })
                }
                onFocus={setFocusedId}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Report pagination"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Page {safePage} of {totalPages} · {filtered.length} reports
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setFilters({ page: String(safePage - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setFilters({ page: String(safePage + 1) })}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}

      {/* Account drawer, routed by storefront type */}
      {selectedUser?.storefrontType === "reseller" && (
        <StorefrontUserDetailDrawer
          user={selectedUser}
          storefront={selectedUserStorefront}
          onClose={() => setSelectedAccountId(null)}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onSuspend={handleDrawerSuspend}
          onReactivate={handleReactivate}
          onSendNotification={handleSendNotification}
          onRevealPII={handleRevealPII}
          onResetPassword={handleResetPassword}
        />
      )}

      {selectedUser?.storefrontType === "merchant" && (
        <MerchantStorefrontUserDetailDrawer
          user={selectedUser}
          storefront={selectedUserStorefront}
          orders={selectedUserOrders}
          onClose={() => setSelectedAccountId(null)}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onAddToSegment={handleAddToSegment}
          onSuspend={handleDrawerSuspend}
          onReactivate={handleReactivate}
          onSendNotification={handleSendNotification}
          onSendCoupon={handleSendCoupon}
          onRevealPII={handleRevealPII}
          onResetPassword={handleResetPassword}
        />
      )}

      {/* Resolve report modal */}
      <ResolveReportModal
        open={resolving !== null}
        report={resolving?.report ?? null}
        action={resolving?.action ?? null}
        onClose={() => setResolving(null)}
        onConfirm={handleResolveReport}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}