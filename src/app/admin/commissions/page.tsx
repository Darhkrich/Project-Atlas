/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  ResellerCommissionSummaryCards,
  PlatformMarginSummaryCards,
} from "@/components/admin/commissions/commission-summary-cards";
import { ResellerCommissionDetailDrawer } from "@/components/admin/commissions/reseller-commission-detail-drawer";
import { PlatformMarginView } from "@/components/admin/commissions/platform-margin-view";
import { PayoutRunsView } from "@/components/admin/commissions/payout-runs-view";
import { CommissionRulesView } from "@/components/admin/commissions/commission-rules-view";
import { TierConfigView } from "@/components/admin/commissions/tier-config-view";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockResellerCommissions } from "@/lib/admin/mock/commissions";
import {
  ResellerCommission,
  COMMISSION_STATUS_LABELS,
} from "@/lib/admin/types/commission";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

type Tab = "reseller" | "margin" | "payouts_rules";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  paid: "success",
  cancelled: "neutral",
  reversed: "danger",
};

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reseller");
  const [commissions, setCommissions] = useState<ResellerCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommission, setSelectedCommission] = useState<ResellerCommission | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"pay" | "cancel" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const allColumns: Column<ResellerCommission>[] = [
    {
      key: "__select__",
      header: "Select",
      cell: (c) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(c.id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds((prev) => [...prev, c.id]);
            else setSelectedIds((prev) => prev.filter((id) => id !== c.id));
          }}
          className="h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "id",
      header: "Commission ID",
      cell: (c) => <span className="font-mono text-xs">{c.id}</span>,
    },
    { key: "reseller", header: "Reseller", cell: (c) => c.resellerName },
    { key: "order", header: "Order", cell: (c) => c.orderId },
    { key: "service", header: "Service", cell: (c) => c.service },
    { key: "tier", header: "Tier", cell: (c) => c.tierName || "—" },
    {
      key: "rate",
      header: "Rate",
      cell: (c) =>
        c.serviceCategory === "data" ? "Custom" : `${c.commissionRate}%`,
    },
    {
      key: "commission",
      header: "Commission",
      cell: (c) => (
        <span className="font-semibold">{formatCurrency(c.totalCommission)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <Badge variant={statusVariantMap[c.status]}>
          {COMMISSION_STATUS_LABELS[c.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (c) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCommission(c);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setVisibleColumns(
      allColumns.map((c) => c.key).filter((k) => k !== "__select__")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setCommissions(mockResellerCommissions);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-commission-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-commission-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filteredCommissions = commissions.filter((c) => {
    if (
      search &&
      !c.resellerName.toLowerCase().includes(search.toLowerCase()) &&
      !c.orderId.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const displayColumns = allColumns.filter(
    (c) => c.key === "__select__" || visibleColumns.includes(c.key)
  );

  const summaryData = {
    totalCommissions: commissions.reduce((sum, c) => sum + c.totalCommission, 0),
    pendingCommissions: commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.totalCommission, 0),
    paidCommissions: commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.totalCommission, 0),
    todayCommissions: commissions
      .filter(
        (c) => new Date(c.createdAt).toDateString() === new Date().toDateString()
      )
      .reduce((sum, c) => sum + c.totalCommission, 0),
    avgRate: 4.5,
    comparison: {
      totalCommissions: 8.3,
      pendingCommissions: -2.1,
      paidCommissions: 12.5,
      todayCommissions: 5.4,
    },
  };

  const platformSummary = {
    totalMargin: 46,
    todayMargin: 1,
    monthMargin: 46,
    avgMarginPercent: 12,
  };

  const handleSaveView = (name: string) => {
    setSavedViews((prev) => [
      ...prev,
      { name, filters: { search, statusFilter } },
    ]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setStatusFilter(view.filters.statusFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleMarkPaid = (id: string) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "paid" as const,
              paidAt: new Date().toISOString(),
              timeline: [
                ...c.timeline,
                {
                  timestamp: new Date().toISOString(),
                  label: "Paid",
                  status: "success" as const,
                },
              ],
            }
          : c
      )
    );
    setSelectedCommission(null);
  };

  const handleCancelCommission = (id: string) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "cancelled" as const,
              timeline: [
                ...c.timeline,
                {
                  timestamp: new Date().toISOString(),
                  label: "Cancelled",
                  status: "danger" as const,
                },
              ],
            }
          : c
      )
    );
    setSelectedCommission(null);
  };

  const handleBulkAction = () => {
    if (bulkAction === "pay") {
      setCommissions((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id)
            ? {
                ...c,
                status: "paid" as const,
                paidAt: new Date().toISOString(),
              }
            : c
        )
      );
    } else if (bulkAction === "cancel") {
      setCommissions((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id)
            ? { ...c, status: "cancelled" as const }
            : c
        )
      );
    } else {
      console.log("Export selected:", selectedIds);
    }
    setShowBulkConfirm(false);
    setBulkAction(null);
    setSelectedIds([]);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export commissions as ${format}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Commissions"
        description="Track reseller commissions, platform margin, and payout operations."
        actions={<ExportMenu onExport={handleExport} />}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {[
          { key: "reseller" as Tab, label: "Reseller Commissions" },
          { key: "margin" as Tab, label: "Platform Margin" },
          { key: "payouts_rules" as Tab, label: "Payouts & Rules" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              activeTab === tab.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "reseller" && (
        <>
          <ResellerCommissionSummaryCards data={summaryData} />

          <SavedViews
            views={savedViews}
            onLoad={handleLoadView}
            onDelete={handleDeleteView}
            onSave={handleSaveView}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search commissions..."
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
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
              <span className="text-sm">{selectedIds.length} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkAction("pay");
                  setShowBulkConfirm(true);
                }}
              >
                Mark Paid
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkAction("cancel");
                  setShowBulkConfirm(true);
                }}
              >
                Cancel
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
            </div>
          )}

          {/* Column visibility & page size */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">Rows per page:</span>
              <select
                className="h-8 rounded-md border border-neutral-300 px-2 text-xs"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Columns:</span>
              {allColumns
                .filter((col) => col.key !== "__select__" && col.key !== "actions")
                .map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-1 text-xs"
                  >
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
          </div>

          <AdminDataTable
            columns={displayColumns}
            data={filteredCommissions}
            isLoading={loading}
            rowKey={(c) => c.id}
            onRowClick={(c) => setSelectedCommission(c)}
            pageSize={pageSize}
            currentPage={page}
            onPageChange={setPage}
            emptyMessage="No commissions found."
          />
        </>
      )}

      {activeTab === "margin" && (
        <>
          <PlatformMarginSummaryCards data={platformSummary} />
          <PlatformMarginView />
        </>
      )}

      {activeTab === "payouts_rules" && (
        <>
          <PayoutRunsView />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CommissionRulesView />
            <TierConfigView />
          </div>
        </>
      )}

      <ResellerCommissionDetailDrawer
        commission={selectedCommission}
        onClose={() => setSelectedCommission(null)}
        onMarkPaid={handleMarkPaid}
        onCancel={handleCancelCommission}
      />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} commissions?`}
        confirmLabel="Confirm"
        danger={bulkAction === "cancel"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}