/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProvidersSummary } from "@/components/admin/providers/providers-summary";
import { ProviderFilters } from "@/components/admin/providers/provider-filters";
import { ProvidersToolbar } from "@/components/admin/providers/providers-toolbar";
import { ProviderCard } from "@/components/admin/providers/provider-card";
import { ProviderHealthAlert } from "@/components/admin/providers/provider-health-alert";
import { AddProviderDialog } from "@/components/admin/providers/add-provider-dialog";
import { TestProviderDialog } from "@/components/admin/providers/test-provider-dialog";
import { MaintenanceDialog } from "@/components/admin/providers/maintenance-dialog";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  getProviders,
  addProvider,
  updateProvider,
} from "@/lib/admin/mock/providers-store";
import { Provider } from "@/lib/admin/types/provider";

interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testProvider, setTestProvider] = useState<Provider | null>(null);
  const [maintenanceProvider, setMaintenanceProvider] = useState<Provider | null>(null);
  const [showHealthAlert, setShowHealthAlert] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<"enable" | "disable" | "maintenance" | null>(null);

  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    service: string;
    type: string;
  }>({
    search: "",
    status: "",
    service: "",
    type: "",
  });

  // Load providers
  useEffect(() => {
    setTimeout(() => {
      setProviders(getProviders());
      setLoading(false);
    }, 500);
  }, []);

  const refreshProviders = () => {
    setProviders(getProviders());
  };

  // Audit logging
  const addAudit = (action: string) => {
    setAuditLog((prev) => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        admin: "current_admin@atlas.com",
        action,
      },
      ...prev,
    ]);
  };

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (
        filters.search &&
        !p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !p.code.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.status && p.status !== filters.status) return false;
      if (
        filters.service &&
        !p.services.some((s) => s.serviceCategory === filters.service)
      )
        return false;
      if (filters.type && p.type !== filters.type) return false;
      return true;
    });
  }, [providers, filters]);

  // Handlers
  const handleAddProvider = (newProvider: Provider) => {
    addProvider(newProvider);
    refreshProviders();
    addAudit(`Created provider ${newProvider.name}`);
  };

  const handleToggleStatus = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;
    const newStatus = provider.status === "active" ? "disabled" : "active";
    updateProvider(providerId, {
      status: newStatus,
      enabled: newStatus === "active",
    });
    refreshProviders();
    addAudit(
      `${newStatus === "active" ? "Enabled" : "Disabled"} provider ${provider.name}`
    );
  };

  const handleTestConnection = (provider: Provider) => {
    setTestProvider(provider);
  };

  const handleSetMaintenance = (provider: Provider) => {
    setMaintenanceProvider(provider);
  };

  const handleSaveMaintenance = (
    providerId: string,
    reason: string,
    duration: string
  ) => {
    const provider = providers.find((p) => p.id === providerId);
    updateProvider(providerId, {
      status: "maintenance",
      maintenanceMode: true,
    });
    refreshProviders();
    addAudit(
      `Set maintenance mode for ${provider?.name ?? providerId} — ${reason}`
    );
    setMaintenanceProvider(null);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkActionConfirm = () => {
    if (!bulkAction) return;

    if (bulkAction === "enable") {
      selectedIds.forEach((id) =>
        updateProvider(id, { status: "active", enabled: true })
      );
      addAudit(`Bulk enabled ${selectedIds.length} providers`);
    } else if (bulkAction === "disable") {
      selectedIds.forEach((id) =>
        updateProvider(id, { status: "disabled", enabled: false })
      );
      addAudit(`Bulk disabled ${selectedIds.length} providers`);
    } else if (bulkAction === "maintenance") {
      selectedIds.forEach((id) =>
        updateProvider(id, { status: "maintenance", maintenanceMode: true })
      );
      addAudit(`Bulk set maintenance for ${selectedIds.length} providers`);
    }

    refreshProviders();
    setSelectedIds([]);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  // Export
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export providers as ${format}`);
    addAudit(`Exported providers as ${format}`);
  };

  // Filter shortcuts from summary cards
  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Providers"
          description="Manage service providers, fulfillment connections, routing, and provider health across Atlas."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Providers"
        description="Manage service providers, fulfillment connections, routing, and provider health across Atlas."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHealthAlert(!showHealthAlert)}
            >
              <AtlasIcon name="activity" className="mr-1 h-4 w-4" />
              {showHealthAlert ? "Hide Alerts" : "Show Alerts"}
            </Button>
          </>
        }
      />

      <ProvidersSummary
        providers={providers}
        onFilterAll={() => filterByStatus("")}
        onFilterActive={() => filterByStatus("active")}
        onFilterDegraded={() => filterByStatus("degraded")}
        onFilterOffline={() => filterByStatus("offline")}
      />

      {showHealthAlert && <ProviderHealthAlert providers={providers} />}

      <ProviderFilters onFilterChange={setFilters} />

      <ProvidersToolbar
        selectedCount={selectedIds.length}
        onEnable={() => {
          setBulkAction("enable");
          setShowBulkConfirm(true);
        }}
        onDisable={() => {
          setBulkAction("disable");
          setShowBulkConfirm(true);
        }}
        onMaintenance={() => {
          setBulkAction("maintenance");
          setShowBulkConfirm(true);
        }}
        onClearSelection={() => setSelectedIds([])}
        onExport={handleExport}
        onAddProvider={() => setShowAddDialog(true)}
      />

      {filteredProviders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <AtlasIcon name="server" className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">
            No providers match your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setFilters({ search: "", status: "", service: "", type: "" })}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSelected={selectedIds.includes(provider.id)}
              onToggleSelect={() => toggleSelected(provider.id)}
              onTest={() => handleTestConnection(provider)}
              onToggleStatus={() => handleToggleStatus(provider.id)}
              onSetMaintenance={() => handleSetMaintenance(provider)}
            />
          ))}
        </div>
      )}

      {/* Audit log */}
      {auditLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {auditLog.slice(0, 8).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span>{entry.action}</span>
                  <span className="text-neutral-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {showAddDialog && (
        <AddProviderDialog
          onClose={() => setShowAddDialog(false)}
          onSave={handleAddProvider}
        />
      )}

      {testProvider && (
        <TestProviderDialog
          provider={testProvider}
          onClose={() => setTestProvider(null)}
        />
      )}

      {maintenanceProvider && (
        <MaintenanceDialog
          provider={maintenanceProvider}
          onClose={() => setMaintenanceProvider(null)}
          onSave={handleSaveMaintenance}
        />
      )}

      {/* Bulk confirm */}
      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm Bulk ${
          bulkAction
            ? bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)
            : ""
        }`}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} providers?`}
        confirmLabel="Confirm"
        danger={bulkAction === "disable"}
        onConfirm={handleBulkActionConfirm}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}