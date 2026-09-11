/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StorefrontSummaryCards } from "@/components/admin/storefronts/storefront-summary-cards";
import { StorefrontFilters } from "@/components/admin/storefronts/storefront-filters";
import { StorefrontTable } from "@/components/admin/storefronts/storefront-table";
import { StorefrontDetailDrawer } from "@/components/admin/storefronts/storefront-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { UnifiedStorefront } from "@/lib/admin/types/storefront";

export default function StorefrontsPage() {
  const [storefronts, setStorefronts] = useState<UnifiedStorefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStorefront, setSelectedStorefront] = useState<UnifiedStorefront | null>(null);
  const [previewStorefront, setPreviewStorefront] = useState<UnifiedStorefront | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    type: "enable" | "disable" | "bulk-enable" | "bulk-disable";
    storefrontId?: string;
  } | null>(null);

  const [filters, setFilters] = useState<{
    search: string;
    type: string;
    status: string;
  }>({
    search: "",
    type: "",
    status: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setStorefronts(mockStorefronts);
      setLoading(false);
    }, 500);
  }, []);

  // Filters
  const filteredStorefronts = useMemo(() => {
    return storefronts.filter((s) => {
      if (
        filters.search &&
        !s.storeName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.ownerName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.slug.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.type && s.type !== filters.type) return false;
      if (filters.status && s.status !== filters.status) return false;
      return true;
    });
  }, [storefronts, filters]);

  // Toggle status
  const handleToggleStatus = (id: string) => {
    const sf = storefronts.find((s) => s.id === id);
    if (!sf) return;
    const isEnabling = sf.status !== "live";
    setConfirmAction({
      type: isEnabling ? "enable" : "disable",
      storefrontId: id,
    });
  };

  const confirmToggleStatus = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "bulk-enable" || confirmAction.type === "bulk-disable") {
      const newStatus = confirmAction.type === "bulk-enable" ? "live" : "disabled";
      setStorefronts((prev) =>
        prev.map((s) =>
          selectedIds.includes(s.id) ? { ...s, status: newStatus as any } : s
        )
      );
      setSelectedIds([]);
    } else if (confirmAction.storefrontId) {
      const newStatus = confirmAction.type === "enable" ? "live" : "disabled";
      setStorefronts((prev) =>
        prev.map((s) =>
          s.id === confirmAction.storefrontId ? { ...s, status: newStatus as any } : s
        )
      );
      // Update drawer if open
      setSelectedStorefront((prev) =>
        prev && prev.id === confirmAction.storefrontId
          ? { ...prev, status: newStatus as any }
          : prev
      );
    }

    setConfirmAction(null);
  };

  // Bulk actions
  const handleBulkEnable = () => {
    if (selectedIds.length === 0) return;
    setConfirmAction({ type: "bulk-enable" });
  };

  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;
    setConfirmAction({ type: "bulk-disable" });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Export
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export storefronts as ${format}`);
  };

  // Filter shortcuts from summary cards
  const filterByType = (type: string) => {
    setFilters((prev) => ({ ...prev, type, status: "" }));
  };

  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status, type: "" }));
  };

  const resetFilters = () => {
    setFilters({ search: "", type: "", status: "" });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Storefronts"
        description="Unified view of all reseller and merchant storefronts on Atlas."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <StorefrontSummaryCards
        storefronts={storefronts}
        onFilterAll={resetFilters}
        onFilterReseller={() => filterByType("reseller")}
        onFilterMerchant={() => filterByType("merchant")}
        onFilterDisabled={() => filterByStatus("disabled")}
      />

      <StorefrontFilters onFilterChange={setFilters} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <>
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkEnable}>
                <AtlasIcon name="check" className="mr-1 h-3.5 w-3.5" />
                Enable
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDisable}>
                <AtlasIcon name="x-circle" className="mr-1 h-3.5 w-3.5" />
                Disable
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </Button>
            </>
          ) : (
            <span className="text-sm text-neutral-500">
              {filteredStorefronts.length} storefront
              {filteredStorefronts.length === 1 ? "" : "s"}
              {filters.search || filters.type || filters.status
                ? " (filtered)"
                : ""}
            </span>
          )}
        </div>
      </div>

      {/* Loading / Table */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filteredStorefronts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <AtlasIcon name="store" className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">
            No storefronts match your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <StorefrontTable
          storefronts={filteredStorefronts}
          onView={setSelectedStorefront}
          onToggleStatus={handleToggleStatus}
          onPreview={setPreviewStorefront}
          isSelected={(id) => selectedIds.includes(id)}
          onToggleSelect={toggleSelect}
        />
      )}

      {/* Detail drawer */}
      <StorefrontDetailDrawer
        storefront={selectedStorefront}
        onClose={() => setSelectedStorefront(null)}
        onToggleStatus={handleToggleStatus}
        onPreview={setPreviewStorefront}
      />

      {/* Preview modal */}
      {previewStorefront && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreviewStorefront(null)}
          />
          <div className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-semibold">
                  {previewStorefront.storeName} — Preview
                </h3>
                <p className="text-xs text-neutral-500">
                  {previewStorefront.ownerName} ·{" "}
                  {previewStorefront.type === "reseller"
                    ? "Reseller Storefront"
                    : "Merchant Store"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewStorefront(null)}
              >
                Close
              </Button>
            </div>

            <div className="mt-4">
              {/* Mock storefront preview */}
              <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
                <div
                  className="h-32 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: previewStorefront.primaryColor || "#166e59",
                  }}
                >
                  <p className="text-3xl font-bold text-white">
                    {previewStorefront.storeName}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
                  <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
                  <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800"></div>
                </div>
                <div className="mt-4 text-sm text-neutral-500">
                  Template: {previewStorefront.template} · Slug:{" "}
                  {previewStorefront.slug}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewStorefront(null)}
                >
                  Close
                </Button>
                <Button size="sm">Open Public Store</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${
          confirmAction?.type === "enable" || confirmAction?.type === "bulk-enable"
            ? "Enable"
            : "Disable"
        }`}
        description={
          confirmAction?.type === "bulk-enable" || confirmAction?.type === "bulk-disable"
            ? `Are you sure you want to ${
                confirmAction.type === "bulk-enable" ? "enable" : "disable"
              } ${selectedIds.length} storefront${
                selectedIds.length === 1 ? "" : "s"
              }?`
            : `Are you sure you want to ${
                confirmAction?.type === "enable" ? "enable" : "disable"
              } this storefront? The change affects the public store immediately.`
        }
        confirmLabel="Confirm"
        danger={
          confirmAction?.type === "disable" || confirmAction?.type === "bulk-disable"
        }
        onConfirm={confirmToggleStatus}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}