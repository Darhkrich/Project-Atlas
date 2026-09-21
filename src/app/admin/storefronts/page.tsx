"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useStorefronts } from "@/lib/admin/hooks/use-storefronts";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { storefrontsToCsv } from "@/lib/admin/storefronts/storefront-csv-export";
import {
  filterStorefronts,
  type StorefrontFilters as StorefrontFilterValues,
} from "@/lib/admin/storefronts/storefront-projection";
import {
  approveStorefront,
  disableStorefront,
  reactivateStorefront,
  type StorefrontActor,
} from "@/lib/admin/mock/storefront-status-store";
import { StorefrontSummaryCards } from "@/components/admin/storefronts/storefront-summary-cards";
import { StorefrontFilters } from "@/components/admin/storefronts/storefront-filters";
import { StorefrontTable } from "@/components/admin/storefronts/storefront-table";
import { StorefrontDetailDrawer } from "@/components/admin/storefronts/storefront-detail-drawer";
import { StorefrontPreviewModal } from "@/components/admin/storefronts/storefront-preview-modal";
import { StorefrontBulkDisableModal } from "@/components/admin/storefronts/storefront-bulk-disable-modal";
import { StorefrontActionModal } from "@/components/admin/resellers/storefront-action-modal";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface UrlFilters extends StorefrontFilterValues {
  view: string;
}

const DEFAULT_FILTERS: UrlFilters = {
  q: "",
  type: "",
  status: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function StorefrontsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StorefrontsPageInner />
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
      <div className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function StorefrontsPageInner() {
  const admin = useCurrentAdmin();
  const { storefronts, summary, loading } = useStorefronts();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<UrlFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [selectedForDrawer, setSelectedForDrawer] =
    useState<UnifiedStorefront | null>(null);
  const [previewTarget, setPreviewTarget] = useState<UnifiedStorefront | null>(
    null
  );
  const [actionTarget, setActionTarget] = useState<UnifiedStorefront | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkEnableOpen, setBulkEnableOpen] = useState(false);
  const [bulkDisableOpen, setBulkDisableOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const actor: StorefrontActor = useMemo(
    () =>
      admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    [admin]
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
  };

  const filtered = useMemo(
    () =>
      filterStorefronts(storefronts, {
        q: debouncedSearch,
        type: filters.type,
        status: filters.status,
      }),
    [storefronts, debouncedSearch, filters.type, filters.status]
  );

  const selectedMerchants = useMemo(
    () =>
      storefronts.filter(
        (sf) =>
          selectedIds.includes(sf.id) && sf.type === "merchant"
      ),
    [storefronts, selectedIds]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const activeType: "all" | "reseller" | "merchant" =
    filters.type === "reseller"
      ? "reseller"
      : filters.type === "merchant"
      ? "merchant"
      : "all";

  const activeStatus: "all" | "disabled" =
    filters.status === "disabled" ? "disabled" : "all";

  const handleExport = () => {
    const csv = storefrontsToCsv(filtered);
    downloadCsv(
      "atlas-storefronts-" + new Date().toISOString().slice(0, 10) + ".csv",
      csv
    );
  };

  const handleOpenActions = (sf: UnifiedStorefront) => {
    setActionTarget(sf);
  };

  const handleApprove = () => {
    if (!actionTarget) return;
    const result = approveStorefront(actionTarget.id, actor);
    if (result.ok) {
      showToast("success", actionTarget.storeName + " approved.");
    } else {
      showToast("error", result.error ?? "Could not approve storefront.");
    }
    setActionTarget(null);
  };

  const handleDisable = (reason: string) => {
    if (!actionTarget) return;
    const result = disableStorefront(actionTarget.id, reason, actor);
    if (result.ok) {
      showToast("success", actionTarget.storeName + " disabled.");
    } else {
      showToast("error", result.error ?? "Could not disable storefront.");
    }
    setActionTarget(null);
  };

  const handleReactivate = () => {
    if (!actionTarget) return;
    const result = reactivateStorefront(actionTarget.id, actor);
    if (result.ok) {
      showToast("success", actionTarget.storeName + " reactivated.");
    } else {
      showToast("error", result.error ?? "Could not reactivate storefront.");
    }
    setActionTarget(null);
  };

  const handleBulkEnable = () => {
    let enabled = 0;
    let skipped = 0;
    for (const sf of selectedMerchants) {
      if (sf.status === "disabled") {
        const result = reactivateStorefront(sf.id, actor);
        if (result.ok) enabled += 1;
      } else {
        skipped += 1;
      }
    }
    showToast(
      "success",
      "Enabled " +
        enabled +
        " storefront" +
        (enabled === 1 ? "" : "s") +
        (skipped > 0
          ? ". Skipped " +
            skipped +
            " that were not disabled (pending approval must happen individually)."
          : ".")
    );
    clearSelection();
    setBulkEnableOpen(false);
  };

  const handleBulkDisable = (reason: string) => {
    let disabled = 0;
    let skipped = 0;
    for (const sf of selectedMerchants) {
      if (sf.status === "live") {
        const result = disableStorefront(sf.id, reason, actor);
        if (result.ok) disabled += 1;
      } else {
        skipped += 1;
      }
    }
    showToast(
      "success",
      "Disabled " +
        disabled +
        " storefront" +
        (disabled === 1 ? "" : "s") +
        (skipped > 0
          ? ". Skipped " + skipped + " that were not live."
          : ".")
    );
    clearSelection();
    setBulkDisableOpen(false);
  };

  const headerMeta = (
    <>
      <span>
        {summary.total} storefront{summary.total === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.liveCount} live</span>
      <span aria-hidden="true">·</span>
      <span>{summary.resellerCount} reseller</span>
      <span aria-hidden="true">·</span>
      <span>{summary.merchantCount} merchant</span>
      {summary.disabledCount > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summary.disabledCount} disabled
          </span>
        </>
      )}
    </>
  );

  const actionModalMode: "approve" | "disable" | "reactivate" =
    actionTarget?.status === "pending"
      ? "approve"
      : actionTarget?.status === "disabled"
      ? "reactivate"
      : "disable";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Storefronts"
        description="Unified view of reseller and merchant storefronts. Reseller storefronts are managed on their own page; merchant storefronts are managed here."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <StorefrontSummaryCards
        summary={summary}
        activeType={activeType}
        activeStatus={activeStatus}
        loading={loading}
        onFilterAll={() => setFilters({ type: "", status: "" })}
        onFilterReseller={() =>
          setFilters({
            type: filters.type === "reseller" ? "" : "reseller",
          })
        }
        onFilterMerchant={() =>
          setFilters({
            type: filters.type === "merchant" ? "" : "merchant",
          })
        }
        onFilterDisabled={() =>
          setFilters({
            status: filters.status === "disabled" ? "" : "disabled",
          })
        }
      />

      <StorefrontFilters
        value={{
          q: filters.q,
          type: filters.type,
          status: filters.status,
        }}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
        hasActive={hasActive}
        searchInputRef={{
          current: null,
        } as unknown as React.RefObject<HTMLInputElement>}
      />

      <div className="flex flex-wrap items-center gap-2">
        {selectedIds.length > 0 ? (
          <>
            <span
              className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
              aria-live="polite"
            >
              {selectedIds.length} merchant storefront
              {selectedIds.length === 1 ? "" : "s"} selected
            </span>
            <Can permission={PERMISSIONS.STOREFRONTS_MANAGE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkEnableOpen(true)}
              >
                Enable
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDisableOpen(true)}
              >
                Disable
              </Button>
            </Can>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </>
        ) : (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {filtered.length} of {storefronts.length} storefront
            {storefronts.length === 1 ? "" : "s"}
            {hasActive ? " (filtered)" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : storefronts.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No storefronts yet"
            description="Storefronts appear here once resellers or merchants publish them."
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
        <StorefrontTable
          storefronts={filtered}
          onView={(sf) => setSelectedForDrawer(sf)}
          onToggleStatus={handleOpenActions}
          onPreview={(sf) => setPreviewTarget(sf)}
          isSelected={(id) => selectedIds.includes(id)}
          onToggleSelect={toggleSelect}
        />
      )}

      <StorefrontDetailDrawer
        storefront={selectedForDrawer}
        onClose={() => setSelectedForDrawer(null)}
        onToggleStatus={(sf) => {
          setSelectedForDrawer(null);
          setActionTarget(sf);
        }}
        onPreview={(sf) => {
          setSelectedForDrawer(null);
          setPreviewTarget(sf);
        }}
      />

      <StorefrontPreviewModal
        open={previewTarget !== null}
        storefront={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <StorefrontActionModal
        open={actionTarget !== null}
        mode={actionModalMode}
        storefront={actionTarget}
        owner={undefined}
        onClose={() => setActionTarget(null)}
        onApprove={handleApprove}
        onDisable={handleDisable}
        onReactivate={handleReactivate}
      />

      <ConfirmDialog
        open={bulkEnableOpen}
        title={
          "Enable " +
          selectedMerchants.length +
          " merchant storefront" +
          (selectedMerchants.length === 1 ? "" : "s") +
          "?"
        }
        description="Only disabled storefronts will be reactivated. Pending storefronts must be approved individually."
        confirmLabel="Enable"
        onConfirm={handleBulkEnable}
        onCancel={() => setBulkEnableOpen(false)}
      />

      <StorefrontBulkDisableModal
        open={bulkDisableOpen}
        count={selectedMerchants.length}
        onClose={() => setBulkDisableOpen(false)}
        onConfirm={handleBulkDisable}
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