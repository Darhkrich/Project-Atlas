"use client";

import { Suspense, useMemo, useState } from "react";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type { Reseller } from "@/lib/admin/types/reseller";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { useResellerStorefronts } from "@/lib/admin/hooks/use-reseller-storefronts";
import { storefrontsToCsv } from "@/lib/admin/resellers/storefront-csv-export";
import {
  approveStorefront,
  disableStorefront,
  reactivateStorefront,
  type StorefrontActor,
} from "@/lib/admin/mock/storefront-status-store";
import { StorefrontSummaryCards } from "@/components/admin/resellers/storefront-summary-cards";
import { ResellerStorefrontTable } from "@/components/admin/resellers/reseller-storefront-table";
import { ResellerStorefrontDetailDrawer } from "@/components/admin/resellers/reseller-storefront-detail-drawer";
import {
  StorefrontActionModal,
  type StorefrontActionMode,
} from "@/components/admin/resellers/storefront-action-modal";

interface StorefrontFilters {
  q: string;
  status: string;
  template: string;
}

const DEFAULT_FILTERS: StorefrontFilters = {
  q: "",
  status: "",
  template: "",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "live", label: "Live" },
  { value: "pending", label: "Pending review" },
  { value: "disabled", label: "Disabled" },
];

interface Toast {
  kind: "success" | "error";
  text: string;
}

interface ActionTarget {
  mode: StorefrontActionMode;
  row: { storefront: UnifiedStorefront; owner: Reseller | undefined };
}

export default function ResellerStorefrontsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResellerStorefrontsPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

function ResellerStorefrontsPageInner() {
  const admin = useCurrentAdmin();
  const { rows, summary, loading } = useResellerStorefronts();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<StorefrontFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionTarget | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: StorefrontActor = admin
    ? { name: admin.name, email: admin.email }
    : { name: "System", email: "system@atlas.com" };

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 6000);
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return rows.filter(({ storefront }) => {
      if (q) {
        const hay =
          storefront.storeName +
          " " +
          storefront.slug +
          " " +
          storefront.ownerName;
        if (!hay.toLowerCase().includes(q)) return false;
      }
      if (filters.status && storefront.status !== filters.status) return false;
      if (filters.template && storefront.template !== filters.template) {
        return false;
      }
      return true;
    });
  }, [rows, debouncedSearch, filters]);

  const templateOptions = useMemo(() => {
    const set = new Set<string>();
    for (const { storefront } of rows) set.add(storefront.template);
    return Array.from(set).sort();
  }, [rows]);

  const selectedRow = useMemo(
    () => rows.find((r) => r.storefront.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = storefrontsToCsv(filtered);
    downloadCsv(
      "atlas-reseller-storefronts-" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
      csv
    );
  };

  const applyAction = () => {
    if (!action) return;
    const sf = action.row.storefront;
    let result;
    if (action.mode === "approve") {
      result = approveStorefront(sf.id, actor);
      if (result.ok) showToast("success", sf.storeName + " approved.");
    } else if (action.mode === "disable") {
      // handled by modal-provided reason
      return;
    } else {
      result = reactivateStorefront(sf.id, actor);
      if (result.ok) showToast("success", sf.storeName + " reactivated.");
    }
    if (result && !result.ok) {
      showToast("error", result.error ?? "Could not update storefront.");
    }
    setAction(null);
  };

  const handleDisable = (reason: string) => {
    if (!action) return;
    const sf = action.row.storefront;
    const result = disableStorefront(sf.id, reason, actor);
    if (result.ok) {
      showToast("success", sf.storeName + " disabled.");
    } else {
      showToast("error", result.error ?? "Could not disable storefront.");
    }
    setAction(null);
  };

  const headerMeta = (
    <>
      <span>
        {summary.total} of {summary.resellerCount} resellers
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.live} live</span>
      {summary.pending > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-warning-700 dark:text-warning-300">
            {summary.pending} pending review
          </span>
        </>
      )}
      {summary.disabled > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summary.disabled} disabled
          </span>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller storefronts"
        description="Storefronts published by resellers under their own branding."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <StorefrontSummaryCards
        summary={summary}
        loading={loading}
        activeFilter={
          filters.status === "live" ||
          filters.status === "pending" ||
          filters.status === "disabled"
            ? filters.status
            : "all"
        }
        onFilterLive={() =>
          setFilters({ status: filters.status === "live" ? "" : "live" })
        }
        onFilterPending={() =>
          setFilters({
            status: filters.status === "pending" ? "" : "pending",
          })
        }
        onFilterDisabled={() =>
          setFilters({
            status: filters.status === "disabled" ? "" : "disabled",
          })
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            aria-label="Search storefronts"
            placeholder="Search by name, slug, or owner"
            className="pl-9"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </div>
        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by template"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.template}
          onChange={(e) => setFilters({ template: e.target.value })}
        >
          <option value="">All templates</option>
          {templateOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No reseller storefronts"
            description="Storefronts appear here once resellers complete their onboarding and publish."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_results"
            title="No storefronts match these filters"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ResellerStorefrontTable
          rows={filtered}
          onView={(sf) => setSelectedId(sf.id)}
          onApprove={(row) => setAction({ mode: "approve", row })}
          onDisable={(row) => setAction({ mode: "disable", row })}
          onReactivate={(row) => setAction({ mode: "reactivate", row })}
        />
      )}

      <ResellerStorefrontDetailDrawer
        storefront={selectedRow?.storefront ?? null}
        owner={selectedRow?.owner}
        onClose={() => setSelectedId(null)}
        onApprove={() => {
          if (!selectedRow) return;
          setAction({ mode: "approve", row: selectedRow });
        }}
        onDisable={() => {
          if (!selectedRow) return;
          setAction({ mode: "disable", row: selectedRow });
        }}
        onReactivate={() => {
          if (!selectedRow) return;
          setAction({ mode: "reactivate", row: selectedRow });
        }}
      />

      <StorefrontActionModal
        open={action !== null}
        mode={action?.mode ?? "approve"}
        storefront={action?.row.storefront ?? null}
        owner={action?.row.owner}
        onClose={() => setAction(null)}
        onApprove={applyAction}
        onDisable={handleDisable}
        onReactivate={applyAction}
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