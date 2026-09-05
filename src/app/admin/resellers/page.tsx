/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResellerSummaryCards } from "@/components/admin/resellers/reseller-summary-cards";
import { ResellerDetailDrawer } from "@/components/admin/resellers/reseller-detail-drawer";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { formatCurrency } from "@/lib/admin/formatters";
import { Reseller, RESELLER_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/admin/types/reseller";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
  rejected: "neutral",
};

const verificationVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_submitted: "neutral",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "verify" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setResellers(mockResellers);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-reseller-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-reseller-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filteredResellers = resellers.filter((r) => {
    if (search && !r.businessName.toLowerCase().includes(search.toLowerCase()) &&
        !r.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (verificationFilter && r.verificationStatus !== verificationFilter) return false;
    return true;
  });

  // Define columns inside component to access setSelectedReseller
  const baseColumns: Column<Reseller>[] = [
    {
      key: "businessName",
      header: "Business",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
            {r.businessName.charAt(0)}
          </span>
          <div>
            <p className="font-medium">{r.businessName}</p>
            <p className="text-xs text-neutral-500">{r.storeName || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "contact", header: "Contact", cell: (r) => r.email },
    { key: "wallet", header: "Wallet", cell: (r) => formatCurrency(r.walletBalance) },
    { key: "orders", header: "Orders", cell: (r) => r.totalOrders },
    { key: "revenue", header: "Revenue", cell: (r) => formatCurrency(r.totalRevenue) },
    {
      key: "verification",
      header: "Verification",
      cell: (r) => (
        <Badge variant={verificationVariantMap[r.verificationStatus]}>
          {VERIFICATION_STATUS_LABELS[r.verificationStatus]}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Badge variant={statusVariantMap[r.status]}>{RESELLER_STATUS_LABELS[r.status]}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReseller(r);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // Add select column
  const selectColumn: Column<Reseller> = {
    key: "__select__",
    header: "Select",
    cell: (r) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(r.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedIds((prev) => [...prev, r.id]);
          } else {
            setSelectedIds((prev) => prev.filter((id) => id !== r.id));
          }
        }}
        className="h-4 w-4"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  };

  const columns = [selectColumn, ...baseColumns];

  const summaryData = {
    totalResellers: resellers.length,
    activeResellers: resellers.filter((r) => r.status === "active").length,
    pendingVerification: resellers.filter((r) => r.verificationStatus === "pending").length,
    suspendedResellers: resellers.filter((r) => r.status === "suspended").length,
    totalCommissions: resellers.reduce((sum, r) => sum + r.commissionsEarned, 0),
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting resellers as ${format}`);
  };

  const handleSaveView = (name: string) => {
    const filters = { search, statusFilter, verificationFilter };
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setStatusFilter(view.filters.statusFilter || "");
    setVerificationFilter(view.filters.verificationFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for resellers:`, selectedIds);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Resellers"
        description="Manage reseller accounts, verification, wallets, and storefronts."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
              Bulk Actions
            </Button>
          </>
        }
      />

      <ResellerSummaryCards data={summaryData} />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search resellers..."
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
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
        >
          <option value="">All Verification</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="not_submitted">Not Submitted</option>
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

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("suspend"); setShowBulkConfirm(true); }}>Suspend</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("verify"); setShowBulkConfirm(true); }}>Verify</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export Selected</Button>
        </div>
      )}

      <AdminDataTable
        columns={columns}
        data={filteredResellers}
        isLoading={loading}
        rowKey={(r) => r.id}
        onRowClick={(r) => setSelectedReseller(r)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No resellers found."
      />

      <ResellerDetailDrawer reseller={selectedReseller} onClose={() => setSelectedReseller(null)} />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ''}`}
        description={`Are you sure you want to ${bulkAction ?? ''} ${selectedIds.length} resellers?`}
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