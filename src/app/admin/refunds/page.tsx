/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockRefunds, mockRefundRules } from "@/lib/admin/mock/refunds";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  Refund,
  REFUND_REASONS,
  REFUND_STATUS_LABELS,
  RefundStatus,
  RefundRule,
} from "@/lib/admin/types/refund";

const statusVariantMap: Record<RefundStatus, "warning" | "info" | "success" | "danger" | "neutral"> = {
  requested: "warning",
  under_review: "info",
  approved: "success",
  rejected: "danger",
  processed: "neutral",
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [pipelineStage, setPipelineStage] = useState<RefundStatus | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState<RefundRule[]>(mockRefundRules);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const allColumns = [
    { key: "id", header: "Refund ID", cell: (r: Refund) => <span className="font-medium">{r.id}</span> },
    { key: "order", header: "Order", cell: (r: Refund) => r.orderId },
    { key: "customer", header: "Customer", cell: (r: Refund) => r.customer.name },
    { key: "reseller", header: "Reseller", cell: (r: Refund) => r.reseller?.name ?? "—" },
    { key: "amount", header: "Amount", cell: (r: Refund) => formatCurrency(r.amount) },
    {
      key: "reason",
      header: "Reason",
      cell: (r: Refund) => REFUND_REASONS.find((x) => x.value === r.reason)?.label,
    },
    {
      key: "status",
      header: "Status",
      cell: (r: Refund) => (
        <Badge variant={statusVariantMap[r.status]}>{REFUND_STATUS_LABELS[r.status]}</Badge>
      ),
    },
    {
      key: "requested",
      header: "Requested",
      cell: (r: Refund) => new Date(r.requestedAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      cell: (r: Refund) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRefund(r);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setVisibleColumns(allColumns.map((c) => c.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setRefunds(mockRefunds);
      setLoading(false);
    }, 500);
  }, []);

  const pipelineData = [
    {
      status: "requested" as RefundStatus,
      icon: "file-text" as const,
      color: "text-warning-500",
      count: refunds.filter((r) => r.status === "requested").length,
      amount: refunds.filter((r) => r.status === "requested").reduce((s, r) => s + r.amount, 0),
    },
    {
      status: "under_review" as RefundStatus,
      icon: "clock" as const,
      color: "text-info-500",
      count: refunds.filter((r) => r.status === "under_review").length,
      amount: refunds.filter((r) => r.status === "under_review").reduce((s, r) => s + r.amount, 0),
    },
    {
      status: "approved" as RefundStatus,
      icon: "check" as const,
      color: "text-success-500",
      count: refunds.filter((r) => r.status === "approved").length,
      amount: refunds.filter((r) => r.status === "approved").reduce((s, r) => s + r.amount, 0),
    },
    {
      status: "rejected" as RefundStatus,
      icon: "x-circle" as const,
      color: "text-danger-500",
      count: refunds.filter((r) => r.status === "rejected").length,
      amount: refunds.filter((r) => r.status === "rejected").reduce((s, r) => s + r.amount, 0),
    },
    {
      status: "processed" as RefundStatus,
      icon: "receipt" as const,
      color: "text-neutral-500",
      count: refunds.filter((r) => r.status === "processed").length,
      amount: refunds.filter((r) => r.status === "processed").reduce((s, r) => s + r.amount, 0),
    },
  ];

  const filteredRefunds = refunds.filter((refund) => {
    if (pipelineStage && refund.status !== pipelineStage) return false;
    if (
      filters.search &&
      !refund.id.toLowerCase().includes(filters.search.toLowerCase()) &&
      !refund.customer.name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.reason && refund.reason !== filters.reason) return false;
    if (filters.status && refund.status !== filters.status) return false;
    return true;
  });

  const columns = allColumns.filter((c) => visibleColumns.includes(c.key));

  const summaryData = {
    pendingCount: refunds.filter((r) => r.status === "requested" || r.status === "under_review").length,
    pendingAmount: refunds
      .filter((r) => r.status === "requested" || r.status === "under_review")
      .reduce((s, r) => s + r.amount, 0),
    approvedToday: refunds.filter(
      (r) => r.status === "approved" && new Date(r.updatedAt).toDateString() === new Date().toDateString()
    ).length,
    rejectedToday: refunds.filter(
      (r) => r.status === "rejected" && new Date(r.updatedAt).toDateString() === new Date().toDateString()
    ).length,
    totalRefunded: refunds.filter((r) => r.status === "processed").reduce((s, r) => s + r.amount, 0),
    avgProcessingHours: 4.2,
    highRiskCount: refunds.filter(
      (r) => r.riskLevel === "high" && (r.status === "requested" || r.status === "under_review")
    ).length,
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for`, selectedRowKeys);
    setShowBulkConfirm(false);
    setBulkAction(null);
    setSelectedRowKeys([]);
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
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
          </>
        }
      />

      <RefundSummaryCards data={summaryData} />

      <RefundPipeline
        stages={pipelineData}
        activeStage={pipelineStage}
        onStageClick={setPipelineStage}
      />

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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
          {REFUND_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={filters.status || ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {Object.entries(REFUND_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Column visibility */}
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
              setBulkAction("approve");
              setShowBulkConfirm(true);
            }}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkAction("reject");
              setShowBulkConfirm(true);
            }}
          >
            Reject
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

      {/* Refund Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRulesModal(false)} />
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Automated Refund Rules</h3>
            <div className="mt-4 space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-xs text-neutral-500">{rule.condition}</p>
                    <p className="text-xs text-neutral-400">
                      Action: {rule.action.replace("_", " ")}
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-9 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full dark:bg-neutral-700"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowRulesModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedRowKeys.length} refunds?`}
        confirmLabel="Confirm"
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