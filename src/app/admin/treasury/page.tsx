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
import { useTreasuryPeriods } from "@/lib/admin/hooks/use-treasury-periods";
import { useProviderPayouts } from "@/lib/admin/hooks/use-provider-payout";
import { useOrders } from "@/lib/admin/hooks/use-orders";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";
import { useProviders } from "@/lib/admin/hooks/use-providers";
import { TreasuryMockBanner } from "@/components/admin/treasury/treasury-mock-banner";
import { TreasurySummaryCards } from "@/components/admin/treasury/treasury-summary-cards";
import { TreasuryCoverageBanner } from "@/components/admin/treasury/treasury-coverage-banner";
import { TreasuryStatementTable } from "@/components/admin/treasury/treasury-statement-table";
import { TreasuryFilters } from "@/components/admin/treasury/treasury-filters";
import { TreasuryEmptyState } from "@/components/admin/treasury/treasury-empty-state";
import { TreasuryDetailDrawer } from "@/components/admin/treasury/treasury-detail-drawer";
import { TreasuryPeriodsView } from "@/components/admin/treasury/treasury-periods-view";
import { TreasuryClosePeriodModal } from "@/components/admin/treasury/treasury-close-period-modal";
import { TreasuryFundModal } from "@/components/admin/treasury/treasury-fund-modal";
import { TreasuryTransferToBankModal } from "@/components/admin/treasury/treasury-transfer-to-bank-modal";
import { TreasuryAdjustmentModal } from "@/components/admin/treasury/treasury-adjustment-modal";
import { TreasuryApproveOutboundModal } from "@/components/admin/treasury/treasury-approve-outbound-modal";
import { TreasuryRejectOutboundModal } from "@/components/admin/treasury/treasury-reject-outbound-modal";
import { TreasuryReconcileModal } from "@/components/admin/treasury/treasury-reconcile-modal";
import { ProviderPayoutsView } from "@/components/admin/treasury/provider-payouts-view";
import { ProviderPayoutDetailDrawer } from "@/components/admin/treasury/provider-payout-detail-drawer";
import { ProviderPayoutCreateModal } from "@/components/admin/treasury/provider-payout-create-modal";
import {
  ProviderPayoutApproveModal,
  type ProviderPayoutAction,
} from "@/components/admin/treasury/provider-payout-approve-modal";
import {
  approveOutbound,
  closePeriod,
  createAdjustment,
  fundTreasury,
  reconcileEvent,
  rejectOutbound,
  settleOutbound,
  transferToBank,
} from "@/lib/domains/treasury/admin-actions";
import {
  approveProviderPayoutBatch,
  cancelProviderPayoutBatch,
  createProviderPayoutBatch,
  failProviderPayoutBatch,
  settleProviderPayoutBatch,
  submitProviderPayoutBatch,
} from "@/lib/domains/treasury/provider-payout-mutations";
import type { ProviderPayoutBatch } from "@/lib/domains/treasury/provider-payout-types";
import type { PayoutOrderInput } from "@/lib/domains/treasury/provider-payout-types";
import { exportTreasuryCsv } from "@/lib/admin/treasury/treasury-csv-export";
import type {
  TreasuryActor,
  TreasuryApprovalStatus,
  TreasuryDirection,
  TreasuryEvent,
  TreasuryEventFilters,
  TreasuryEventKind,
  TreasuryReconciliationStatus,
} from "@/lib/domains/treasury/types";
import type { TreasuryPeriodId } from "@/lib/domains/treasury/period-types";
import {
  DEFAULT_TREASURY_PAGE_SIZE,
  TREASURY_APPROVAL_ORDER,
  TREASURY_DIRECTION_ORDER,
  TREASURY_KIND_ORDER,
  TREASURY_RECONCILIATION_ORDER,
} from "@/lib/domains/treasury/constants";

type TreasuryView = "statement" | "periods" | "provider_payouts";

const TREASURY_VIEW_VALUES: TreasuryView[] = [
  "statement",
  "periods",
  "provider_payouts",
];

const VIEW_LABEL: Record<TreasuryView, string> = {
  statement: "Statement",
  periods: "Periods",
  provider_payouts: "Provider payouts",
};

function parseView(raw: string | null): TreasuryView {
  if (raw && (TREASURY_VIEW_VALUES as string[]).includes(raw)) {
    return raw as TreasuryView;
  }
  return "statement";
}

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
    filters.reconciliationStatus =
      reconciliation as TreasuryReconciliationStatus;
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

interface PayoutActionTarget {
  batch: ProviderPayoutBatch;
  action: ProviderPayoutAction;
}

function requiresReasonForAction(action: ProviderPayoutAction): boolean {
  return action === "cancel" || action === "fail";
}

export default function TreasuryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canView = useCan(PERMISSIONS.TREASURY_VIEW);
  const canManage = useCan(PERMISSIONS.TREASURY_MANAGE);
  const currentAdmin = useCurrentAdmin();
  const actor = useMemo(() => actorFrom(currentAdmin), [currentAdmin]);

  const activeView = useMemo(
    () => parseView(searchParams.get("view")),
    [searchParams]
  );
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const { events, summary, rows, isLoading, error, nowMs } =
    useTreasury(filters);
  const periods = useTreasuryPeriods();

  const payoutState = useProviderPayouts();
  const { orders } = useOrders();
  const { categories: catalog } = useCatalog();
  const { providers } = useProviders();

  const [fundOpen, setFundOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [approveTarget, setApproveTarget] =
    useState<TreasuryEvent | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<TreasuryEvent | null>(null);
  const [reconcileTarget, setReconcileTarget] =
    useState<TreasuryEvent | null>(null);
  const [closeTarget, setCloseTarget] = useState<TreasuryPeriodId | null>(null);
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  const [payoutCreateOpen, setPayoutCreateOpen] = useState(false);
  const [payoutDetailTarget, setPayoutDetailTarget] =
    useState<ProviderPayoutBatch | null>(null);
  const [payoutActionTarget, setPayoutActionTarget] =
    useState<PayoutActionTarget | null>(null);

  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [searchParams]);

  const selectedEventId = searchParams.get("event");
  const selectedEvent = useMemo(
    () =>
      selectedEventId
        ? events.find((e) => e.id === selectedEventId) ?? null
        : null,
    [events, selectedEventId]
  );

  const pageSize = DEFAULT_TREASURY_PAGE_SIZE;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  const hasFilters = Object.keys(filters).length > 0;

  const payoutOrders: PayoutOrderInput[] = useMemo(
    () =>
      orders
        .filter((o) => o.status === "successful")
        .map((o) => ({
          providerId: o.providerId,
          serviceId: o.serviceId,
          createdAt: o.createdAt,
        })),
    [orders]
  );

  const providerOptions = useMemo(
    () => providers.map((p) => ({ id: p.id, name: p.name })),
    [providers]
  );

  const availablePeriodIds = useMemo(() => {
    const current = periods.periods.find((p) => p.status === "open");
    return periods.periods
      .filter((p) => p.status === "open" && p !== current)
      .map((p) => p.periodId)
      .filter((id) => !periods.periods.some((p) => p.periodId === id && p.status === "closed"));
  }, [periods.periods]);

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

  const handleViewChange = useCallback(
    (view: TreasuryView) => {
      setParam("view", view);
    },
    [setParam]
  );

  const handleFiltersChange = useCallback(
    (next: TreasuryEventFilters) => {
      const params = filtersToParams(next);
      params.set("view", "statement");
      router.replace("/admin/treasury?" + params.toString());
    },
    [router]
  );

  const handleFiltersReset = useCallback(() => {
    router.replace("/admin/treasury?view=statement");
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
    (input: {
      direction: "credit" | "debit";
      amount: number;
      reason: string;
    }) => {
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
    (
      eventId: string,
      status: TreasuryReconciliationStatus,
      reference: string
    ) => {
      if (!actor) return;
      reconcileEvent(eventId, status, reference, actor);
      setReconcileTarget(null);
    },
    [actor]
  );

  const handleClosePeriodRequest = useCallback((periodId: TreasuryPeriodId) => {
    setCloseTarget(periodId);
  }, []);

  const handleClosePeriodConfirm = useCallback(
    (notes: string) => {
      if (!actor || !closeTarget) return;
      setCloseSubmitting(true);
      const result = closePeriod(
        {
          periodId: closeTarget,
          nowMs: Date.now(),
          notes: notes || undefined,
        },
        actor
      );
      setCloseSubmitting(false);
      if (result.ok) {
        setCloseTarget(null);
      }
    },
    [actor, closeTarget]
  );

  const handlePayoutCreateSubmit = useCallback(
    (input: {
      periodId: string;
      providerId: string;
      providerName: string;
      notes?: string;
    }) => {
      if (!actor) return;
      const result = createProviderPayoutBatch(
        input,
        payoutOrders,
        catalog,
        actor
      );
      if (result.ok) {
        setPayoutCreateOpen(false);
      }
    },
    [actor, payoutOrders, catalog]
  );

  const handlePayoutAction = useCallback(
    (batch: ProviderPayoutBatch, action: ProviderPayoutAction) => {
      if (!actor) return;
      if (action === "submit") {
        submitProviderPayoutBatch(batch.id, actor);
        setPayoutActionTarget(null);
        setPayoutDetailTarget(null);
        return;
      }
      if (action === "approve") {
        approveProviderPayoutBatch(batch.id, actor);
        setPayoutActionTarget(null);
        setPayoutDetailTarget(null);
        return;
      }
      if (action === "settle") {
        settleProviderPayoutBatch(batch.id, actor);
        setPayoutActionTarget(null);
        setPayoutDetailTarget(null);
        return;
      }
      // cancel and fail require a reason; handled in confirm with reason arg
    },
    [actor]
  );

  const handlePayoutActionConfirm = useCallback(
    (reason?: string) => {
      if (!actor || !payoutActionTarget) return;
      const { batch, action } = payoutActionTarget;
      if (action === "cancel") {
        if (!reason) return;
        cancelProviderPayoutBatch(batch.id, reason, actor);
      } else if (action === "fail") {
        if (!reason) return;
        failProviderPayoutBatch(batch.id, reason, actor);
      } else if (action === "submit") {
        submitProviderPayoutBatch(batch.id, actor);
      } else if (action === "approve") {
        approveProviderPayoutBatch(batch.id, actor);
      } else if (action === "settle") {
        settleProviderPayoutBatch(batch.id, actor);
      }
      setPayoutActionTarget(null);
      setPayoutDetailTarget(null);
    },
    [actor, payoutActionTarget]
  );

  if (!canView) {
    return (
      <ErrorState
        title="You do not have access to the treasury"
        description="Ask an administrator to grant you the treasury:view permission."
      />
    );
  }

  const headerMeta = (
    <>
      <span>{events.length} events</span>
      <span className="text-neutral-400">·</span>
      <span>{rows.length} after filters</span>
      <span className="text-neutral-400">·</span>
      <span>{summary.pendingApprovalCount} awaiting approval</span>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Treasury"
        description="Platform cash account. Every real money movement in Atlas passes through here. Five liability pools sit against it. Not yet wired to a real banking layer."
        meta={headerMeta}
        actions={
          <>
            {activeView === "statement" && (
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
            )}
            {activeView === "provider_payouts" && (
              <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPayoutCreateOpen(true)}
                  disabled={!actor}
                >
                  New payout batch
                </Button>
              </Can>
            )}
          </>
        }
      />

      <TreasuryMockBanner />

      <div
        role="tablist"
        aria-label="Treasury views"
        className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800"
      >
        {TREASURY_VIEW_VALUES.map((view) => {
          const selected = activeView === view;
          return (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={selected}
              id={"treasury-tab-" + view}
              aria-controls={"treasury-panel-" + view}
              onClick={() => handleViewChange(view)}
              className={
                "border-b-2 px-4 py-2 text-sm font-medium " +
                (selected
                  ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200")
              }
            >
              {VIEW_LABEL[view]}
            </button>
          );
        })}
      </div>

      {error ? (
        <ErrorState
          title="Could not load treasury"
          description={error.message}
        />
      ) : activeView === "statement" ? (
        <div
          role="tabpanel"
          id="treasury-panel-statement"
          aria-labelledby="treasury-tab-statement"
          className="space-y-4"
        >
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
        </div>
      ) : activeView === "periods" ? (
        <div
          role="tabpanel"
          id="treasury-panel-periods"
          aria-labelledby="treasury-tab-periods"
        >
          <TreasuryPeriodsView
            loading={periods.loading}
            periods={periods.periods}
            nextClosablePeriodId={periods.nextClosablePeriodId}
            nextClosableReadiness={periods.nextClosableReadiness}
            nowMs={periods.nowMs}
            canClose={canManage}
            onClosePeriod={handleClosePeriodRequest}
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="treasury-panel-provider_payouts"
          aria-labelledby="treasury-tab-provider_payouts"
        >
          <ProviderPayoutsView
            batches={payoutState.batches}
            currentPeriodId={periods.periods[0]?.periodId ?? null}
            onCreate={() => setPayoutCreateOpen(true)}
            onOpen={(batch) => setPayoutDetailTarget(batch)}
          />
        </div>
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

      <TreasuryClosePeriodModal
        open={closeTarget !== null}
        periodId={closeTarget ?? ""}
        readiness={periods.nextClosableReadiness}
        submitting={closeSubmitting}
        onClose={() => setCloseTarget(null)}
        onConfirm={handleClosePeriodConfirm}
      />

      <ProviderPayoutCreateModal
        open={payoutCreateOpen}
        availablePeriodIds={availablePeriodIds}
        providers={providerOptions}
        orders={payoutOrders}
        catalog={catalog}
        onClose={() => setPayoutCreateOpen(false)}
        onSubmit={handlePayoutCreateSubmit}
      />

      <ProviderPayoutDetailDrawer
        open={payoutDetailTarget !== null}
        batch={payoutDetailTarget}
        onClose={() => setPayoutDetailTarget(null)}
        onSubmit={(b) => handlePayoutAction(b, "submit")}
        onApprove={(b) => handlePayoutAction(b, "approve")}
        onSettle={(b) => handlePayoutAction(b, "settle")}
        onCancel={(b) => setPayoutActionTarget({ batch: b, action: "cancel" })}
        onFail={(b) => setPayoutActionTarget({ batch: b, action: "fail" })}
      />

      <ProviderPayoutApproveModal
        open={payoutActionTarget !== null}
        action={payoutActionTarget?.action ?? "approve"}
        amount={payoutActionTarget?.batch.totalAmount ?? 0}
        requireReason={
          payoutActionTarget
            ? requiresReasonForAction(payoutActionTarget.action)
            : false
        }
        onClose={() => setPayoutActionTarget(null)}
        onConfirm={handlePayoutActionConfirm}
      />
    </div>
  );
}