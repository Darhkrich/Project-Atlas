/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentSummaryCards } from "@/components/admin/payments/payment-summary-cards";
import { PaymentAnalytics } from "@/components/admin/payments/payment-analytics";
import { LivePaymentsCard } from "@/components/admin/payments/live-payments-card";
import { FailedPaymentsCard } from "@/components/admin/payments/failed-payments-card";
import { PaymentProviderHealth } from "@/components/admin/payments/payment-provider-health";
import { PaymentDetailDrawer } from "@/components/admin/payments/payment-detail-drawer";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockPayments } from "@/lib/admin/mock/payments";
import { formatCurrency } from "@/lib/admin/formatters";
import { Payment } from "@/lib/admin/types/payment";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  failed: "danger",
  refunded: "neutral",
};

const allColumns = [
  { key: "id", header: "Payment ID", cell: (payment: Payment) => <span className="font-medium">{payment.id}</span> },
  { key: "reference", header: "Reference", cell: (payment: Payment) => payment.reference },
  { key: "user", header: "User", cell: (payment: Payment) => payment.user.name },
  { key: "method", header: "Method", cell: (payment: Payment) => payment.methodId },
  { key: "amount", header: "Amount", cell: (payment: Payment) => formatCurrency(payment.amount) },
  { key: "fee", header: "Fee", cell: (payment: Payment) => formatCurrency(payment.fee) },
  { key: "net", header: "Net Amount", cell: (payment: Payment) => formatCurrency(payment.netAmount) },
  { key: "status", header: "Status", cell: (payment: Payment) => <Badge variant={statusVariantMap[payment.status]}>{payment.status}</Badge> },
  { key: "created", header: "Created", cell: (payment: Payment) => new Date(payment.createdAt).toLocaleDateString() },
  { key: "actions", header: "", cell: (payment: Payment) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}>View</Button>
  ) },
];

interface SavedView {
  name: string;
  filters: any;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
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
  const [bulkAction, setBulkAction] = useState<"retry" | "refund" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLoading(true);
      setTimeout(() => {
        setPayments(mockPayments);
        setLoading(false);
      }, 500);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-payment-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-payment-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const livePayments = payments.filter((p) => p.status === "pending" || p.status === "processing");
  const todayFailedPayments = payments.filter((p) => {
    const today = new Date();
    const paymentDate = new Date(p.createdAt);
    return (
      p.status === "failed" &&
      paymentDate.getDate() === today.getDate() &&
      paymentDate.getMonth() === today.getMonth() &&
      paymentDate.getFullYear() === today.getFullYear()
    );
  });

  const historyPayments = payments.filter((p) => ["successful", "failed", "refunded"].includes(p.status));

  const filteredPayments = historyPayments.filter((payment) => {
    if (filters.search && !payment.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !payment.reference.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.method && payment.methodId !== filters.method) return false;
    if (filters.status && payment.status !== filters.status) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(payment.createdAt) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(payment.createdAt) > to) return false;
    }
    return true;
  });

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  const selectColumn = {
    key: "__select__",
    header: (
      <input
        type="checkbox"
        checked={selectedRowKeys.length === filteredPayments.length && filteredPayments.length > 0}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRowKeys(filteredPayments.map((p) => p.id));
          } else {
            setSelectedRowKeys([]);
          }
        }}
        className="h-4 w-4"
      />
    ),
    cell: (payment: Payment) => (
      <input
        type="checkbox"
        checked={selectedRowKeys.includes(payment.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRowKeys((prev) => [...prev, payment.id]);
          } else {
            setSelectedRowKeys((prev) => prev.filter((id) => id !== payment.id));
          }
        }}
        className="h-4 w-4"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  };

  const allColumnsWithSelect = [selectColumn, ...columns];

  const summaryData = {
    totalVolume: 1055000,
    successfulAmount: 1000000,
    pendingAmount: 30000,
    failedAmount: 20000,
    refundedAmount: 5000,
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    setSavedViews((prev) => [...prev, { name: newViewName.trim(), filters }]);
    setNewViewName("");
    setShowSaveViewDialog(false);
  };

  const loadSavedView = (view: SavedView) => {
    setFilters(view.filters);
  };

  const deleteSavedView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const exportPayments = (format: string) => {
    console.log(`Exporting ${format}`);
    setExportMenuOpen(false);
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} confirmed for`, selectedRowKeys);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Payment Operations Hub for all transaction methods."
        actions={
          <>
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
                    <li>
                      <button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportPayments("csv")}>CSV</button>
                    </li>
                    <li>
                      <button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportPayments("excel")}>Excel</button>
                    </li>
                    <li>
                      <button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportPayments("pdf")}>PDF</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        }
      />

      <PaymentSummaryCards data={summaryData} />

      <PaymentAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LivePaymentsCard
          payments={livePayments}
          onViewAll={() => setFilters({ ...filters, status: "pending" })}
          onPaymentClick={setSelectedPayment}
        />
        <FailedPaymentsCard
          payments={todayFailedPayments}
          onViewAll={() => setFilters({ ...filters, status: "failed" })}
          onPaymentClick={setSelectedPayment}
        />
        <PaymentProviderHealth />
      </div>

      {/* Saved Views */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Saved Views:</span>
        {savedViews.map((view) => (
          <div key={view.name} className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
            <button className="text-xs font-medium text-neutral-700 dark:text-neutral-200" onClick={() => loadSavedView(view)}>
              {view.name}
            </button>
            <button className="text-xs text-neutral-400 hover:text-danger-600" onClick={() => deleteSavedView(view.name)}>×</button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setShowSaveViewDialog(true)}>
          Save Current Filters
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search payments..."
          className="max-w-xs"
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.method || ""}
          onChange={(e) => setFilters({ ...filters, method: e.target.value })}
        >
          <option value="">All Methods</option>
          <option value="wallet">Wallet</option>
          <option value="momo">Mobile Money</option>
          <option value="card">Card</option>
          <option value="bank">Bank</option>
          <option value="ussd">USSD</option>
          <option value="atlas_points">Atlas Points</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.status || ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
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
          {allColumns.filter(col => col.key !== "__select__").map(col => (
            <label key={col.key} className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={(e) => {
                if (e.target.checked) {
                  setVisibleColumns(prev => [...prev, col.key]);
                } else {
                  setVisibleColumns(prev => prev.filter(k => k !== col.key));
                }
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
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("retry"); setShowBulkConfirm(true); }}>Retry</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("refund"); setShowBulkConfirm(true); }}>Refund</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export</Button>
        </div>
      )}

      <AdminDataTable
        columns={allColumnsWithSelect}
        data={filteredPayments}
        isLoading={loading}
        rowKey={(payment) => payment.id}
        onRowClick={(payment) => setSelectedPayment(payment)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No payments found."
      />

      <PaymentDetailDrawer payment={selectedPayment} onClose={() => setSelectedPayment(null)} />

      {/* Save View Dialog */}
      {showSaveViewDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveViewDialog(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Save Current Filters</h3>
            <p className="mt-2 text-sm text-neutral-500">Give this view a name.</p>
            <Input className="mt-4" placeholder="e.g., Failed MoMo Today" value={newViewName} onChange={(e) => setNewViewName(e.target.value)} />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveViewDialog(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveView}>Save</Button>
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
            ? `Export ${selectedRowKeys.length} selected payments?`
            : `Are you sure you want to ${bulkAction} ${selectedRowKeys.length} payments? Total amount: ${formatCurrency(
                payments.filter(p => selectedRowKeys.includes(p.id)).reduce((sum, p) => sum + p.amount, 0)
              )}.`
        }
        confirmLabel={bulkAction === "export" ? "Export" : bulkAction === "retry" ? "Retry" : "Refund"}
        danger={bulkAction !== "export"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}