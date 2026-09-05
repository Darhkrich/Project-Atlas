/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RefundSummaryCards } from "@/components/admin/refunds/refund-summary-cards";
import { RefundPipeline } from "@/components/admin/refunds/refund-pipeline";
import { PendingRefundsQueue } from "@/components/admin/refunds/pending-refunds-queue";
import { RefundAnalytics } from "@/components/admin/refunds/refund-analytics";
import { RefundDetailDrawer } from "@/components/admin/refunds/refund-detail-drawer";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockRefunds, mockRefundRules } from "@/lib/admin/mock/refunds";
import { formatCurrency } from "@/lib/admin/formatters";
import { Refund, REFUND_REASONS, REFUND_STATUS_LABELS, type RefundStatus, type RefundRule } from "@/lib/admin/types/refund";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

const statusVariantMap: Record<RefundStatus, "warning" | "info" | "success" | "danger" | "neutral"> = {
  requested: "warning",
  under_review: "info",
  approved: "success",
  rejected: "danger",
  processed: "neutral",
};

const allColumns = [
  { key: "id", header: "Refund ID", cell: (refund: Refund) => <span className="font-medium">{refund.id}</span> },
  { key: "order", header: "Order", cell: (refund: Refund) => refund.orderId },
  { key: "customer", header: "Customer", cell: (refund: Refund) => refund.customer.name },
  { key: "reseller", header: "Reseller", cell: (refund: Refund) => refund.reseller?.name ?? "—" },
  { key: "amount", header: "Amount", cell: (refund: Refund) => formatCurrency(refund.amount) },
  { key: "reason", header: "Reason", cell: (refund: Refund) => REFUND_REASONS.find(r => r.value === refund.reason)?.label },
  { key: "status", header: "Status", cell: (refund: Refund) => <Badge variant={statusVariantMap[refund.status]}>{REFUND_STATUS_LABELS[refund.status]}</Badge> },
  { key: "requested", header: "Requested", cell: (refund: Refund) => new Date(refund.requestedAt).toLocaleDateString() },
  { key: "actions", header: "", cell: (refund: Refund) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRefund(refund); }}>View</Button>
  ) },
];

interface SavedView {
  name: string;
  filters: any;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map((col) => col.key));
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showSaveViewDialog, setShowSaveViewDialog] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<RefundStatus | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState<RefundRule[]>(mockRefundRules);

  useEffect(() => {
    setTimeout(() => {
      setRefunds(mockRefunds);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLoading(true);
      setTimeout(() => {
        setRefunds(mockRefunds);
        setLoading(false);
      }, 500);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-refund-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-refund-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const pipelineData = [
    { status: "requested", icon: "file-text", color: "text-warning-500", count: refunds.filter(r => r.status === "requested").length, amount: refunds.filter(r => r.status === "requested").reduce((sum, r) => sum + r.amount, 0) },
    { status: "under_review", icon: "clock", color: "text-info-500", count: refunds.filter(r => r.status === "under_review").length, amount: refunds.filter(r => r.status === "under_review").reduce((sum, r) => sum + r.amount, 0) },
    { status: "approved", icon: "check", color: "text-success-500", count: refunds.filter(r => r.status === "approved").length, amount: refunds.filter(r => r.status === "approved").reduce((sum, r) => sum + r.amount, 0) },
    { status: "rejected", icon: "x-circle", color: "text-danger-500", count: refunds.filter(r => r.status === "rejected").length, amount: refunds.filter(r => r.status === "rejected").reduce((sum, r) => sum + r.amount, 0) },
    { status: "processed", icon: "receipt", color: "text-neutral-500", count: refunds.filter(r => r.status === "processed").length, amount: refunds.filter(r => r.status === "processed").reduce((sum, r) => sum + r.amount, 0) },
  ];

  const filteredRefunds = refunds.filter((refund) => {
    if (pipelineStage && refund.status !== pipelineStage) return false;
    if (filters.search && !refund.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !refund.customer.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.reason && refund.reason !== filters.reason) return false;
    if (filters.status && refund.status !== filters.status) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(refund.requestedAt) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(refund.requestedAt) > to) return false;
    }
    return true;
  });

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  const summaryData = {
    pendingCount: refunds.filter(r => r.status === "requested" || r.status === "under_review").length,
    pendingAmount: refunds.filter(r => r.status === "requested" || r.status === "under_review").reduce((sum, r) => sum + r.amount, 0),
    approvedToday: refunds.filter(r => r.status === "approved" && new Date(r.updatedAt).toDateString() === new Date().toDateString()).length,
    rejectedToday: refunds.filter(r => r.status === "rejected" && new Date(r.updatedAt).toDateString() === new Date().toDateString()).length,
    totalRefunded: refunds.filter(r => r.status === "processed").reduce((sum, r) => sum + r.amount, 0),
    avgProcessingHours: 4.2,
    highRiskCount: refunds.filter(r => r.riskLevel === "high" && (r.status === "requested" || r.status === "under_review")).length,
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    setSavedViews((prev) => [...prev, { name: newViewName.trim(), filters }]);
    setNewViewName("");
    setShowSaveViewDialog(false);
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} confirmed for`, selectedRowKeys);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const exportRefunds = (format: string) => {
    console.log(`Exporting ${format} for ${selectedRowKeys.length > 0 ? 'selected' : 'all'}`);
    setExportMenuOpen(false);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Refunds"
        description="Refund Operations Center for managing refund requests and processing."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowRulesModal(true)}>
              Refund Rules
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
              Auto Refresh {autoRefresh ? "On" : "Off"}
            </Button>
            {autoRefresh && (
              <select
                className="h-8 rounded-md border border-neutral-300 px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setExportMenuOpen(!exportMenuOpen)}>
                Export
              </Button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                  <ul className="py-1">
                    <li><button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportRefunds("csv")}>CSV</button></li>
                    <li><button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportRefunds("excel")}>Excel</button></li>
                    <li><button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportRefunds("pdf")}>PDF</button></li>
                  </ul>
                </div>
              )}
            </div>
          </>
        }
      />

      <RefundSummaryCards data={summaryData} />

      <RefundPipeline stages={pipelineData} activeStage={pipelineStage} onStageClick={setPipelineStage} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PendingRefundsQueue
            refunds={refunds}
            onRefundClick={setSelectedRefund}
            onApprove={(id) => console.log("Approve", id)}
            onReject={(id) => console.log("Reject", id)}
          />
        </div>
        <RefundAnalytics />
      </div>

      {/* Saved Views */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Saved Views:</span>
        {savedViews.map((view) => (
          <div key={view.name} className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
            <button className="text-xs font-medium text-neutral-700 dark:text-neutral-200" onClick={() => setFilters(view.filters)}>
              {view.name}
            </button>
            <button className="text-xs text-neutral-400 hover:text-danger-600" onClick={() => setSavedViews(prev => prev.filter(v => v.name !== view.name))}>×</button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setShowSaveViewDialog(true)}>
          Save Current Filters
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search refunds..."
          className="max-w-xs"
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.reason || ""}
          onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
        >
          <option value="">All Reasons</option>
          {REFUND_REASONS.map(reason => (
            <option key={reason.value} value={reason.value}>{reason.label}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.status || ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {Object.entries(REFUND_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs">From</label>
          <Input type="date" className="w-40" value={filters.dateFrom || ""} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
          <label className="text-xs">To</label>
          <Input type="date" className="w-40" value={filters.dateTo || ""} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </div>
      </div>

      {/* Column visibility & page size */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs">Rows per page:</span>
          <select className="h-8 rounded-md border border-neutral-300 px-2 text-xs" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Columns:</span>
          {allColumns.filter(col => col.key !== "actions").map(col => (
            <label key={col.key} className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={(e) => {
                if (e.target.checked) setVisibleColumns(prev => [...prev, col.key]);
                else setVisibleColumns(prev => prev.filter(k => k !== col.key));
              }} className="h-3 w-3" />
              {col.header}
            </label>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedRowKeys.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedRowKeys.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("approve"); setShowBulkConfirm(true); }}>Approve</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("reject"); setShowBulkConfirm(true); }}>Reject</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export Selected</Button>
        </div>
      )}

      <AdminDataTable
        columns={columns}
        data={filteredRefunds}
        isLoading={loading}
        rowKey={(refund) => refund.id}
        onRowClick={(refund) => setSelectedRefund(refund)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No refunds found."
      />

      <RefundDetailDrawer refund={selectedRefund} onClose={() => setSelectedRefund(null)} />

      {/* Save View Dialog */}
      {showSaveViewDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveViewDialog(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Save Current Filters</h3>
            <p className="mt-2 text-sm text-neutral-500">Give this view a name.</p>
            <Input className="mt-4" placeholder="e.g., Pending Fraud" value={newViewName} onChange={(e) => setNewViewName(e.target.value)} />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveViewDialog(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveView}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRulesModal(false)} />
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Automated Refund Rules</h3>
            <div className="mt-4 space-y-2">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                  <div>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-neutral-500">{rule.condition}</p>
                    <p className="text-xs text-neutral-400">Action: {rule.action.replace('_', ' ')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowRulesModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation */}
      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ? bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1) : ''}`}
        description={
          bulkAction === "export"
            ? `Export ${selectedRowKeys.length} selected refunds?`
            : `Are you sure you want to ${bulkAction} ${selectedRowKeys.length} refunds?`
        }
        confirmLabel={bulkAction === "export" ? "Export" : bulkAction === "approve" ? "Approve" : "Reject"}
        danger={bulkAction === "reject"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}