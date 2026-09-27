"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Plan } from "@/lib/domains/catalog";
import {
  CATALOG_ACTIONS,
  CATALOG_RESOURCE_TYPES,
  applyCatalogMutation,
  type CatalogActor,
} from "@/lib/domains/catalog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import {
  DataPlanSummaryCards,
  type SummaryFilter,
} from "@/components/admin/data-plans/data-plan-summary-cards";
import { NetworkSidebar } from "@/components/admin/data-plans/network-sidebar";
import { DataPlansToolbar } from "@/components/admin/data-plans/data-plans-toolbar";
import { CategorySection } from "@/components/admin/data-plans/category-section";
import { DataPlanAuditPanel } from "@/components/admin/data-plans/data-plan-audit-panel";
import {
  NetworkEditModal,
  NetworkDeleteModal,
  CategoryEditModal,
  PlanEditModal,
  ImportPlansModal,
} from "@/components/admin/data-plans/data-plan-modals";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";
import { useAuditEntries } from "@/lib/admin/hooks/use-audit-entries";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  projectNetworksFromCatalog,
  applyNetworkMutation,
  applyNetworkTreeMutation,
} from "@/lib/admin/data-plans/projection";
import {
  dataPlanIdFor,
  filterPlans,
  type ImportRow,
} from "@/lib/admin/data-plans/helpers";
import { dataPlansToCsv } from "@/lib/admin/data-plans/csv-export";
import { auditEntriesToDataPlanEntries } from "@/lib/admin/data-plans/audit-adapters";
import type { DataPlanAuditScope } from "@/lib/admin/data-plans/audit";

interface DataPlanFilters {
  network: string;
  q: string;
  filter: SummaryFilter;
}

const DEFAULT_FILTERS: DataPlanFilters = {
  network: "",
  q: "",
  filter: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

type ModalState =
  | { kind: "none" }
  | { kind: "network-create" }
  | { kind: "network-rename"; networkName: string }
  | { kind: "network-delete"; networkName: string; planCount: number }
  | { kind: "category-create"; networkName: string }
  | { kind: "category-rename"; networkName: string; categoryName: string }
  | { kind: "plan-create"; networkName: string; categoryName: string }
  | { kind: "plan-edit"; networkName: string; categoryName: string; plan: Plan }
  | { kind: "import"; networkName: string; categoryName: string };

type ConfirmState =
  | { kind: "none" }
  | { kind: "category"; networkName: string; categoryName: string }
  | { kind: "plan"; networkName: string; categoryName: string; plan: Plan }
  | { kind: "bulk"; enable: boolean; ids: string[] };

export default function DataPlansPage() {
  return (
    <Suspense fallback={<DataPlansSkeleton />}>
      <DataPlansPageInner />
    </Suspense>
  );
}

function DataPlansSkeleton() {
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
      <div className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

function DataPlansPageInner() {
  const admin = useCurrentAdmin();
  const { categories, loading } = useCatalog();
  const auditEntries = useAuditEntries();

  const [focusedPlanId, setFocusedPlanId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [confirm, setConfirm] = useState<ConfirmState>({ kind: "none" });
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<DataPlanFilters>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const actor: CatalogActor | null = admin
    ? { id: admin.id, name: admin.name, email: admin.email }
    : null;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const networks = useMemo(
    () => projectNetworksFromCatalog(categories),
    [categories]
  );

  const selectedNetwork = useMemo(() => {
    if (filters.network) {
      const found = networks.find((n) => n.name === filters.network);
      if (found) return found;
    }
    return networks[0] ?? null;
  }, [networks, filters.network]);

  const summaryFilter: SummaryFilter =
    filters.filter === "low-margin" || filters.filter === "inactive"
      ? filters.filter
      : "all";

  const filteredCategories = useMemo(() => {
    if (!selectedNetwork) return [];
    const searching = debouncedSearch.trim() !== "";
    const filtering = summaryFilter !== "all";
    return selectedNetwork.categories
      .map((c) => ({
        ...c,
        plans: filterPlans(c.plans, debouncedSearch, summaryFilter),
      }))
      .filter((c) => {
        if (!searching && !filtering) return true;
        return c.plans.length > 0;
      });
  }, [selectedNetwork, debouncedSearch, summaryFilter]);

  const visiblePlanIds = useMemo(
    () => filteredCategories.flatMap((c) => c.plans.map((p) => p.id)),
    [filteredCategories]
  );

  const selectNetwork = useCallback(
    (name: string) => {
      setFilters({ network: name });
      setSelectedPlanIds([]);
    },
    [setFilters]
  );

  const auditMeta = useCallback(
    (
      scope: DataPlanAuditScope,
      scopeId: string,
      scopeName: string,
      networkName: string,
      summary: string
    ) => ({
      scope,
      scopeId,
      scopeName,
      networkName,
      summary,
    }),
    []
  );

  const findPlanContext = useCallback(
    (planId: string): { categoryName: string; plan: Plan } | null => {
      if (!selectedNetwork) return null;
      for (const cat of selectedNetwork.categories) {
        const plan = cat.plans.find((p) => p.id === planId);
        if (plan) return { categoryName: cat.name, plan };
      }
      return null;
    },
    [selectedNetwork]
  );

  useEffect(() => {
    if (!focusedPlanId) return;
    const el = document.querySelector(`[data-plan-id="${focusedPlanId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedPlanId]);

  useInboxKeyboard({
    itemIds: visiblePlanIds,
    focusedId: focusedPlanId,
    enabled: modal.kind === "none" && confirm.kind === "none",
    onFocusChange: setFocusedPlanId,
    onOpen: (planId) => {
      if (!selectedNetwork) return;
      const found = findPlanContext(planId);
      if (!found) return;
      setModal({
        kind: "plan-edit",
        networkName: selectedNetwork.name,
        categoryName: found.categoryName,
        plan: found.plan,
      });
    },
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const dataPlanAudit = useMemo(
    () => auditEntriesToDataPlanEntries(auditEntries),
    [auditEntries]
  );

  /* ----------------------------- Mutations ---------------------------- */

  const handleCreateNetwork = (name: string) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkTreeMutation(cats, (tree) => ({
          ...tree,
          [name]: [],
        })),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "network",
          name,
          name,
          name,
          `Network "${name}" created`
        ),
      },
      actor,
    });
    selectNetwork(name);
    setToast({ kind: "success", text: `${name} created.` });
  };

  const handleRenameNetwork = (oldName: string, newName: string) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkTreeMutation(cats, (tree) => {
          const next: Record<string, typeof tree[string]> = {};
          for (const [key, value] of Object.entries(tree)) {
            next[key === oldName ? newName : key] = value;
          }
          return next;
        }),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "network",
          newName,
          newName,
          newName,
          `Network renamed from "${oldName}" to "${newName}"`
        ),
      },
      actor,
    });
    if (filters.network === oldName || !filters.network) {
      selectNetwork(newName);
    }
    setToast({ kind: "success", text: `${newName} renamed.` });
  };

  const handleDeleteNetwork = (name: string) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkTreeMutation(cats, (tree) => {
          const next = { ...tree };
          delete next[name];
          return next;
        }),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "network",
          name,
          name,
          name,
          `Network "${name}" deleted`
        ),
      },
      actor,
    });
    if (filters.network === name) selectNetwork("");
    setToast({ kind: "success", text: `${name} deleted.` });
  };

  const handleCreateCategory = (networkName: string, name: string) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) => [
          ...list,
          { name, plans: [] },
        ]),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "category",
          name,
          name,
          networkName,
          `Category "${name}" created on ${networkName}`
        ),
      },
      actor,
    });
    setToast({ kind: "success", text: `${name} added.` });
  };

  const handleRenameCategory = (
    networkName: string,
    oldName: string,
    newName: string
  ) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) =>
            c.name === oldName ? { ...c, name: newName } : c
          )
        ),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "category",
          newName,
          newName,
          networkName,
          `Category renamed from "${oldName}" to "${newName}" on ${networkName}`
        ),
      },
      actor,
    });
    setToast({ kind: "success", text: `${newName} renamed.` });
  };

  const handleDeleteCategory = (
    networkName: string,
    categoryName: string
  ) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.filter((c) => c.name !== categoryName)
        ),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "category",
          categoryName,
          categoryName,
          networkName,
          `Category "${categoryName}" removed from ${networkName}`
        ),
      },
      actor,
    });
    setToast({ kind: "success", text: `${categoryName} deleted.` });
  };

  const handleMoveCategory = (
    networkName: string,
    categoryName: string,
    direction: "up" | "down"
  ) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) => {
          const idx = list.findIndex((c) => c.name === categoryName);
          if (idx === -1) return list;
          const target = direction === "up" ? idx - 1 : idx + 1;
          if (target < 0 || target >= list.length) return list;
          const next = [...list];
          [next[idx], next[target]] = [next[target], next[idx]];
          return next;
        }),
      audit: {
        action: CATALOG_ACTIONS.CATEGORY_REORDER,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "category",
          categoryName,
          categoryName,
          networkName,
          `Category "${categoryName}" moved ${direction}`
        ),
      },
      actor,
    });
  };

  const handleSavePlan = (
    networkName: string,
    categoryName: string,
    plan: Plan,
    mode: "create" | "edit"
  ) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) => {
            if (c.name !== categoryName) return c;
            if (mode === "create")
              return { ...c, plans: [...c.plans, plan] };
            return {
              ...c,
              plans: c.plans.map((p) => (p.id === plan.id ? plan : p)),
            };
          })
        ),
      audit: {
        action:
          mode === "create"
            ? CATALOG_ACTIONS.PLAN_CREATE
            : CATALOG_ACTIONS.PLAN_UPDATE,
        resourceType: CATALOG_RESOURCE_TYPES.PLAN,
        resourceId: plan.id,
        metadata: auditMeta(
          "plan",
          plan.id,
          plan.name,
          networkName,
          mode === "create"
            ? `Plan "${plan.name}" added to ${categoryName} on ${networkName}`
            : `Plan "${plan.name}" updated in ${categoryName} on ${networkName}`
        ),
      },
      actor,
    });
    setToast({
      kind: "success",
      text: `${plan.name} ${mode === "create" ? "created" : "updated"}.`,
    });
  };

  const handleDeletePlan = (
    networkName: string,
    categoryName: string,
    planId: string,
    planName: string
  ) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) =>
            c.name === categoryName
              ? { ...c, plans: c.plans.filter((p) => p.id !== planId) }
              : c
          )
        ),
      audit: {
        action: CATALOG_ACTIONS.PLAN_DELETE,
        resourceType: CATALOG_RESOURCE_TYPES.PLAN,
        resourceId: planId,
        metadata: auditMeta(
          "plan",
          planId,
          planName,
          networkName,
          `Plan "${planName}" deleted from ${categoryName} on ${networkName}`
        ),
      },
      actor,
    });
    setToast({ kind: "success", text: `${planName} deleted.` });
  };

  const handleDuplicatePlan = (
    networkName: string,
    categoryName: string,
    source: Plan,
    existingPlanIds: string[]
  ) => {
    if (!actor) return;
    const baseName = `${source.name} Copy`;
    let candidateName = baseName;
    let suffix = 2;
    let newId = dataPlanIdFor(candidateName, networkName);
    while (existingPlanIds.includes(newId)) {
      candidateName = `${baseName} ${suffix}`;
      newId = dataPlanIdFor(candidateName, networkName);
      suffix += 1;
    }

    const copy: Plan = {
      ...source,
      id: newId,
      name: candidateName,
      active: false,
      statusHistory: [],
    };

    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) =>
            c.name === categoryName
              ? { ...c, plans: [...c.plans, copy] }
              : c
          )
        ),
      audit: {
        action: CATALOG_ACTIONS.PLAN_CREATE,
        resourceType: CATALOG_RESOURCE_TYPES.PLAN,
        resourceId: newId,
        metadata: auditMeta(
          "plan",
          newId,
          candidateName,
          networkName,
          `Plan "${source.name}" duplicated as "${candidateName}"`
        ),
      },
      actor,
    });
    setToast({ kind: "success", text: `${candidateName} created.` });
  };

  const handleTogglePlanActive = (networkName: string, planId: string) => {
    if (!actor || !selectedNetwork) return;
    const plan = selectedNetwork.categories
      .flatMap((c) => c.plans)
      .find((p) => p.id === planId);
    if (!plan) return;

    const nextActive = plan.active === false;
    const nowIso = new Date().toISOString();
    const adminEmail = actor.email;

    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) => ({
            ...c,
            plans: c.plans.map((p) => {
              if (p.id !== planId) return p;
              return {
                ...p,
                active: nextActive,
                statusHistory: [
                  ...(p.statusHistory ?? []),
                  {
                    timestamp: nowIso,
                    admin: adminEmail,
                    status: nextActive ? "active" : "inactive",
                  },
                ],
              };
            }),
          }))
        ),
      audit: {
        action: CATALOG_ACTIONS.PLAN_TOGGLE,
        resourceType: CATALOG_RESOURCE_TYPES.PLAN,
        resourceId: planId,
        metadata: auditMeta(
          "plan",
          planId,
          plan.name,
          networkName,
          `Plan "${plan.name}" ${nextActive ? "enabled" : "disabled"}`
        ),
      },
      actor,
    });
  };

  const handleMovePlan = (
    networkName: string,
    categoryName: string,
    planId: string,
    direction: "up" | "down"
  ) => {
    if (!actor) return;
    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) => {
            if (c.name !== categoryName) return c;
            const idx = c.plans.findIndex((p) => p.id === planId);
            if (idx === -1) return c;
            const target = direction === "up" ? idx - 1 : idx + 1;
            if (target < 0 || target >= c.plans.length) return c;
            const next = [...c.plans];
            [next[idx], next[target]] = [next[target], next[idx]];
            return { ...c, plans: next };
          })
        ),
      audit: {
        action: CATALOG_ACTIONS.PLAN_REORDER,
        resourceType: CATALOG_RESOURCE_TYPES.PLAN,
        resourceId: planId,
        metadata: auditMeta(
          "plan",
          planId,
          planId,
          networkName,
          `Plan moved ${direction} in ${categoryName}`
        ),
      },
      actor,
    });
  };

  const handleBulkToggle = (
    networkName: string,
    ids: string[],
    enable: boolean
  ) => {
    if (!actor) return;
    const nowIso = new Date().toISOString();
    const adminEmail = actor.email;
    const idSet = new Set(ids);

    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) => ({
            ...c,
            plans: c.plans.map((p) => {
              if (!idSet.has(p.id)) return p;
              return {
                ...p,
                active: enable,
                statusHistory: [
                  ...(p.statusHistory ?? []),
                  {
                    timestamp: nowIso,
                    admin: adminEmail,
                    status: enable ? "active" : "inactive",
                  },
                ],
              };
            }),
          }))
        ),
      audit: {
        action: CATALOG_ACTIONS.PLAN_TOGGLE,
        resourceType: CATALOG_RESOURCE_TYPES.NETWORK,
        resourceId: networkName,
        metadata: auditMeta(
          "network",
          networkName,
          networkName,
          networkName,
          `${enable ? "Enabled" : "Disabled"} ${ids.length} plan${
            ids.length === 1 ? "" : "s"
          }`
        ),
      },
      actor,
    });

    setSelectedPlanIds([]);
    setToast({
      kind: "success",
      text: `${ids.length} plan${ids.length === 1 ? "" : "s"} ${
        enable ? "enabled" : "disabled"
      }.`,
    });
  };

  const handleImportPlans = (
    networkName: string,
    categoryName: string,
    rows: ImportRow[]
  ) => {
    if (!actor) return;
    const newPlans: Plan[] = rows.map((row) => ({
      id: dataPlanIdFor(row.name, networkName),
      name: row.name,
      description: row.description || undefined,
      price: row.price,
      validity: row.validity || undefined,
      typeTag: row.typeTag || undefined,
      active: true,
      statusHistory: [],
    }));

    applyCatalogMutation({
      transform: (cats) =>
        applyNetworkMutation(cats, networkName, (list) =>
          list.map((c) =>
            c.name === categoryName
              ? { ...c, plans: [...c.plans, ...newPlans] }
              : c
          )
        ),
      audit: {
        action: CATALOG_ACTIONS.PLAN_CREATE,
        resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
        resourceId: "data",
        metadata: auditMeta(
          "category",
          categoryName,
          categoryName,
          networkName,
          `${rows.length} plan${
            rows.length === 1 ? "" : "s"
          } imported into ${categoryName}`
        ),
      },
      actor,
    });

    setToast({
      kind: "success",
      text: `${rows.length} plan${rows.length === 1 ? "" : "s"} imported.`,
    });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = dataPlansToCsv(networks);
    downloadCsv(
      `atlas-data-plans.k-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  const headerMeta = useMemo(() => {
    const totalNetworks = networks.length;
    const totalCategories = networks.reduce(
      (s, n) => s + n.categories.length,
      0
    );
    const totalPlans = networks.reduce(
      (s, n) => s + n.categories.reduce((t, c) => t + c.plans.length, 0),
      0
    );
    const activePlans = networks.reduce(
      (s, n) =>
        s +
        n.categories.reduce(
          (t, c) => t + c.plans.filter((p) => p.active !== false).length,
          0
        ),
      0
    );

    return (
      <>
        <span>
          {totalNetworks} network{totalNetworks === 1 ? "" : "s"}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {totalCategories} categor
          {totalCategories === 1 ? "y" : "ies"}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {totalPlans} plan{totalPlans === 1 ? "" : "s"}
        </span>
        <span aria-hidden="true">·</span>
        <span>{activePlans} active</span>
      </>
    );
  }, [networks]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Data Plans"
        description="Manage data bundle categories and plans across all networks."
        meta={headerMeta}
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Can permission={PERMISSIONS.DATA_PLANS_MANAGE}>
              <Button
                size="sm"
                onClick={() => setModal({ kind: "network-create" })}
              >
                Add network
              </Button>
            </Can>
          </>
        }
      />

      {loading ? (
        <DataPlansSkeleton />
      ) : networks.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No networks yet"
            description="Add your first network to start building a data plan catalog."
            action={
              <Can permission={PERMISSIONS.DATA_PLANS_MANAGE}>
                <Button
                  size="sm"
                  onClick={() => setModal({ kind: "network-create" })}
                >
                  Add network
                </Button>
              </Can>
            }
          />
        </div>
      ) : (
        <>
          <DataPlanSummaryCards
            networks={networks}
            activeFilter={summaryFilter}
            onFilterAll={() => setFilters({ filter: "all" })}
            onFilterLowMargin={() => setFilters({ filter: "low-margin" })}
            onFilterInactive={() => setFilters({ filter: "inactive" })}
          />

          <DataPlansToolbar
            search={filters.q}
            onSearchChange={(value) => setFilters({ q: value })}
            selectedCount={selectedPlanIds.length}
            onEnable={() =>
              setConfirm({ kind: "bulk", enable: true, ids: selectedPlanIds })
            }
            onDisable={() =>
              setConfirm({ kind: "bulk", enable: false, ids: selectedPlanIds })
            }
            onClearSelection={() => setSelectedPlanIds([])}
            onExport={handleExport}
            onImport={() => {
              if (!selectedNetwork) return;
              const firstCategory = selectedNetwork.categories[0];
              if (!firstCategory) {
                setToast({
                  kind: "error",
                  text: "Add a category to this network first.",
                });
                return;
              }
              setModal({
                kind: "import",
                networkName: selectedNetwork.name,
                categoryName: firstCategory.name,
              });
            }}
          />

          <div className="flex flex-col gap-6 lg:flex-row">
            <NetworkSidebar
              networks={networks}
              selectedNetworkId={selectedNetwork?.id ?? ""}
              onSelectNetwork={(id) => {
                const net = networks.find((n) => n.id === id);
                if (net) selectNetwork(net.name);
              }}
              onAddNetwork={() => setModal({ kind: "network-create" })}
            />

            <div className="min-w-0 flex-1 space-y-4">
              {selectedNetwork && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {selectedNetwork.name}
                      </h2>
                      <span className="rounded-full bg-info-100 px-2 py-0.5 text-xs font-medium text-info-700 dark:bg-info-900/40 dark:text-info-300">
                        {selectedNetwork.categories.length} categor
                        {selectedNetwork.categories.length === 1
                          ? "y"
                          : "ies"}
                      </span>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        {selectedNetwork.categories.reduce(
                          (s, c) => s + c.plans.length,
                          0
                        )}{" "}
                        plan
                        {selectedNetwork.categories.reduce(
                          (s, c) => s + c.plans.length,
                          0
                        ) === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>
                    <Can permission={PERMISSIONS.DATA_PLANS_MANAGE}>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setModal({
                              kind: "network-rename",
                              networkName: selectedNetwork.name,
                            })
                          }
                        >
                          Rename network
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setModal({
                              kind: "category-create",
                              networkName: selectedNetwork.name,
                            })
                          }
                        >
                          Add category
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setModal({
                              kind: "network-delete",
                              networkName: selectedNetwork.name,
                              planCount: selectedNetwork.categories.reduce(
                                (s, c) => s + c.plans.length,
                                0
                              ),
                            })
                          }
                        >
                          Delete network
                        </Button>
                      </div>
                    </Can>
                  </div>

                  {filteredCategories.length === 0 ? (
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
                          title="No categories yet"
                          description="Add a category to start grouping plans."
                          action={
                            <Can permission={PERMISSIONS.DATA_PLANS_MANAGE}>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setModal({
                                    kind: "category-create",
                                    networkName: selectedNetwork.name,
                                  })
                                }
                              >
                                Add category
                              </Button>
                            </Can>
                          }
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCategories.map((category, index) => (
                        <CategorySection
                          key={category.id}
                          category={category}
                          onEditCategory={(cat) =>
                            setModal({
                              kind: "category-rename",
                              networkName: selectedNetwork.name,
                              categoryName: cat.name,
                            })
                          }
                          onDeleteCategory={(cat) =>
                            setConfirm({
                              kind: "category",
                              networkName: selectedNetwork.name,
                              categoryName: cat.name,
                            })
                          }
                          onAddPlan={(categoryId) => {
                            const cat = selectedNetwork.categories.find(
                              (c) => c.id === categoryId
                            );
                            if (!cat) return;
                            setModal({
                              kind: "plan-create",
                              networkName: selectedNetwork.name,
                              categoryName: cat.name,
                            });
                          }}
                          onEditPlan={(plan) => {
                            const cat = selectedNetwork.categories.find((c) =>
                              c.plans.some((p) => p.id === plan.id)
                            );
                            if (!cat) return;
                            setModal({
                              kind: "plan-edit",
                              networkName: selectedNetwork.name,
                              categoryName: cat.name,
                              plan,
                            });
                          }}
                          onDeletePlan={(plan) => {
                            const cat = selectedNetwork.categories.find((c) =>
                              c.plans.some((p) => p.id === plan.id)
                            );
                            if (!cat) return;
                            setConfirm({
                              kind: "plan",
                              networkName: selectedNetwork.name,
                              categoryName: cat.name,
                              plan,
                            });
                          }}
                          onDuplicatePlan={(plan) => {
                            const cat = selectedNetwork.categories.find((c) =>
                              c.plans.some((p) => p.id === plan.id)
                            );
                            if (!cat) return;
                            const allIds =
                              selectedNetwork.categories.flatMap((c) =>
                                c.plans.map((p) => p.id)
                              );
                            handleDuplicatePlan(
                              selectedNetwork.name,
                              cat.name,
                              plan,
                              allIds
                            );
                          }}
                          onTogglePlanActive={(planId) =>
                            handleTogglePlanActive(
                              selectedNetwork.name,
                              planId
                            )
                          }
                          onMovePlan={(planId, direction) => {
                            const cat = selectedNetwork.categories.find((c) =>
                              c.plans.some((p) => p.id === planId)
                            );
                            if (!cat) return;
                            handleMovePlan(
                              selectedNetwork.name,
                              cat.name,
                              planId,
                              direction
                            );
                          }}
                          onMoveCategory={(categoryId, direction) => {
                            const cat = selectedNetwork.categories.find(
                              (c) => c.id === categoryId
                            );
                            if (!cat) return;
                            handleMoveCategory(
                              selectedNetwork.name,
                              cat.name,
                              direction
                            );
                          }}
                          selectedPlanIds={selectedPlanIds}
                          onTogglePlanSelect={(planId) =>
                            setSelectedPlanIds((prev) =>
                              prev.includes(planId)
                                ? prev.filter((id) => id !== planId)
                                : [...prev, planId]
                            )
                          }
                          disableMoveUp={index === 0}
                          disableMoveDown={
                            index === filteredCategories.length - 1
                          }
                          searchActive={
                            debouncedSearch.trim() !== "" ||
                            summaryFilter !== "all"
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <DataPlanAuditPanel entries={dataPlanAudit} />
        </>
      )}

      <NetworkEditModal
        open={modal.kind === "network-create"}
        mode="create"
        existingNames={networks.map((n) => n.name)}
        onClose={() => setModal({ kind: "none" })}
        onConfirm={handleCreateNetwork}
      />

      <NetworkEditModal
        open={modal.kind === "network-rename"}
        mode="rename"
        currentName={modal.kind === "network-rename" ? modal.networkName : ""}
        existingNames={networks.map((n) => n.name)}
        onClose={() => setModal({ kind: "none" })}
        onConfirm={(name) => {
          if (modal.kind !== "network-rename") return;
          handleRenameNetwork(modal.networkName, name);
        }}
      />

      <NetworkDeleteModal
        open={modal.kind === "network-delete"}
        networkName={modal.kind === "network-delete" ? modal.networkName : ""}
        planCount={modal.kind === "network-delete" ? modal.planCount : 0}
        onClose={() => setModal({ kind: "none" })}
        onConfirm={() => {
          if (modal.kind !== "network-delete") return;
          handleDeleteNetwork(modal.networkName);
        }}
      />

      <CategoryEditModal
        open={modal.kind === "category-create"}
        mode="create"
        networkName={modal.kind === "category-create" ? modal.networkName : ""}
        existingNames={
          modal.kind === "category-create"
            ? networks
                .find((n) => n.name === modal.networkName)
                ?.categories.map((c) => c.name) ?? []
            : []
        }
        onClose={() => setModal({ kind: "none" })}
        onConfirm={(name) => {
          if (modal.kind !== "category-create") return;
          handleCreateCategory(modal.networkName, name);
        }}
      />

      <CategoryEditModal
        open={modal.kind === "category-rename"}
        mode="rename"
        networkName={modal.kind === "category-rename" ? modal.networkName : ""}
        currentName={modal.kind === "category-rename" ? modal.categoryName : ""}
        existingNames={
          modal.kind === "category-rename"
            ? networks
                .find((n) => n.name === modal.networkName)
                ?.categories.map((c) => c.name) ?? []
            : []
        }
        onClose={() => setModal({ kind: "none" })}
        onConfirm={(name) => {
          if (modal.kind !== "category-rename") return;
          handleRenameCategory(
            modal.networkName,
            modal.categoryName,
            name
          );
        }}
      />

      <PlanEditModal
        open={modal.kind === "plan-create" || modal.kind === "plan-edit"}
        mode={modal.kind === "plan-edit" ? "edit" : "create"}
        networkName={
          modal.kind === "plan-create" || modal.kind === "plan-edit"
            ? modal.networkName
            : ""
        }
        categoryName={
          modal.kind === "plan-create" || modal.kind === "plan-edit"
            ? modal.categoryName
            : ""
        }
        plan={modal.kind === "plan-edit" ? modal.plan : null}
        existingPlanIds={
          modal.kind === "plan-create" || modal.kind === "plan-edit"
            ? networks
                .find((n) => n.name === modal.networkName)
                ?.categories.flatMap((c) => c.plans.map((p) => p.id)) ?? []
            : []
        }
        onClose={() => setModal({ kind: "none" })}
        onConfirm={(plan, mode) => {
          if (modal.kind !== "plan-create" && modal.kind !== "plan-edit") {
            return;
          }
          handleSavePlan(modal.networkName, modal.categoryName, plan, mode);
        }}
      />

      <ImportPlansModal
        open={modal.kind === "import"}
        networkName={modal.kind === "import" ? modal.networkName : ""}
        categoryName={modal.kind === "import" ? modal.categoryName : ""}
        existingPlanNames={
          modal.kind === "import"
            ? networks
                .find((n) => n.name === modal.networkName)
                ?.categories.flatMap((c) => c.plans.map((p) => p.name)) ?? []
            : []
        }
        onClose={() => setModal({ kind: "none" })}
        onConfirm={(rows) => {
          if (modal.kind !== "import") return;
          handleImportPlans(modal.networkName, modal.categoryName, rows);
        }}
      />

      <ConfirmDialog
        open={confirm.kind === "category"}
        title="Delete category"
        description={
          confirm.kind === "category"
            ? `Delete "${confirm.categoryName}"? Every plan in it will also be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete category"
        danger
        onConfirm={() => {
          if (confirm.kind !== "category") return;
          handleDeleteCategory(confirm.networkName, confirm.categoryName);
          setConfirm({ kind: "none" });
        }}
        onCancel={() => setConfirm({ kind: "none" })}
      />

      <ConfirmDialog
        open={confirm.kind === "plan"}
        title="Delete plan"
        description={
          confirm.kind === "plan"
            ? `Delete "${confirm.plan.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete plan"
        danger
        onConfirm={() => {
          if (confirm.kind !== "plan") return;
          handleDeletePlan(
            confirm.networkName,
            confirm.categoryName,
            confirm.plan.id,
            confirm.plan.name
          );
          setConfirm({ kind: "none" });
        }}
        onCancel={() => setConfirm({ kind: "none" })}
      />

      <ConfirmDialog
        open={confirm.kind === "bulk"}
        title={
          confirm.kind === "bulk" && confirm.enable
            ? "Enable plans"
            : "Disable plans"
        }
        description={
          confirm.kind === "bulk"
            ? `${
                confirm.enable ? "Enable" : "Disable"
              } ${confirm.ids.length} plan${confirm.ids.length === 1 ? "" : "s"}?`
            : ""
        }
        confirmLabel={
          confirm.kind === "bulk" && confirm.enable ? "Enable" : "Disable"
        }
        danger={confirm.kind === "bulk" && !confirm.enable}
        onConfirm={() => {
          if (confirm.kind !== "bulk" || !selectedNetwork) return;
          handleBulkToggle(
            selectedNetwork.name,
            confirm.ids,
            confirm.enable
          );
          setConfirm({ kind: "none" });
        }}
        onCancel={() => setConfirm({ kind: "none" })}
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