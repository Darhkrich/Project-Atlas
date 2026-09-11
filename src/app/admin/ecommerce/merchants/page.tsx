/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MerchantSummaryCards } from "@/components/admin/merchants/merchant-summary-cards";
import { MerchantFilters } from "@/components/admin/merchants/merchant-filters";
import { MerchantDetailDrawer } from "@/components/admin/merchants/merchant-detail-drawer";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  Merchant,
  MERCHANT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  STORE_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  SUBSCRIPTION_PLANS,
} from "@/lib/admin/types/merchant";
import { cn } from "@/lib/utils";

const merchantStatusVariant: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
};

const subscriptionStatusVariant: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  active: "success",
  past_due: "warning",
  cancelled: "neutral",
  expired: "neutral",
};

const storeStatusVariant: Record<string, "success" | "danger"> = {
  live: "success",
  disabled: "danger",
};

const verificationVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_submitted: "neutral",
};

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const [filters, setFilters] = useState<{
    search: string;
    merchantStatus: string;
    subscriptionStatus: string;
    storeStatus: string;
    plan: string;
  }>({
    search: "",
    merchantStatus: "",
    subscriptionStatus: "",
    storeStatus: "",
    plan: "",
  });

  // Columns inside component to access setSelectedMerchant
  const allColumns: Column<Merchant>[] = [
    {
      key: "__select__",
      header: "Select",
      cell: (m) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(m.id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds((prev) => [...prev, m.id]);
            else setSelectedIds((prev) => prev.filter((id) => id !== m.id));
          }}
          className="h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "businessName",
      header: "Merchant",
      cell: (m) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            {m.businessName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{m.businessName}</p>
            <p className="text-xs text-neutral-500">
              {m.storeConfig.storeName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (m) => (
        <div className="text-xs">
          <p>{m.contactPerson}</p>
          <p className="text-neutral-500">{m.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (m) => (
        <Badge variant="info">
          {SUBSCRIPTION_PLANS.find((p) => p.value === m.subscription.planId)
            ?.label || m.subscription.planId}
        </Badge>
      ),
    },
    {
      key: "subStatus",
      header: "Subscription",
      cell: (m) => (
        <Badge variant={subscriptionStatusVariant[m.subscription.status]}>
          {SUBSCRIPTION_STATUS_LABELS[m.subscription.status]}
        </Badge>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      cell: (m) => m.totalOrders,
    },
    {
      key: "revenue",
      header: "Revenue",
      cell: (m) => formatCurrency(m.totalRevenue),
    },
    {
      key: "wallet",
      header: "Wallet",
      cell: (m) => formatCurrency(m.walletBalance ?? 0),
    },
    {
      key: "storeStatus",
      header: "Store",
      cell: (m) => (
        <Badge variant={storeStatusVariant[m.storeStatus]}>
          {STORE_STATUS_LABELS[m.storeStatus]}
        </Badge>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      cell: (m) => (
        <Badge variant={verificationVariant[m.verificationStatus]}>
          {VERIFICATION_STATUS_LABELS[m.verificationStatus]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (m) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMerchant(m);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // Initialize visible columns
  useEffect(() => {
    setVisibleColumns(
      allColumns.map((c) => c.key).filter((k) => k !== "__select__")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setMerchants(mockMerchants);
      setLoading(false);
    }, 500);
  }, []);

  // Load saved views
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-merchant-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-merchant-views", JSON.stringify(savedViews));
  }, [savedViews]);

  // Filtered merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      if (
        filters.search &&
        !m.businessName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !m.email.toLowerCase().includes(filters.search.toLowerCase()) &&
        !m.contactPerson.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.merchantStatus && m.merchantStatus !== filters.merchantStatus)
        return false;
      if (
        filters.subscriptionStatus &&
        m.subscription.status !== filters.subscriptionStatus
      )
        return false;
      if (filters.storeStatus && m.storeStatus !== filters.storeStatus)
        return false;
      if (filters.plan && m.subscription.planId !== filters.plan) return false;
      return true;
    });
  }, [merchants, filters]);

  // Display columns
  const displayColumns = allColumns.filter(
    (c) => c.key === "__select__" || visibleColumns.includes(c.key)
  );

  // Summary data
  const summaryData = {
    totalMerchants: merchants.length,
    activeSubscriptions: merchants.filter(
      (m) => m.subscription.status === "active"
    ).length,
    pendingSubscriptions: merchants.filter(
      (m) => m.subscription.status === "past_due"
    ).length,
    totalSales: merchants.reduce((sum, m) => sum + m.totalRevenue, 0),
    liveStores: merchants.filter((m) => m.storeStatus === "live").length,
    suspendedMerchants: merchants.filter(
      (m) => m.merchantStatus === "suspended"
    ).length,
  };

  // Handlers
  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, merchantStatus: status }));
    setPage(1);
  };

  const filterBySubscription = (status: string) => {
    setFilters((prev) => ({ ...prev, subscriptionStatus: status }));
    setPage(1);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export merchants as ${format}`);
  };

  const handleSaveView = (name: string) => {
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleChangePlan = (
    id: string,
    planId: Merchant["subscription"]["planId"]
  ) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, subscription: { ...m.subscription, planId } }
          : m
      )
    );
    if (selectedMerchant && selectedMerchant.id === id) {
      setSelectedMerchant((prev) =>
        prev
          ? { ...prev, subscription: { ...prev.subscription, planId } }
          : prev
      );
    }
  };

  const handleToggleStatus = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              merchantStatus:
                m.merchantStatus === "active"
                  ? ("suspended" as const)
                  : ("active" as const),
            }
          : m
      )
    );
  };

  const handleToggleStore = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              storeStatus:
                m.storeStatus === "live"
                  ? ("disabled" as const)
                  : ("live" as const),
            }
          : m
      )
    );
  };

  const handleSendNotification = (
    id: string,
    channel: string,
    message: string
  ) => {
    console.log(`Sent ${channel} to ${id}: ${message}`);
  };

  const handleBulkAction = () => {
    if (bulkAction === "suspend") {
      setMerchants((prev) =>
        prev.map((m) =>
          selectedIds.includes(m.id)
            ? { ...m, merchantStatus: "suspended" as const }
            : m
        )
      );
    } else if (bulkAction === "export") {
      console.log(`Export selected merchants:`, selectedIds);
    }
    setSelectedIds([]);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      merchantStatus: "",
      subscriptionStatus: "",
      storeStatus: "",
      plan: "",
    });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Merchants"
        description="Manage e-commerce merchants, subscriptions, and store configurations."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <MerchantSummaryCards
        data={summaryData}
        onFilterAll={() => filterByStatus("")}
        onFilterActive={() => filterByStatus("active")}
        onFilterPastDue={() => filterBySubscription("past_due")}
        onFilterSuspended={() => filterByStatus("suspended")}
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <MerchantFilters
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("suspend");
                setShowBulkConfirm(true);
              }}
            >
              <AtlasIcon name="x-circle" className="mr-1 h-3.5 w-3.5" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("export");
                setShowBulkConfirm(true);
              }}
            >
              Export Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">
            {filteredMerchants.length} merchant
            {filteredMerchants.length === 1 ? "" : "s"}
            {Object.values(filters).some((v) => v) ? " (filtered)" : ""}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Column visibility */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500">Columns:</span>
        {allColumns
          .filter((c) => c.key !== "__select__" && c.key !== "actions")
          .map((col) => (
            <label key={col.key} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={(e) => {
                  if (e.target.checked)
                    setVisibleColumns((prev) => [...prev, col.key]);
                  else
                    setVisibleColumns((prev) =>
                      prev.filter((k) => k !== col.key)
                    );
                }}
                className="h-3 w-3"
              />
              {col.header}
            </label>
          ))}
      </div>

      {/* Table */}
      <AdminDataTable
        columns={displayColumns}
        data={filteredMerchants}
        isLoading={loading}
        rowKey={(m) => m.id}
        onRowClick={(m) => setSelectedMerchant(m)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No merchants found."
      />

      {/* Detail drawer */}
      <MerchantDetailDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        onChangePlan={handleChangePlan}
        onToggleStatus={handleToggleStatus}
        onToggleStore={handleToggleStore}
        onSendNotification={handleSendNotification}
      />

      {/* Bulk confirmation */}
      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} merchant${
          selectedIds.length === 1 ? "" : "s"
        }?`}
        confirmLabel="Confirm"
        danger={bulkAction === "suspend"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}