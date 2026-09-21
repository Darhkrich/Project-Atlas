"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ErrorState } from "@/components/admin/ui/error-state";
import { Can, useCan } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { useCurrentAdmin } from "@/lib/admin/rbac/context";
import { useTreasury } from "@/lib/admin/hooks/use-treasury";
import { TreasuryMockBanner } from "@/components/admin/treasury/treasury-mock-banner";
import { TreasurySummaryCards } from "@/components/admin/treasury/treasury-summary-cards";
import { TreasuryCoverageBanner } from "@/components/admin/treasury/treasury-coverage-banner";
import { TreasuryStatementTable } from "@/components/admin/treasury/treasury-statement-table";
import { TreasuryFilters } from "@/components/admin/treasury/treasury-filters";
import { TreasuryEmptyState } from "@/components/admin/treasury/treasury-empty-state";
import { TreasuryDetailDrawer } from "@/components/admin/treasury/treasury-detail-drawer";
import { TreasuryFundModal } from "@/components/admin/treasury/treasury-fund-modal";
import { TreasuryTransferToBankModal } from "@/components/admin/treasury/treasury-transfer-to-bank-modal";
import { TreasuryAdjustmentModal } from "@/components/admin/treasury/treasury-adjustment-modal";
import { TreasuryApproveOutboundModal } from "@/components/admin/treasury/treasury-approve-outbound-modal";
import { TreasuryRejectOutboundModal } from "@/components/admin/treasury/treasury-reject-outbound-modal";
import { TreasuryReconcileModal } from "@/components/admin/treasury/treasury-reconcile-modal";
import {
  approveOutbound,
  createAdjustment,
  fundTreasury,
  reconcileEvent,
  rejectOutbound,
  settleOutbound,
  transferToBank,
} from "@/lib/admin/mock/treasury-mutations";
import { exportTreasuryCsv } from "@/lib/admin/treasury/treasury-csv-export";
import type {
  TreasuryActor,
  TreasuryApprovalStatus,
  TreasuryDirection,
  TreasuryEvent,
  TreasuryEventFilters,
  TreasuryEventKind,
  TreasuryReconciliationStatus,
} from "@/lib/admin/types/treasury";
import {
  DEFAULT_TREASURY_PAGE_SIZE,
  TREASURY_APPROVAL_ORDER,
  TREASURY_DIRECTION_ORDER,
  TREASURY_KIND_ORDER,
  TREASURY_RECONCILIATION_ORDER,
} from "@/lib/admin/treasury/treasury-constants";

function parseFilters(params: URLSearchParams): TreasuryEventFilters {
  const filters: TreasuryEventFilters = {};
  const search = params.get("q");
  if (search) filters.search = search;
  const direction = params.get("direction");
  if (direction && (TREASURY_DIRECTION_ORDER as string[]).includes(direction)) {
    filters.direction = direction as TreasuryDirection;
  }
  const kind = params.get("kind");
  if (kind && (TREASURY_KIND_ORDER as string[]).includes(kind)) {
    filters.kind = kind as TreasuryEventKind;
  }
  const approval = params.get("approval");
  if (approval && (TREASURY_APPROVAL_ORDER as string[]).includes(approval)) {
    filters.approvalStatus = approval as TreasuryApprovalStatus;
  }
  const reconciliation = params.get("reconciliation");
  if (
    reconciliation &&
    (TREASURY_RECONCILIATION_ORDER as string[]).includes(reconciliation)
  ) {
    filters.reconciliationStatus = reconciliation as TreasuryReconciliationStatus;
  }
  const from = params.get("from");
  if (from) filters.dateFrom = from;
  const to = params.get("to");
  if (to) filters.dateTo = to;
  return filters;
}

function filtersToParams(filters: TreasuryEventFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.approvalStatus) params.set("approval", filters.approvalStatus);
  if (filters.reconciliationStatus)
    params.set("reconciliation", filters.reconciliationStatus);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  return params;
}

function actorFrom(
  admin: { id?: string; name?: string; email?: string } | null
): TreasuryActor | null {
  if (!admin) return null;
  if (!admin.name || !admin.email) return null;
  return {
    id: admin.id ?? admin.email,
    name: admin.name,
    email: admin.email,
  };
}

export default function TreasuryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canView = useCan(PERMISSIONS.TREASURY_VIEW);
  const currentAdmin = useCurrentAdmin();
  const actor = useMemo(() => actorFrom(currentAdmin), [currentAdmin]);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const { events, summary, rows, isLoading, error, nowMs } = useTreasury(filters);

  const [fundOpen, setFundOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<TreasuryEvent | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TreasuryEvent | null>(null);
  const [reconcileTarget, setReconcileTarget] = useState<TreasuryEvent | null>(null);

  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [searchParams]);

  const selectedEventId = searchParams.get("event");
  const selectedEvent = useMemo(
    () => (selectedEventId ? events.find((e) => e.id === selectedEventId) ?? null : null),
    [events, selectedEventId]
  );

  const pageSize = DEFAULT_TREASURY_PAGE_SIZE;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  const hasFilters = Object.keys(filters).length > 0;

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page");
      router.replace("/admin/treasury?" + next.toString());
    },
    [router, searchParams]
  );

  const handleFiltersChange = useCallback(
    (next: TreasuryEventFilters) => {
      const params = filtersToParams(next);
      router.replace("/admin/treasury?" + params.toString());
    },
    [router]
  );

  const handleFiltersReset = useCallback(() => {
    router.replace("/admin/treasury");
  }, [router]);

  const handlePageChange = useCallback(
    (page: number) => {
      setParam("page", String(page));
    },
    [setParam]
  );

  const handleRowClick = useCallback(
    (eventId: string) => {
      setParam("event", eventId);
    },
    [setParam]
  );

  const handleCloseDrawer = useCallback(() => {
    setParam("event", undefined);
  }, [setParam]);

  const handleExport = useCallback(() => {
    const ids = new Set(rows.map((r) => r.id));
    const toExport = events.filter((e) => ids.has(e.id));
    exportTreasuryCsv(toExport);
  }, [events, rows]);

  const handleFundSubmit = useCallback(
    (input: {
      amount: number;
      source: string;
      reference: string;
      description: string;
    }) => {
      if (!actor) return;
      fundTreasury(input, actor);
      setFundOpen(false);
    },
    [actor]
  );

  const handleTransferSubmit = useCallback(
    (input: {
      amount: number;
      destinationId: string;
      destinationName: string;
      reference: string;
      description: string;
    }) => {
      if (!actor) return;
      transferToBank(input, actor);
      setTransferOpen(false);
    },
    [actor]
  );

  const handleAdjustmentSubmit = useCallback(
    (input: { direction: "credit" | "debit"; amount: number; reason: string }) => {
      if (!actor) return;
      createAdjustment(input, actor);
      setAdjustmentOpen(false);
    },
    [actor]
  );

  const handleApproveConfirm = useCallback(
    (eventId: string) => {
      if (!actor) return;
      approveOutbound(eventId, actor);
      setApproveTarget(null);
    },
    [actor]
  );

  const handleRejectConfirm = useCallback(
    (eventId: string, reason: string) => {
      if (!actor) return;
      rejectOutbound(eventId, reason, actor);
      setRejectTarget(null);
    },
    [actor]
  );

  const handleSettleConfirm = useCallback(
    (event: TreasuryEvent) => {
      if (!actor) return;
      settleOutbound(event.id, actor);
      setApproveTarget(null);
      setRejectTarget(null);
    },
    [actor]
  );

  const handleReconcileConfirm = useCallback(
    (eventId: string, status: TreasuryReconciliationStatus, reference: string) => {
      if (!actor) return;
      reconcileEvent(eventId, status, reference, actor);
      setReconcileTarget(null);
    },
    [actor]
  );

  if (!canView) {
    return (
      <ErrorState
        title="You do not have access to the treasury"
        description="Ask an administrator to grant you the treasury:view permission."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Treasury"
        description="Platform cash account. Every real money movement in Atlas passes through here. Five liability pools sit against it. Not yet wired to a real banking layer."
        meta={
          <>
            <span>{events.length} events</span>
            <span className="text-neutral-400">·</span>
            <span>{rows.length} after filters</span>
            <span className="text-neutral-400">·</span>
            <span>{summary.pendingApprovalCount} awaiting approval</span>
          </>
        }
        actions={
          <>
            <Can permission={PERMISSIONS.TREASURY_MANAGE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdjustmentOpen(true)}
                disabled={!actor}
              >
                Adjustment
              </Button>
            </Can>
            <Can permission={PERMISSIONS.TREASURY_MANAGE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferOpen(true)}
                disabled={!actor}
              >
                Transfer to bank
              </Button>
            </Can>
            <Can permission={PERMISSIONS.TREASURY_FUND}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setFundOpen(true)}
                disabled={!actor}
              >
                Fund treasury
              </Button>
            </Can>
            <Can permission={PERMISSIONS.EXPORT}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                disabled={rows.length === 0}
              >
                Export
              </Button>
            </Can>
          </>
        }
      />

      <TreasuryMockBanner />

      {error ? (
        <ErrorState title="Could not load treasury" description={error.message} />
      ) : (
        <>
          <TreasurySummaryCards summary={summary} />

          <TreasuryCoverageBanner summary={summary} />

          <TreasuryFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />

          {rows.length === 0 && !isLoading ? (
            <TreasuryEmptyState hasFilters={hasFilters} />
          ) : (
            <TreasuryStatementTable
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

      <TreasuryDetailDrawer
        event={selectedEvent}
        now={nowMs}
        onClose={handleCloseDrawer}
        onApprove={setApproveTarget}
        onReject={setRejectTarget}
        onSettle={handleSettleConfirm}
        onReconcile={setReconcileTarget}
      />

      <TreasuryFundModal
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        onSubmit={handleFundSubmit}
      />

      <TreasuryTransferToBankModal
        open={transferOpen}
        availableBalance={summary.available}
        onClose={() => setTransferOpen(false)}
        onSubmit={handleTransferSubmit}
      />

      <TreasuryAdjustmentModal
        open={adjustmentOpen}
        onClose={() => setAdjustmentOpen(false)}
        onSubmit={handleAdjustmentSubmit}
      />

      <TreasuryApproveOutboundModal
        event={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
      />

      <TreasuryRejectOutboundModal
        event={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />

      <TreasuryReconcileModal
        event={reconcileTarget}
        onClose={() => setReconcileTarget(null)}
        onConfirm={handleReconcileConfirm}
      />
    </div>
  );
}