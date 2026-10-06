/* eslint-disable @next/next/no-location-assign-relative-destination */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import type {
  Provider,
  ProviderCapability,
  ProviderStatus,
  ProviderType,
} from "@/lib/admin/types/provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import {
  ProvidersSummary,
  type ProviderSummaryFilter,
} from "@/components/admin/providers/providers-summary";
import {
  ProviderFilters,
  type ProviderFilterValues,
} from "@/components/admin/providers/provider-filters";
import { ProvidersToolbar } from "@/components/admin/providers/providers-toolbar";
import { ProviderCard } from "@/components/admin/providers/provider-card";
import { ProviderHealthAlert } from "@/components/admin/providers/provider-health-alert";
import {
  AddProviderDialog,
  type AddProviderDraft,
  MaintenanceDialog,
} from "@/components/admin/providers/provider-modals";
import { useProviders } from "@/lib/admin/hooks/use-providers";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { providersToCsv } from "@/lib/admin/providers/csv-export";
import { providerOperationalState } from "@/lib/admin/providers/state";
import { affectedPlans } from "@/lib/admin/providers/impact";
import {
  addProvider,
  setProviderStatus,
  startMaintenance,
  endMaintenance,
  type MutationContext,
} from "@/lib/admin/mock/providers-store";
import type { ProviderEnvironment } from "@/lib/admin/types/provider";
import type { RoutingPriority } from "@/lib/admin/types/provider";

interface ProviderListFilters extends ProviderFilterValues {
  view: ProviderSummaryFilter;
}

const DEFAULT_FILTERS: ProviderListFilters = {
  q: "",
  status: "",
  capability: "",
  type: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

interface BulkConfirm {
  kind: "enable" | "disable" | "maintenance";
  ids: string[];
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<ProvidersSkeleton />}>
      <ProvidersPageInner />
    </Suspense>
  );
}

function ProvidersSkeleton() {
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

function ProvidersPageInner() {
  const admin = useCurrentAdmin();
  const { providers, loading, error } = useProviders();
  const { categories: catalog } = useCatalog();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<ProviderListFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState<Provider | null>(
    null
  );
  const [bulkConfirm, setBulkConfirm] = useState<BulkConfirm | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const mutationCtx: MutationContext = useMemo(
    () => ({
      actor: admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    }),
    [admin]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return providers.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.status && p.status !== filters.status) return false;
      if (
        filters.capability &&
        !p.services.some((s) => s.capability === filters.capability)
      ) {
        return false;
      }
      if (filters.type && p.type !== filters.type) return false;
      if (filters.view !== "all") {
        const state = providerOperationalState(p);
        if (
          filters.view === "attention" &&
          state.kind !== "impaired" &&
          state.kind !== "down"
        ) {
          return false;
        }
        if (
          filters.view === "paused" &&
          state.kind !== "disabled" &&
          state.kind !== "maintenance"
        ) {
          return false;
        }
      }
      return true;
    });
  }, [providers, debouncedSearch, filters]);

  const affectedCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of providers) {
      map.set(p.id, affectedPlans(p, catalog).length);
    }
    return map;
  }, [providers, catalog]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleAdd = (draft: AddProviderDraft) => {
    const now = new Date().toISOString();
    const provider: Provider = {
      id: `prv-${crypto.randomUUID()}`,
      name: draft.name,
      code: draft.code,
      type: draft.type,
      status: "disabled",
      healthStatus: "unknown",
      country: draft.country,
      currency: draft.currency,
      baseUrl: draft.baseUrl || undefined,
      apiVersion: draft.apiVersion || undefined,
      environment: draft.environment as ProviderEnvironment,
      priority: draft.priority as RoutingPriority,
      createdAt: now,
      updatedAt: now,
      lastHealthCheck: now,
      averageResponseTime: 0,
      successRate: 0,
      transactionCountToday: 0,
      services: [],
      credentials: { hasApiKey: false, hasSecret: false, accountId: "" },
      configuration: {
        timeout: draft.timeout,
        retryAttempts: draft.retryAttempts,
        healthCheckInterval: draft.healthCheckInterval,
        webhookEnabled: draft.webhookEnabled,
        statusPollingEnabled: draft.statusPollingEnabled,
      },
      failover: {
        enabled: false,
        triggerFailureRate: 10,
        triggerResponseTime: 3000,
        triggerConsecutiveFailures: 3,
      },
      sla: {
        targetUptime: draft.slaTargetUptime,
        targetLatencyMs: draft.slaTargetLatencyMs,
        targetSuccessRate: draft.slaTargetSuccessRate,
      },
    };
    addProvider(provider, mutationCtx);
    setToast({ kind: "success", text: `${provider.name} created (disabled).` });
  };

  const handleToggleStatus = (provider: Provider) => {
    const next: ProviderStatus =
      provider.status === "enabled" ? "disabled" : "enabled";
    setProviderStatus(provider.id, next, mutationCtx);
    setToast({
      kind: "success",
      text: `${provider.name} ${next === "enabled" ? "enabled" : "disabled"}.`,
    });
  };

  const handleEndMaintenance = (provider: Provider) => {
    endMaintenance(provider.id, mutationCtx);
    setToast({ kind: "success", text: `${provider.name} back in routing.` });
  };

  const handleMaintenanceSave = (input: {
    until: string;
    reason: string;
  }) => {
    if (!maintenanceTarget) return;
    startMaintenance(maintenanceTarget.id, input, mutationCtx);
    setToast({
      kind: "success",
      text: `${maintenanceTarget.name} set to maintenance.`,
    });
    setMaintenanceTarget(null);
  };

  const handleBulkConfirm = () => {
    if (!bulkConfirm) return;
    const ctx = { ...mutationCtx, reason: `Bulk ${bulkConfirm.kind}` };
    for (const id of bulkConfirm.ids) {
      if (bulkConfirm.kind === "enable") {
        setProviderStatus(id, "enabled", ctx);
      } else if (bulkConfirm.kind === "disable") {
        setProviderStatus(id, "disabled", ctx);
      } else {
        startMaintenance(
          id,
          {
            until: new Date(Date.now() + 60 * 60_000).toISOString(),
            reason: "Bulk maintenance window",
          },
          ctx
        );
      }
    }
    setToast({
      kind: "success",
      text: `${bulkConfirm.ids.length} provider${
        bulkConfirm.ids.length === 1 ? "" : "s"
      } updated.`,
    });
    setSelectedIds([]);
    setBulkConfirm(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = providersToCsv(filtered);
    downloadCsv(
      `atlas-providers-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  const headerMeta = useMemo(() => {
    let attention = 0;
    let paused = 0;
    let transactions = 0;
    for (const p of providers) {
      const s = providerOperationalState(p);
      if (s.kind === "impaired" || s.kind === "down") attention += 1;
      else if (s.kind === "disabled" || s.kind === "maintenance") paused += 1;
      transactions += p.transactionCountToday;
    }
    return (
      <>
        <span>{providers.length} providers</span>
        <span aria-hidden="true">{"\u00B7"}</span>
        <span>{attention} need attention</span>
        <span aria-hidden="true">{"\u00B7"}</span>
        <span>{paused} paused</span>
        <span aria-hidden="true">{"\u00B7"}</span>
        <span>{transactions.toLocaleString()} transactions today</span>
      </>
    );
  }, [providers]);

  const selectedProviders = providers.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Providers"
        description="Service providers, fulfillment connections, routing, and provider health."
        meta={headerMeta}
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add provider
              </Button>
            </Can>
          </>
        }
      />

      {loading ? (
        <ProvidersSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200">
          {error}
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No providers yet"
            description="Add your first provider to start routing services through it."
            action={
              <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  Add provider
                </Button>
              </Can>
            }
          />
        </div>
      ) : (
        <>
          <ProvidersSummary
            providers={providers}
            activeFilter={filters.view}
            onFilterAll={() => setFilters({ view: "all", status: "" })}
            onFilterAttention={() =>
              setFilters({ view: "attention", status: "" })
            }
            onFilterPaused={() => setFilters({ view: "paused", status: "" })}
          />

          <ProviderHealthAlert providers={providers} />

          <ProviderFilters
            value={filters}
            onChange={(patch) => setFilters(patch)}
            onClear={clearFilters}
            hasActive={hasActive}
            searchInputRef={searchInputRef}
          />

          <ProvidersToolbar
            selectedCount={selectedIds.length}
            onEnable={() =>
              setBulkConfirm({ kind: "enable", ids: selectedIds })
            }
            onDisable={() =>
              setBulkConfirm({ kind: "disable", ids: selectedIds })
            }
            onMaintenance={() =>
              setBulkConfirm({ kind: "maintenance", ids: selectedIds })
            }
            onClearSelection={() => setSelectedIds([])}
            onExport={handleExport}
            onAddProvider={() => setAddOpen(true)}
          />

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing {filtered.length} of {providers.length} provider
            {providers.length === 1 ? "" : "s"}
            {hasActive ? " (filtered)" : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <EmptyState
                variant="no_results"
                title="No providers match these filters"
                description="Try a different search or clear the filters."
                action={
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <ul
              role="list"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((provider) => (
                <li key={provider.id}>
                  <ProviderCard
                    provider={provider}
                    isSelected={selectedIds.includes(provider.id)}
                    onToggleSelect={() => handleToggleSelect(provider.id)}
                    onTest={() => {
                      window.location.href = `/admin/providers/${provider.id}?tab=health`;
                    }}
                    onToggleStatus={() => handleToggleStatus(provider)}
                    onSetMaintenance={() => setMaintenanceTarget(provider)}
                    onEndMaintenance={() => handleEndMaintenance(provider)}
                    affectedPlanCount={affectedCounts.get(provider.id) ?? 0}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <AddProviderDialog
        open={addOpen}
        existingCodes={providers.map((p) => p.code)}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
      />

      <MaintenanceDialog
        open={maintenanceTarget !== null}
        provider={
          maintenanceTarget ?? {
            id: "",
            name: "",
            code: "",
            type: "api",
            status: "enabled",
            healthStatus: "unknown",
            country: "Ghana",
            currency: "GHS",
            environment: "production",
            priority: "primary",
            createdAt: "",
            updatedAt: "",
            lastHealthCheck: "",
            averageResponseTime: 0,
            successRate: 0,
            transactionCountToday: 0,
            services: [],
            credentials: { hasApiKey: false, hasSecret: false, accountId: "" },
            configuration: {
              timeout: 10,
              retryAttempts: 2,
              healthCheckInterval: 60,
              webhookEnabled: false,
              statusPollingEnabled: false,
            },
            failover: {
              enabled: false,
              triggerFailureRate: 10,
              triggerResponseTime: 3000,
              triggerConsecutiveFailures: 3,
            },
            sla: {
              targetUptime: 99.5,
              targetLatencyMs: 1000,
              targetSuccessRate: 99.0,
            },
          }
        }
        onClose={() => setMaintenanceTarget(null)}
        onConfirm={handleMaintenanceSave}
      />

      <ConfirmDialog
        open={bulkConfirm !== null}
        title={
          bulkConfirm?.kind === "enable"
            ? "Enable providers"
            : bulkConfirm?.kind === "disable"
            ? "Disable providers"
            : "Set maintenance"
        }
        description={
          bulkConfirm
            ? `${bulkConfirm.kind === "enable"
                ? "Enable"
                : bulkConfirm.kind === "disable"
                ? "Disable"
                : "Set maintenance on"} ${bulkConfirm.ids.length} provider${
                bulkConfirm.ids.length === 1 ? "" : "s"
              }?`
            : ""
        }
        confirmLabel={
          bulkConfirm?.kind === "enable"
            ? "Enable"
            : bulkConfirm?.kind === "disable"
            ? "Disable"
            : "Start maintenance"
        }
        danger={bulkConfirm?.kind === "disable"}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkConfirm(null)}
      />

      {selectedProviders.length > 0 && selectedIds.length === 1 && (
        <p className="sr-only" aria-live="polite">
          {selectedProviders[0].name} selected
        </p>
      )}

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