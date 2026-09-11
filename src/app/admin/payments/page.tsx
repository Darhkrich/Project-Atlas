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
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockPayments } from "@/lib/admin/mock/payments";
import { formatCurrency } from "@/lib/admin/formatters";
import { Payment } from "@/lib/admin/types/payment";
import { cn } from "@/lib/utils";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  failed: "danger",
  refunded: "neutral",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [bulkAction, setBulkAction] = useState<"retry" | "refund" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Define columns inside component so setSelectedPayment is in scope
  const allColumns = [
    {
      key: "id",
      header: "Payment ID",
      cell: (p: Payment) => <span className="font-medium">{p.id}</span>,
    },
    { key: "reference", header: "Reference", cell: (p: Payment) => p.reference },
    { key: "user", header: "User", cell: (p: Payment) => p.user.name },
    { key: "method", header: "Method", cell: (p: Payment) => p.methodId },
    { key: "amount", header: "Amount", cell: (p: Payment) => formatCurrency(p.amount) },
    { key: "fee", header: "Fee", cell: (p: Payment) => formatCurrency(p.fee) },
    { key: "net", header: "Net", cell: (p: Payment) => formatCurrency(p.netAmount) },
    {
      key: "status",
      header: "Status",
      cell: (p: Payment) => <Badge variant={statusVariantMap[p.status]}>{p.status}</Badge>,
    },
    {
      key: "created",
      header: "Created",
      cell: (p: Payment) => new Date(p.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      cell: (p: Payment) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(p);
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

  const historyPayments = payments.filter((p) =>
    ["successful", "failed", "refunded"].includes(p.status)
  );

  const filteredPayments = historyPayments.filter((payment) => {
    if (
      filters.search &&
      !payment.id.toLowerCase().includes(filters.search.toLowerCase()) &&
      !payment.reference.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.method && payment.methodId !== filters.method) return false;
    if (filters.status && payment.status !== filters.status) return false;
    return true;
  });

  const columns = allColumns.filter((c) => visibleColumns.includes(c.key));

  const summaryData = {
    totalVolume: 1055000,
    successfulAmount: 1000000,
    pendingAmount: 30000,
    failedAmount: 20000,
    refundedAmount: 5000,
  };

  const handleRetry = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "processing" as const } : p))
    );
  };

  const handleRefund = (id: string, amount: number) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              refundStatus: "completed" as const,
              refundHistory: [
                ...(p.refundHistory || []),
                {
                  timestamp: new Date().toISOString(),
                  amount,
                  status: "refunded" as const,
                  admin: "current_admin@atlas.com",
                },
              ],
            }
          : p
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
        title="Payments"
        description="Payment Operations Hub for all transaction methods."
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

      <PaymentSummaryCards data={summaryData} />

      <PaymentAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LivePaymentsCard
          payments={livePayments}
          onViewAll={() => setFilters({ ...filters, status: "pending" })}
          onPaymentClick={setSelectedPayment}
          onRetry={handleRetry}
        />
        <FailedPaymentsCard
          payments={todayFailedPayments}
          onViewAll={() => setFilters({ ...filters, status: "failed" })}
          onPaymentClick={setSelectedPayment}
          onRetry={handleRetry}
          onRefund={(id) => {
            setSelectedPayment(payments.find((p) => p.id === id) || null);
          }}
        />
        <PaymentProviderHealth />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
        data={filteredPayments}
        isLoading={loading}
        rowKey={(p) => p.id}
        onRowClick={(p) => setSelectedPayment(p)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No payments found."
      />

      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRetry={handleRetry}
        onRefund={handleRefund}
      />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedRowKeys.length} payments?`}
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