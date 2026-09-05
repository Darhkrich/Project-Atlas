/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TransactionSummaryCards } from "@/components/admin/transactions/transaction-summary-cards";
import { TransactionAnalytics } from "@/components/admin/transactions/transaction-analytics";
import { LiveTransactionsCard } from "@/components/admin/transactions/live-transactions-card";
import { FailedTransactionsCard } from "@/components/admin/transactions/failed-transactions-card";
import { ProviderHealthCard } from "@/components/admin/transactions/provider-health-card";
import { FailureInsightsCard } from "@/components/admin/transactions/failure-insights-card";
import { ReconciliationCard } from "@/components/admin/transactions/reconciliation-card";
import { TransactionDetailDrawer } from "@/components/admin/transactions/transactions-detail-drawer";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockTransactions } from "@/lib/admin/mock/transactions";
import { formatCurrency } from "@/lib/admin/formatters";
import { Transaction } from "@/lib/admin/types/transaction";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

const allColumns = [
  { key: "id", header: "Transaction ID", cell: (txn: Transaction) => <span className="font-medium">{txn.id}</span> },
  { key: "reference", header: "Reference", cell: (txn: Transaction) => txn.reference },
  { key: "user", header: "User", cell: (txn: Transaction) => txn.user.name },
  { key: "type", header: "Type", cell: (txn: Transaction) => <Badge variant="info">{txn.type}</Badge> },
  { key: "amount", header: "Amount", cell: (txn: Transaction) => formatCurrency(txn.amount) },
  { key: "fee", header: "Fee", cell: (txn: Transaction) => formatCurrency(txn.fee) },
  { key: "net", header: "Net Amount", cell: (txn: Transaction) => formatCurrency(txn.netAmount) },
  { key: "paymentMethod", header: "Method", cell: (txn: Transaction) => txn.paymentMethodId },
  { key: "status", header: "Status", cell: (txn: Transaction) => <Badge variant={statusVariantMap[txn.status]}>{txn.status}</Badge> },
  { key: "created", header: "Created", cell: (txn: Transaction) => new Date(txn.createdAt).toLocaleDateString() },
  { key: "actions", header: "", cell: (txn: Transaction) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTxn(txn); }}>View</Button>
  ) },
];

interface SavedView {
  name: string;
  filters: any;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
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
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLoading(true);
      setTimeout(() => {
        setTransactions(mockTransactions);
        setLoading(false);
      }, 500);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-transaction-views");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-transaction-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const liveTransactions = transactions.filter((t) => t.status === "pending" || t.status === "processing");
  const todayFailedTransactions = transactions.filter((t) => {
    const today = new Date();
    const txnDate = new Date(t.createdAt);
    return (
      t.status === "failed" &&
      txnDate.getDate() === today.getDate() &&
      txnDate.getMonth() === today.getMonth() &&
      txnDate.getFullYear() === today.getFullYear()
    );
  });

  const historyTransactions = transactions.filter((t) =>
    ["successful", "failed", "cancelled", "refunded"].includes(t.status)
  );

  const filteredTransactions = historyTransactions.filter((txn) => {
    if (filters.search && !txn.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !txn.reference.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.type && txn.type !== filters.type) return false;
    if (filters.status && txn.status !== filters.status) return false;
    if (filters.paymentMethod && txn.paymentMethodId !== filters.paymentMethod) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(txn.createdAt) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(txn.createdAt) > to) return false;
    }
    return true;
  });

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  const selectColumn = {
    key: "__select__",
    header: (
      <input
        type="checkbox"
        checked={selectedRowKeys.length === filteredTransactions.length && filteredTransactions.length > 0}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRowKeys(filteredTransactions.map((t) => t.id));
          } else {
            setSelectedRowKeys([]);
          }
        }}
        className="h-4 w-4"
      />
    ),
    cell: (txn: Transaction) => (
      <input
        type="checkbox"
        checked={selectedRowKeys.includes(txn.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRowKeys((prev) => [...prev, txn.id]);
          } else {
            setSelectedRowKeys((prev) => prev.filter((id) => id !== txn.id));
          }
        }}
        className="h-4 w-4"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  };

  const allColumnsWithSelect = [selectColumn, ...columns];

  const summaryData = {
    totalVolume: 1250000,
    todayVolume: 45000,
    pendingAmount: 15000,
    failedAmount: 5000,
    successRate: 96.5,
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

  const exportTransactions = (format: string) => {
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
        title="Transactions"
        description="Financial operations console for all money movement."
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
                      <button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportTransactions("csv")}>CSV</button>
                    </li>
                    <li>
                      <button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportTransactions("excel")}>Excel</button>
                    </li>
                    <li>
                      <button className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => exportTransactions("pdf")}>PDF</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        }
      />

      {/* Summary Cards */}
      <TransactionSummaryCards data={summaryData} />

      {/* Analytics */}
      <TransactionAnalytics />

      {/* Live & Failed + Provider Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveTransactionsCard
          transactions={liveTransactions}
          onViewAll={() => setFilters({ ...filters, status: "pending" })}
          onTransactionClick={setSelectedTxn}
        />
        <FailedTransactionsCard
          transactions={todayFailedTransactions}
          onViewAll={() => setFilters({ ...filters, status: "failed" })}
          onTransactionClick={setSelectedTxn}
        />
        <ProviderHealthCard />
      </div>

      {/* Failure Insights & Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FailureInsightsCard />
        <ReconciliationCard />
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
          placeholder="Search transactions..."
          className="max-w-xs"
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.type || ""}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="purchase">Purchase</option>
          <option value="commission">Commission</option>
          <option value="refund">Refund</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.status || ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.paymentMethod || ""}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
        >
          <option value="">All Methods</option>
          <option value="wallet">Wallet</option>
          <option value="momo">Mobile Money</option>
          <option value="card">Card</option>
          <option value="bank">Bank</option>
          <option value="ussd">USSD</option>
          <option value="atlas_points">Atlas Points</option>
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
        data={filteredTransactions}
        isLoading={loading}
        rowKey={(txn) => txn.id}
        onRowClick={(txn) => setSelectedTxn(txn)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No transactions found."
      />

      <TransactionDetailDrawer transaction={selectedTxn} onClose={() => setSelectedTxn(null)} />

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
            ? `Export ${selectedRowKeys.length} selected transactions?`
            : `Are you sure you want to ${bulkAction} ${selectedRowKeys.length} transactions? Total amount: ${formatCurrency(
                transactions.filter(t => selectedRowKeys.includes(t.id)).reduce((sum, t) => sum + t.amount, 0)
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