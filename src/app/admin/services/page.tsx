/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ServiceCategory, ServiceSection } from "@/lib/domains/catalog";
import {
  CATALOG_ACTIONS,
  CATALOG_RESOURCE_TYPES,
  applyCatalogMutation,
  reorder,
  slugify,
  type CatalogActor,
} from "@/lib/domains/catalog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import { ServicesSummaryCards } from "@/components/admin/services/services-summary-cards";
import {
  ServicesFilters,
  type ServiceFilterValues,
} from "@/components/admin/services/services-filters";
import { ServicesToolbar } from "@/components/admin/services/services-toolbar";
import { ServiceCategoryCard } from "@/components/admin/services/service-category-card";
import { ServiceCategoryDrawer } from "@/components/admin/services/service-category-drawer";
import { ServiceBulkToggleModal } from "@/components/admin/services/service-action-modals";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";
import { useAuditEntries } from "@/lib/admin/hooks/use-audit-entries";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  isAvailable,
  isComingSoon,
  isInactive,
  nextDisplayOrder,
  sectionsFor,
  serviceStatus,
} from "@/lib/admin/services/helpers";
import { servicesToCsv } from "@/lib/admin/services/csv-export";
import {
  PAGE_SIZE,
  type FilterGroup,
  type SortKey,
} from "@/lib/admin/services/constants";
import { auditEntriesToServiceEntries } from "@/lib/admin/services/audit-adapters";

const VIEWS_KEY = "atlas-services-views-v2";

const DEFAULT_FILTERS: ServiceFilterValues = {
  q: "",
  status: "",
  group: "",
  sort: "displayOrder",
  page: "1",
  pageSize: String(PAGE_SIZE),
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

type BulkIntent =
  | { kind: "enable"; ids: string[] }
  | { kind: "disable"; ids: string[] };

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesPageInner />
    </Suspense>
  );
}

function ServicesSkeleton() {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function ServicesPageInner() {
  const admin = useCurrentAdmin();
  const { categories, loading } = useCatalog();
  const auditEntries = useAuditEntries();

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [draftCategory, setDraftCategory] = useState<ServiceCategory | null>(
    null
  );
  const [isNew, setIsNew] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);
  const [bulkIntent, setBulkIntent] = useState<BulkIntent | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<ServiceFilterValues>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const actor: CatalogActor | null = admin
    ? { id: admin.id, name: admin.name, email: admin.email }
    : null;

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
      // storage may be full or disabled.
    }
  }, [savedViews, viewsLoaded]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = categories;

    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }
    if (filters.status) {
      list = list.filter((c) => serviceStatus(c) === filters.status);
    }
    if (filters.group) {
      list = list.filter((c) => c.filterGroup === filters.group);
    }

    const sorted = [...list];
    const key = filters.sort as SortKey;
    sorted.sort((a, b) => {
      switch (key) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return serviceStatus(a).localeCompare(serviceStatus(b));
        case "plans": {
          const aPlans = a.formConfig?.plans?.length ?? 0;
          const bPlans = b.formConfig?.plans?.length ?? 0;
          return bPlans - aPlans;
        }
        case "displayOrder":
        default:
          return a.displayOrder - b.displayOrder;
      }
    });
    return sorted;
  }, [categories, debouncedSearch, filters]);

  const pageSize = Math.max(6, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const paginatedIds = useMemo(() => paginated.map((c) => c.id), [paginated]);

  useEffect(() => {
    if (focusedId && !paginatedIds.includes(focusedId)) {
      setFocusedId(paginatedIds[0] ?? null);
    }
  }, [paginatedIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-service-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: paginatedIds,
    focusedId,
    enabled: selectedCategoryId === null && bulkIntent === null,
    onFocusChange: setFocusedId,
    onOpen: (id) => {
      setSelectedCategoryId(id);
      setIsNew(false);
    },
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const drawerCategory = draftCategory ?? selectedCategory;

  const serviceAudit = useMemo(
    () => auditEntriesToServiceEntries(auditEntries),
    [auditEntries]
  );

  const serviceAuditMeta = (
    serviceId: string,
    serviceName: string,
    summary: string
  ) => ({ serviceId, serviceName, summary });

  /* ------------------------------ Save ------------------------------ */

  const handleSave = (updated: ServiceCategory) => {
    if (!actor) return;
    if (isNew) {
      applyCatalogMutation({
        transform: (cats) => [...cats, updated],
        audit: {
          action: CATALOG_ACTIONS.CATEGORY_CREATE,
          resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
          resourceId: updated.id,
          metadata: serviceAuditMeta(
            updated.id,
            updated.name,
            `Service "${updated.name}" created in group "${updated.filterGroup}"`
          ),
        },
        actor,
      });
      setToast({ kind: "success", text: `${updated.name} created.` });
    } else {
      const previous = categories.find((c) => c.id === updated.id);
      applyCatalogMutation({
        transform: (cats) =>
          cats.map((c) => (c.id === updated.id ? updated : c)),
        audit: {
          action: CATALOG_ACTIONS.CATEGORY_UPDATE,
          resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
          resourceId: updated.id,
          metadata: serviceAuditMeta(
            updated.id,
            updated.name,
            `Service updated${
              previous && previous.name !== updated.name
                ? ` (renamed from "${previous.name}")`
                : ""
            }`
          ),
        },
        actor,
      });
      setToast({ kind: "success", text: `${updated.name} updated.` });
    }
    setDraftCategory(null);
    setSelectedCategoryId(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (!actor) return;
    const target = categories.find((c) => c.id === id);
    applyCatalogMutation({
      transform: (cats) => cats.filter((c) => c.id !== id),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_DELETE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: id,
        metadata: target
          ? serviceAuditMeta(id, target.name, `Service removed`)
          : undefined,
      },
      actor,
    });
    if (target) {
      setToast({ kind: "success", text: `${target.name} deleted.` });
    }
    setSelectedCategoryId(null);
    setIsNew(false);
  };

  const handleDuplicate = (
    source: ServiceCategory,
    result: { newName: string; newId: string }
  ) => {
    if (!actor) return;
    const nextOrder = nextDisplayOrder(categories);
    const duplicate: ServiceCategory = {
      ...source,
      id: result.newId,
      name: result.newName,
      available: false,
      comingSoon: false,
      comingSoonReason: undefined,
      disabledReason: undefined,
      displayOrder: nextOrder,
      formConfig: source.formConfig
        ? {
            ...source.formConfig,
            plans: source.formConfig.plans?.map((p) => ({
              ...p,
              id: `${result.newId}:${slugify(p.id)}`,
            })),
          }
        : undefined,
    };
    applyCatalogMutation({
      transform: (cats) => [...cats, duplicate],
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_CREATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: duplicate.id,
        metadata: serviceAuditMeta(
          duplicate.id,
          duplicate.name,
          `Copied from "${source.name}"`
        ),
      },
      actor,
    });
    setToast({ kind: "success", text: `${duplicate.name} created.` });
  };

  const handleToggleAvailable = (id: string) => {
    if (!actor) return;
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const nextAvailable = !target.available;
    applyCatalogMutation({
      transform: (cats) =>
        cats.map((c) =>
          c.id === id
            ? {
                ...c,
                available: nextAvailable,
                comingSoon: nextAvailable ? false : c.comingSoon,
                comingSoonReason: nextAvailable
                  ? undefined
                  : c.comingSoonReason,
                disabledReason: nextAvailable ? undefined : c.disabledReason,
              }
            : c
        ),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: id,
        metadata: serviceAuditMeta(
          id,
          target.name,
          nextAvailable ? "Enabled" : "Disabled"
        ),
      },
      actor,
    });
  };

  const handleMoveUp = (id: string) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) => reorder(cats, id, "up"),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_REORDER,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: id,
        metadata: { serviceId: id, serviceName: id, summary: "Moved up" },
      },
      actor,
    });
  };

  const handleMoveDown = (id: string) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) => reorder(cats, id, "down"),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_REORDER,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: id,
        metadata: { serviceId: id, serviceName: id, summary: "Moved down" },
      },
      actor,
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => setSelectedIds([]);

  const handleBulkEnable = () => {
    if (selectedIds.length === 0) return;
    setBulkIntent({ kind: "enable", ids: selectedIds });
  };

  const handleBulkDisable = () => {
    if (selectedIds.length === 0) return;
    setBulkIntent({ kind: "disable", ids: selectedIds });
  };

  const handleBulkDuplicate = () => {
    if (!actor) return;
    const sources = categories.filter((c) => selectedIds.includes(c.id));
    const startingOrder = nextDisplayOrder(categories);
    const duplicates: ServiceCategory[] = sources.map((source, index) => ({
      ...source,
      id: `${slugify(source.name)}-copy-${index + 1}`,
      name: `${source.name} Copy ${index + 1}`,
      available: false,
      comingSoon: false,
      comingSoonReason: undefined,
      disabledReason: undefined,
      displayOrder: startingOrder + index,
    }));
    applyCatalogMutation({
      transform: (cats) => [...cats, ...duplicates],
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_CREATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "bulk",
        metadata: {
          serviceId: "bulk",
          serviceName: "Bulk duplicate",
          summary: `${duplicates.length} service${
            duplicates.length === 1 ? "" : "s"
          } duplicated`,
        },
      },
      actor,
    });
    setSelectedIds([]);
    setToast({
      kind: "success",
      text: `${duplicates.length} service${
        duplicates.length === 1 ? "" : "s"
      } duplicated.`,
    });
  };

  const confirmBulkToggle = () => {
    if (!bulkIntent || !actor) return;
    const enable = bulkIntent.kind === "enable";
    const idSet = new Set(bulkIntent.ids);
    applyCatalogMutation({
      transform: (cats) =>
        cats.map((c) =>
          idSet.has(c.id)
            ? {
                ...c,
                available: enable,
                comingSoon: enable ? false : c.comingSoon,
                comingSoonReason: enable ? undefined : c.comingSoonReason,
                disabledReason: enable ? undefined : c.disabledReason,
              }
            : c
        ),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "bulk",
        metadata: {
          serviceId: "bulk",
          serviceName: "Bulk status change",
          summary: `${enable ? "Enabled" : "Disabled"} ${
            bulkIntent.ids.length
          } service${bulkIntent.ids.length === 1 ? "" : "s"}`,
        },
      },
      actor,
    });
    setSelectedIds([]);
    setBulkIntent(null);
    setToast({
      kind: "success",
      text: `${bulkIntent.ids.length} service${
        bulkIntent.ids.length === 1 ? "" : "s"
      } ${enable ? "enabled" : "disabled"}.`,
    });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = servicesToCsv(filtered);
    downloadCsv(
      `atlas-services-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.status) snapshot.status = filters.status;
    if (filters.group) snapshot.group = filters.group;
    if (filters.sort && filters.sort !== "displayOrder") {
      snapshot.sort = filters.sort;
    }
    setSavedViews((prev) => [...prev, { name, filters: snapshot }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({ ...DEFAULT_FILTERS, ...view.filters, page: "1" });
  };

 const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleAddNew = () => {
    const nextOrder = nextDisplayOrder(categories);
    const fresh: ServiceCategory = {
      id: "",
      name: "",
      description: "",
      icon: "grid",
      available: false,
      filterGroup: "more",
      sections: ["digital_services"],
      availableToResellers: false,
      displayOrder: nextOrder,
      networkOptions: [],
      formConfig: {
        selectionType: "amounts",
        fields: [],
        plans: [],
      },
    };
    setDraftCategory(fresh);
    setIsNew(true);
    setSelectedCategoryId(null);
  };

  const headerMeta = useMemo(() => {
    const total = categories.length;
    const available = categories.filter(isAvailable).length;
    const comingSoon = categories.filter(isComingSoon).length;
    const inactive = categories.filter(isInactive).length;
    return (
      <>
        <span>{total} services</span>
        <span aria-hidden="true">·</span>
        <span>{available} available</span>
        {comingSoon > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-warning-700 dark:text-warning-300">
              {comingSoon} coming soon
            </span>
          </>
        )}
        {inactive > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {inactive} inactive
            </span>
          </>
        )}
      </>
    );
  }, [categories]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="Manage the digital service catalog: categories, form fields, plans, and availability."
        meta={headerMeta}
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Can permission={PERMISSIONS.SERVICES_MANAGE}>
              <Button size="sm" onClick={handleAddNew}>
                Add service
              </Button>
            </Can>
          </>
        }
      />

      <ServicesSummaryCards
        categories={categories}
        activeStatus={filters.status}
        onFilterAll={() =>
          setFilters({ status: "", group: "", page: "1" })
        }
        onFilterAvailable={() =>
          setFilters({ status: "available", group: "", page: "1" })
        }
        onFilterComingSoon={() =>
          setFilters({ status: "coming_soon", group: "", page: "1" })
        }
        onFilterInactive={() =>
          setFilters({ status: "inactive", group: "", page: "1" })
        }
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <ServicesFilters
        value={filters}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      <ServicesToolbar
        selectedCount={selectedIds.length}
        onEnable={handleBulkEnable}
        onDisable={handleBulkDisable}
        onDuplicate={handleBulkDuplicate}
        onClearSelection={handleClearSelection}
      />

      <p
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        Showing {paginated.length} of {filtered.length} service
        {filtered.length === 1 ? "" : "s"}
        {hasActive ? " (filtered)" : ""}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Per page
          </span>
          <select
            aria-label="Services per page"
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.pageSize}
            onChange={(e) =>
              setFilters({ pageSize: e.target.value, page: "1" })
            }
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading services"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No services match these filters"
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
              title="No services yet"
              description="Add your first service category to get started."
              action={
                <Can permission={PERMISSIONS.SERVICES_MANAGE}>
                  <Button size="sm" onClick={handleAddNew}>
                    Add service
                  </Button>
                </Can>
              }
            />
          )}
        </div>
      ) : (
        <>
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {paginated.map((category, index) => (
              <ServiceCategoryCard
                key={category.id}
                category={category}
                isSelected={selectedIds.includes(category.id)}
                isFocused={focusedId === category.id}
                canMoveUp={index > 0}
                canMoveDown={index < paginated.length - 1}
                onToggleSelect={handleToggleSelect}
                onOpen={(id) => {
                  setSelectedCategoryId(id);
                  setIsNew(false);
                }}
                onFocus={setFocusedId}
                onToggleAvailable={handleToggleAvailable}
                onDuplicate={(cat) => {
                  setSelectedCategoryId(cat.id);
                  setIsNew(false);
                }}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Service pagination"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Page {safePage} of {totalPages} · {filtered.length} services
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

      <ServiceCategoryDrawer
        category={drawerCategory}
        isNew={isNew}
        existingIds={categories.map((c) => c.id)}
        allCategories={categories}
        auditEntries={serviceAudit}
        onClose={() => {
          setSelectedCategoryId(null);
          setDraftCategory(null);
          setIsNew(false);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggleAvailable={handleToggleAvailable}
      />

      <ServiceBulkToggleModal
        open={bulkIntent !== null}
        mode={bulkIntent?.kind === "enable" ? "enable" : "disable"}
        serviceNames={categories
          .filter((c) => bulkIntent?.ids.includes(c.id))
          .map((c) => c.name)}
        onClose={() => setBulkIntent(null)}
        onConfirm={confirmBulkToggle}
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