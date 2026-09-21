"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ErrorState } from "@/components/admin/ui/error-state";
import { Can, useCan } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { useCurrentAdmin } from "@/lib/admin/rbac/context";
import { useRefunds } from "@/lib/admin/hooks/use-refunds";
import {
  filterRefunds,
} from "@/lib/admin/refunds/refunds-projection";
import { exportRefundsCsv } from "@/lib/admin/refunds/refunds-csv-export";
import { OrderRefundsSummaryCards } from "@/components/admin/refunds/order-refunds-summary-cards";
import { OrderRefundsPipeline } from "@/components/admin/refunds/order-refunds-pipeline";
import { OrderRefundsTable } from "@/components/admin/refunds/order-refunds-table";
import { OrderRefundsFilters } from "@/components/admin/refunds/order-refunds-filters";
import { OrderRefundsEmptyState } from "@/components/admin/refunds/order-refunds-empty-state";
import { OrderRefundDetailDrawer } from "@/components/admin/refunds/order-refund-detail-drawer";
import { OrderRefundCreateModal } from "@/components/admin/refunds/order-refund-create-modal";
import { OrderRefundApproveModal } from "@/components/admin/refunds/order-refund-approve-modal";
import { OrderRefundRejectModal } from "@/components/admin/refunds/order-refund-reject-modal";
import { OrderRefundProcessModal } from "@/components/admin/refunds/order-refund-process-modal";
import {
  approveRefund,
  createRequestedRefund,
  processRefund,
  rejectRefund,
} from "@/lib/admin/mock/refunds-mutations";
import type {
  Refund,
  RefundActor,
  RefundLedgerFilters,
  RefundReason,
  RefundStatus,
} from "@/lib/admin/types/refund";
import type { Order } from "@/lib/admin/types/orders";
import { DEFAULT_REFUNDS_PAGE_SIZE } from "@/lib/admin/refunds/refunds-constants";

function parseFilters(params: URLSearchParams): RefundLedgerFilters {
  const filters: RefundLedgerFilters = {};
  const search = params.get("q");
  if (search) filters.search = search;
  const type = params.get("type");
  if (type) filters.type = type as RefundLedgerFilters["type"];
  const audience = params.get("audience");
  if (audience) filters.audience = audience as RefundLedgerFilters["audience"];
  const status = params.get("status");
  if (status) filters.status = status as RefundStatus;
  const reason = params.get("reason");
  if (reason) filters.reason = reason as RefundReason;
  const from = params.get("from");
  if (from) filters.dateFrom = from;
  const to = params.get("to");
  if (to) filters.dateTo = to;
  return filters;
}

function filtersToParams(filters: RefundLedgerFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.status) params.set("status", filters.status);
  if (filters.reason) params.set("reason", filters.reason);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  return params;
}

function actorFrom(admin: { name?: string; email?: string; id?: string } | null): RefundActor | null {
  if (!admin) return null;
  if (!admin.name || !admin.email) return null;
  return {
    id: admin.id ?? admin.email,
    name: admin.name,
    email: admin.email,
  };
}

export default function OrderRefundsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canView = useCan(PERMISSIONS.REFUNDS_VIEW);
  const currentAdmin = useCurrentAdmin();
  const actor = useMemo(() => actorFrom(currentAdmin), [currentAdmin]);

  const { refunds, treasury, rows, summary, pipeline, isLoading, error, nowMs } =
    useRefunds();

  const [createOpen, setCreateOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<Refund | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Refund | null>(null);
  const [processTarget, setProcessTarget] = useState<Refund | null>(null);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [searchParams]);
  const pipelineStatus = useMemo<RefundStatus | null>(() => {
    const raw = searchParams.get("stage");
    return raw ? (raw as RefundStatus) : null;
  }, [searchParams]);
  const selectedRefundId = searchParams.get("refund");

  const selectedRefund = useMemo(
    () => (selectedRefundId ? refunds.find((r) => r.id === selectedRefundId) ?? null : null),
    [refunds, selectedRefundId]
  );

  const filteredRows = useMemo(() => {
    const base = filterRefunds(rows, filters);
    if (!pipelineStatus) return base;
    return base.filter((r) => r.status === pipelineStatus);
  }, [rows, filters, pipelineStatus]);

  const pageSize = DEFAULT_REFUNDS_PAGE_SIZE;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const hasFilters = Object.keys(filters).length > 0 || pipelineStatus !== null;

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page");
      router.replace("/admin/refunds?" + next.toString());
    },
    [router, searchParams]
  );

  const handleFiltersChange = useCallback(
    (next: RefundLedgerFilters) => {
      const params = filtersToParams(next);
      const stage = pipelineStatus;
      if (stage) params.set("stage", stage);
      router.replace("/admin/refunds?" + params.toString());
    },
    [router, pipelineStatus]
  );

  const handleFiltersReset = useCallback(() => {
    router.replace("/admin/refunds");
  }, [router]);

  const handlePipelineChange = useCallback(
    (status: RefundStatus | null) => {
      setParam("stage", status ?? undefined);
    },
    [setParam]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setParam("page", String(page));
    },
    [setParam]
  );

  const handleRowClick = useCallback(
    (refundId: string) => {
      setParam("refund", refundId);
    },
    [setParam]
  );

  const handleCloseDrawer = useCallback(() => {
    setParam("refund", undefined);
  }, [setParam]);

  const handleExport = useCallback(() => {
    const toExport = refunds.filter((r) => filteredRows.some((row) => row.id === r.id));
    exportRefundsCsv(toExport);
  }, [refunds, filteredRows]);

  const handleCreateSubmit = useCallback(
    (input: {
      order: Order;
      reason: RefundReason;
      amount: number;
      reasonNote?: string;
      supportTicketId?: string;
    }) => {
      if (!actor) return;
      const result = createRequestedRefund(input, actor);
      if (result.ok && result.refund) {
        setCreateOpen(false);
        setParam("refund", result.refund.id);
      }
    },
    [actor, setParam]
  );

  const handleApproveConfirm = useCallback(
    (refundId: string) => {
      if (!actor) return;
      approveRefund(refundId, actor);
      setApproveTarget(null);
    },
    [actor]
  );

  const handleRejectConfirm = useCallback(
    (refundId: string, reason: string) => {
      if (!actor) return;
      rejectRefund(refundId, reason, actor);
      setRejectTarget(null);
    },
    [actor]
  );

  const handleProcessConfirm = useCallback(
    (refundId: string) => {
      if (!actor) return;
      processRefund(refundId, actor);
      setProcessTarget(null);
    },
    [actor]
  );

  if (!canView) {
    return (
      <ErrorState
        title="You do not have access to order refunds"
        description="Ask an administrator to grant you the refunds:view permission."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Order Refunds"
        description="Order refunds across direct customers, reseller customers, and resellers. Automatic refunds fire on retry exhaustion. Requested refunds require approval."
        meta={
          <>
            <span>{refunds.length} total</span>
            <span className="text-neutral-400">·</span>
            <span>{filteredRows.length} after filters</span>
            {treasury && (
              <>
                <span className="text-neutral-400">·</span>
                <span>Treasury {treasury.currency} {treasury.balance.toLocaleString()}</span>
              </>
            )}
          </>
        }
        actions={
          <>
            <Can permission={PERMISSIONS.EXPORT}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredRows.length === 0}
              >
                Export CSV
              </Button>
            </Can>
            <Can permission={PERMISSIONS.REFUNDS_PROCESS}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateOpen(true)}
                disabled={!actor}
              >
                New refund
              </Button>
            </Can>
          </>
        }
      />

      {error ? (
        <ErrorState title="Could not load refunds" description={error.message} />
      ) : (
        <>
          <OrderRefundsSummaryCards summary={summary} />

          <OrderRefundsPipeline
            pipeline={pipeline}
            activeStatus={pipelineStatus}
            onStatusChange={handlePipelineChange}
          />

          <OrderRefundsFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />

          {filteredRows.length === 0 && !isLoading ? (
            <OrderRefundsEmptyState hasFilters={hasFilters} />
          ) : (
            <OrderRefundsTable
              rows={paginatedRows}
              isLoading={isLoading}
              page={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onRowClick={handleRowClick}
            />
          )}
        </>
      )}

      <OrderRefundDetailDrawer
        refund={selectedRefund}
        now={nowMs}
        onClose={handleCloseDrawer}
        onApprove={setApproveTarget}
        onReject={setRejectTarget}
        onProcess={setProcessTarget}
      />

      <OrderRefundCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <OrderRefundApproveModal
        refund={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
      />

      <OrderRefundRejectModal
        refund={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />

      <OrderRefundProcessModal
        refund={processTarget}
        treasuryBalance={treasury?.balance ?? 0}
        onClose={() => setProcessTarget(null)}
        onConfirm={handleProcessConfirm}
      />
    </div>
  );
}