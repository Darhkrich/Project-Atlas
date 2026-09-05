/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MerchantSummaryCards } from "@/components/admin/merchants/merchant-summary-cards";
import { MerchantDetailDrawer } from "@/components/admin/merchants/merchant-detail-drawer";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import { formatCurrency } from "@/lib/admin/formatters";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Merchant, MERCHANT_STATUS_LABELS, SUBSCRIPTION_STATUS_LABELS, STORE_STATUS_LABELS, VERIFICATION_STATUS_LABELS, SUBSCRIPTION_PLANS } from "@/lib/admin/types/merchant";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "change_plan" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMerchants(mockMerchants);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-merchant-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-merchant-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filteredMerchants = merchants.filter((m) => {
    if (search && !m.businessName.toLowerCase().includes(search.toLowerCase()) &&
        !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && m.merchantStatus !== statusFilter) return false;
    if (planFilter && m.subscription.planId !== planFilter) return false;
    return true;
  });

  const baseColumns: Column<Merchant>[] = [
    {
      key: "businessName",
      header: "Merchant",
      cell: (m) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
            {m.businessName.charAt(0)}
          </span>
          <div>
            <p className="font-medium">{m.businessName}</p>
            <p className="text-xs text-neutral-500">{m.storeConfig.storeName}</p>
          </div>
        </div>
      ),
    },
    { key: "subdomain", header: "Store URL", cell: (m) => m.storeConfig.subdomain },
    {
      key: "plan",
      header: "Plan",
      cell: (m) => (
        <span className="text-sm">{SUBSCRIPTION_PLANS.find((p) => p.value === m.subscription.planId)?.label}</span>
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
    { key: "orders", header: "Orders (30d)", cell: (m) => m.totalOrders },
    { key: "revenue", header: "Revenue (30d)", cell: (m) => formatCurrency(m.totalRevenue) },
    {
      key: "storeStatus",
      header: "Store",
      cell: (m) => (
        <Badge variant={storeStatusVariant[m.storeStatus]}>{STORE_STATUS_LABELS[m.storeStatus]}</Badge>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      cell: (m) => (
        <Badge variant={verificationVariant[m.verificationStatus]}>{VERIFICATION_STATUS_LABELS[m.verificationStatus]}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (m) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMerchant(m); }}>View</Button>
      ),
    },
  ];

  const selectColumn: Column<Merchant> = {
    key: "__select__",
    header: "Select",
    cell: (m) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(m.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedIds((prev) => [...prev, m.id]);
          } else {
            setSelectedIds((prev) => prev.filter((id) => id !== m.id));
          }
        }}
        className="h-4 w-4"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  };

  const columns = [selectColumn, ...baseColumns];

  const summaryData = {
    totalMerchants: merchants.length,
    activeSubscriptions: merchants.filter((m) => m.subscription.status === "active").length,
    pendingSubscriptions: merchants.filter((m) => m.subscription.status === "past_due").length,
    totalSales: merchants.reduce((sum, m) => sum + m.totalRevenue, 0),
    liveStores: merchants.filter((m) => m.storeStatus === "live").length,
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting merchants as ${format}`);
  };

  const handleSaveView = (name: string) => {
    const filters = { search, statusFilter, planFilter };
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setStatusFilter(view.filters.statusFilter || "");
    setPlanFilter(view.filters.planFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for merchants:`, selectedIds);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Merchants"
        description="Manage e-commerce merchants, subscriptions, and store configurations."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
              Bulk Actions
            </Button>
          </>
        }
      />

      <MerchantSummaryCards data={summaryData} />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search merchants..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="">All Plans</option>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <option key={plan.value} value={plan.value}>{plan.label}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("suspend"); setShowBulkConfirm(true); }}>Suspend</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("change_plan"); setShowBulkConfirm(true); }}>Change Plan</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export Selected</Button>
        </div>
      )}

      <AdminDataTable
        columns={columns}
        data={filteredMerchants}
        isLoading={loading}
        rowKey={(m) => m.id}
        onRowClick={(m) => setSelectedMerchant(m)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No merchants found."
      />

      <MerchantDetailDrawer merchant={selectedMerchant} onClose={() => setSelectedMerchant(null)} />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ''}`}
        description={`Are you sure you want to ${bulkAction ?? ''} ${selectedIds.length} merchants?`}
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