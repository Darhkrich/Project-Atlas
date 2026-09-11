/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
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
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockTransactions } from "@/lib/admin/mock/transactions";
import { formatCurrency } from "@/lib/admin/formatters";
import { Transaction } from "@/lib/admin/types/transaction";
import { cn } from "@/lib/utils";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [bulkAction, setBulkAction] = useState<"retry" | "refund" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Define columns inside component to access setSelectedTxn
  const allColumns = [
    {
      key: "id",
      header: "Transaction ID",
      cell: (t: Transaction) => <span className="font-medium">{t.id}</span>,
    },
    { key: "reference", header: "Reference", cell: (t: Transaction) => t.reference },
    { key: "user", header: "User", cell: (t: Transaction) => t.user.name },
    {
      key: "type",
      header: "Type",
      cell: (t: Transaction) => <Badge variant="info">{t.type}</Badge>,
    },
    { key: "amount", header: "Amount", cell: (t: Transaction) => formatCurrency(t.amount) },
    { key: "fee", header: "Fee", cell: (t: Transaction) => formatCurrency(t.fee) },
    { key: "net", header: "Net", cell: (t: Transaction) => formatCurrency(t.netAmount) },
    { key: "method", header: "Method", cell: (t: Transaction) => t.paymentMethodId },
    {
      key: "status",
      header: "Status",
      cell: (t: Transaction) => <Badge variant={statusVariantMap[t.status]}>{t.status}</Badge>,
    },
    {
      key: "created",
      header: "Created",
      cell: (t: Transaction) => new Date(t.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      cell: (t: Transaction) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTxn(t);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // Initialize visible columns once allColumns is defined
  useEffect(() => {
    setVisibleColumns(allColumns.map((c) => c.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (
      filters.search &&
      !txn.id.toLowerCase().includes(filters.search.toLowerCase()) &&
      !txn.reference.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.type && txn.type !== filters.type) return false;
    if (filters.status && txn.status !== filters.status) return false;
    if (filters.paymentMethod && txn.paymentMethodId !== filters.paymentMethod) return false;
    return true;
  });

  const columns = allColumns.filter((c) => visibleColumns.includes(c.key));

  const summaryData = {
    totalVolume: 1250000,
    todayVolume: 45000,
    pendingAmount: 15000,
    failedAmount: 5000,
    successRate: 96.5,
  };

  const handleRetry = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "processing" as const } : t))
    );
  };

  const handleRefund = (id: string, amount: number) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              refundStatus: "completed" as const,
              refundHistory: [
                ...(t.refundHistory || []),
                {
                  timestamp: new Date().toISOString(),
                  amount,
                  status: "completed" as const,
                  admin: "current_admin@atlas.com",
                },
              ],
            }
          : t
      )
    );
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for`, selectedRowKeys);
    setShowBulkConfirm(false);
    setBulkAction(null);
    setSelectedRowKeys([]);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transactions"
        description="Financial operations console for all money movement."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                autoRefresh && "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              )}
            >
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
          </>
        }
      />

      <TransactionSummaryCards data={summaryData} />

      <TransactionAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveTransactionsCard
          transactions={liveTransactions}
          onViewAll={() => setFilters({ ...filters, status: "pending" })}
          onTransactionClick={setSelectedTxn}
          onRetry={handleRetry}
        />
        <FailedTransactionsCard
          transactions={todayFailedTransactions}
          onViewAll={() => setFilters({ ...filters, status: "failed" })}
          onTransactionClick={setSelectedTxn}
          onRetry={handleRetry}
          onRefund={(id) => {
            setSelectedTxn(transactions.find((t) => t.id === id) || null);
          }}
        />
        <ProviderHealthCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FailureInsightsCard />
        <ReconciliationCard />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
      </div>

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
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Columns:</span>
          {allColumns
            .filter((c) => c.key !== "actions")
            .map((col) => (
              <label key={col.key} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.key)}
                  onChange={(e) => {
                    if (e.target.checked) setVisibleColumns((prev) => [...prev, col.key]);
                    else setVisibleColumns((prev) => prev.filter((k) => k !== col.key));
                  }}
                  className="h-3 w-3"
                />
                {col.header}
              </label>
            ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedRowKeys.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedRowKeys.length} selected</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkAction("retry");
              setShowBulkConfirm(true);
            }}
          >
            Retry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkAction("refund");
              setShowBulkConfirm(true);
            }}
          >
            Refund
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkAction("export");
              setShowBulkConfirm(true);
            }}
          >
            Export
          </Button>
        </div>
      )}

      <AdminDataTable
        columns={columns}
        data={filteredTransactions}
        isLoading={loading}
        rowKey={(t) => t.id}
        onRowClick={(t) => setSelectedTxn(t)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No transactions found."
      />

      <TransactionDetailDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onRetry={handleRetry}
        onRefund={handleRefund}
      />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedRowKeys.length} transactions?`}
        confirmLabel="Confirm"
        danger={bulkAction === "refund"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}