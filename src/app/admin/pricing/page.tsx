"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { Card, CardContent } from "@/components/admin/ui/card";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  pricingRowsToCsv,
  projectNetworkNames,
  type PlanPricingRow,
  type CatalogActor,
} from "@/lib/domains/catalog";
import {
  CatalogPricingTabs,
  CatalogPricingTabPanel,
  type CatalogPricingTabKey,
} from "@/components/admin/pricing/catalog-pricing-tabs";
import { CatalogPricingSummaryCards } from "@/components/admin/pricing/catalog-pricing-summary-cards";
import {
  CatalogPricingFilters,
  DEFAULT_CATALOG_PRICING_FILTERS,
  type CatalogPricingFilterValues,
} from "@/components/admin/pricing/catalog-pricing-filters";
import { CatalogPricingTable } from "@/components/admin/pricing/catalog-pricing-table";
import { CatalogPriceEditorModal } from "@/components/admin/pricing/catalog-price-editor-modal";
import { CatalogPriceHistoryDrawer } from "@/components/admin/pricing/catalog-price-history-drawer";


export default function PricingPage() {
  return (
    <Suspense fallback={<PricingSkeleton />}>
      <PricingPageInner />
    </Suspense>
  );
}

function PricingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

function PricingPageInner() {
  const admin = useCurrentAdmin();
  const { categories, pricingRows, loading, error } = useCatalog();

  const [tab, setTab] = useState<CatalogPricingTabKey>("pricing");
  const [editingRow, setEditingRow] = useState<PlanPricingRow | null>(null);
  const [historyRow, setHistoryRow] = useState<PlanPricingRow | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<CatalogPricingFilterValues>(
      DEFAULT_CATALOG_PRICING_FILTERS
    );

  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const categoryIds = useMemo(
    () => categories.map((c) => c.id),
    [categories]
  );
  const networkNames = useMemo(
    () => projectNetworkNames(categories),
    [categories]
  );

  const filteredRows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = pricingRows;
    if (q) {
      list = list.filter(
        (r) =>
          r.planName.toLowerCase().includes(q) ||
          r.categoryName.toLowerCase().includes(q) ||
          (r.network?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filters.category) {
      list = list.filter((r) => r.categoryId === filters.category);
    }
    if (filters.network) {
      list = list.filter((r) => r.network === filters.network);
    }
    if (filters.status === "active") {
      list = list.filter((r) => r.active);
    } else if (filters.status === "inactive") {
      list = list.filter((r) => !r.active);
    }
    if (filters.lowMargin === "1") {
      list = list.filter((r) => r.marginPercent < 10);
    }

    const sortKey = filters.sort;
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "planName":
          return a.planName.localeCompare(b.planName);
        case "categoryName":
          return a.categoryName.localeCompare(b.categoryName);
        case "network":
          return (a.network ?? "").localeCompare(b.network ?? "");
        case "providerCost":
          return a.providerCost - b.providerCost;
        case "atlasPrice":
          return a.atlasPrice - b.atlasPrice;
        case "marginPercent":
          return a.marginPercent - b.marginPercent;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return a.categoryName.localeCompare(b.categoryName);
      }
    });
    return sorted;
  }, [pricingRows, debouncedSearch, filters]);

  const sortedDescending = filters.sort === "marginPercent";
  const sortDirection: "asc" | "desc" = sortedDescending ? "desc" : "asc";

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(6, Number(filters.pageSize) || 24);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredRows, safePage, pageSize]
  );

  const actor: CatalogActor | null = admin
    ? { id: admin.id, name: admin.name, email: admin.email }
    : null;

  const handleSort = (key: string) => {
    setFilters({ sort: key, page: "1" });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = pricingRowsToCsv(filteredRows);
    downloadCsv(
      "atlas-pricing-" + new Date().toISOString().slice(0, 10) + ".csv",
      csv
    );
  };

  const headerMeta = useMemo(() => {
    const total = pricingRows.length;
    const active = pricingRows.filter((r) => r.active).length;
    const inferred = pricingRows.filter((r) => r.providerCostInferred).length;
    return (
      <>
        <span>{total} plans</span>
        <span aria-hidden="true">·</span>
        <span>{active} active</span>
        {inferred > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-warning-700 dark:text-warning-300">
              {inferred} inferred
            </span>
          </>
        )}
      </>
    );
  }, [pricingRows]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pricing"
        description="Prices, provider costs, and margins across the service catalog."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <CatalogPricingTabs active={tab} onChange={setTab} />

      <CatalogPricingTabPanel tabKey="pricing" active={tab}>
        <div className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
            >
              {error.message}
            </p>
          )}

          <CatalogPricingSummaryCards rows={pricingRows} />

          <CatalogPricingFilters
            value={filters}
            onChange={(patch) => setFilters(patch)}
            onClear={clearFilters}
            hasActive={hasActive}
            categoryIds={categoryIds}
            networkNames={networkNames}
            searchInputRef={searchInputRef}
          />

          <p
            aria-live="polite"
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            Showing {paginated.length} of {filteredRows.length} plans
            {hasActive ? " (filtered)" : ""}
          </p>

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading pricing"
              className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ) : filteredRows.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {hasActive ? (
                <EmptyState
                  variant="no_results"
                  title="No plans match these filters"
                  description="Try a different search or clear the filters."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  variant="no_data"
                  title="No plans in the catalog"
                  description="Add plans on the Data Plans or Services pages first."
                  action={
                    <Link
                      href="/admin/data-plans"
                      className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Open Data Plans
                    </Link>
                  }
                />
              )}
            </div>
          ) : (
            <>
              <CatalogPricingTable
                rows={paginated}
                sortKey={filters.sort}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={setEditingRow}
                onViewHistory={setHistoryRow}
                canManage={admin !== null}
              />

              {totalPages > 1 && (
                <nav
                  aria-label="Pricing pagination"
                  className=" ?flex flex-wrap items-center justify-between gap- input.category3"
                >
                  <span className=" :text-xs text-neutral-500 c dark:text-neutral-400">
                    Page {safePage} of {totalPages} · {filteredRows.length} plans
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() =>
                        setFilters({ page: String(safePage - 1) })
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setFilters({ page: String(safePage + 1) })
                      }
                    >
                      Next
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </CatalogPricingTabPanel>

      <CatalogPricingTabPanel tabKey="tier_reference" active={tab}>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">
              Reseller tier commission rates
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Tier definitions and per-category commission rates live on the
              Reseller Tiers page. This page prices the catalog; that page
              defines what resellers earn.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/resellers/tiers"
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Open Reseller Tiers
              </Link>
            </div>
          </CardContent>
        </Card> 
      </CatalogPricingTabPanel>

      <Can permission={PERMISSIONS.PRICING_MANAGE}>
        <CatalogPriceEditorModal
          open={editingRow !== null}
          row={editingRow}
          actor={actor}
          onClose={() => setEditingRow(null)}
        />
      </Can>

      <CatalogPriceHistoryDrawer
        open={historyRow !== null}
        row={historyRow}
        onClose={() => setHistoryRow(null)}
      />
    </div>
  );
}