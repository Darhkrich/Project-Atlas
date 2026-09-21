"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Input } from "@/components/admin/ui/input";
import { PaymentsTabs } from "@/components/admin/payments/payments-tabs";
import { PaymentsFilters } from "@/components/admin/payments/payments-filters";
import { PaymentsLedgerTable } from "@/components/admin/payments/payments-ledger-table";
import { WalletWithdrawalQueueTable } from "@/components/admin/payments/wallet-withdrawal-queue-table";
import { LivePaymentsCard } from "@/components/admin/payments/live-payments-card";
import { FailedPaymentsCard } from "@/components/admin/payments/failed-payments-card";
import { PaymentDetailDrawer } from "@/components/admin/payments/payment-detail-drawer";
import {
  WalletSummaryCards,
  type WalletSummaryCardKey,
} from "@/components/admin/payments/wallet-summary-cards";
import { WalletWithdrawalApproveModal } from "@/components/admin/payments/wallet-withdrawal-approve-modal";
import { WalletWithdrawalRejectModal } from "@/components/admin/payments/wallet-withdrawal-reject-modal";
import { WalletWithdrawalDetailModal } from "@/components/admin/payments/wallet-withdrawal-detail-modal";
import { WalletAutoApproveConfigModal } from "@/components/admin/payments/wallet-auto-approve-config-modal";
import { RetryPaymentModal } from "@/components/admin/payments/retry-payment-modal";
import { ReconcilePaymentModal } from "@/components/admin/payments/reconcile-payment-modal";
import { FlagPaymentModal } from "@/components/admin/payments/flag-payment-modal";
import { usePayments } from "@/lib/admin/hooks/use-payments";
import { useWallets } from "@/lib/admin/hooks/use-wallets";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { Can } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { paymentsToCsv } from "@/lib/admin/payments/payments-csv-export";
import {
  walletLedgerToCsv,
  walletQueueToCsv,
} from "@/lib/admin/wallets/wallet-csv-export";
import {
  DEFAULT_PAYMENTS_FILTERS,
  type PaymentsFilters as PaymentsFilterShape,
} from "@/lib/admin/payments/payments-constants";
import {
  DEFAULT_WALLET_FILTERS,
  WALLET_OWNER_TYPE_FILTERS,
  WALLET_QUEUE_VIEWS,
  WALLET_QUEUE_VIEW_LABELS,
  type WalletFilters,
} from "@/lib/admin/wallets/wallet-constants";
import {
  flagPayment,
  reconcilePayment,
  retryPayment,
} from "@/lib/admin/payments/payments-mutations";
import {
  approveWalletWithdrawal,
  rejectWalletWithdrawal,
  updateWalletAutoApproveConfig,
} from "@/lib/admin/wallets/wallet-mutations";
import {
  approveStorefrontRefund,
  rejectStorefrontRefund,
} from "@/lib/domains/wallet/storefront-user-refund-mutations";
import type { Payment, PaymentFlagReason } from "@/lib/admin/types/payment";
import type { PaymentsLedgerRow } from "@/lib/admin/payments/payments-projection";
import type { WalletWithdrawalQueueRow } from "@/lib/admin/types/customer-wallet";
import { QUEUE_OWNER_TYPE_LABEL } from "@/lib/admin/wallets/wallet-labels";

interface Toast {
  kind: "success" | "error";
  text: string;
}

type PaymentAction =
  | { kind: "retry"; payment: Payment }
  | { kind: "reconcile"; payment: Payment }
  | { kind: "flag"; payment: Payment }
  | null;

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PaymentsPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function PaymentsPageInner() {
  const admin = useCurrentAdmin();
  const nowMs = useNow();

  const paymentsState = usePayments();
  const walletsState = useWallets();

  const {
    filters: paymentFilters,
    setFilters: setPaymentFilters,
    clearFilters: clearPaymentFilters,
    hasActive: paymentHasActive,
  } = useUrlFilters<PaymentsFilterShape>(DEFAULT_PAYMENTS_FILTERS);

  const {
    filters: walletFilters,
    setFilters: setWalletFilters,
    clearFilters: clearWalletFilters,
    hasActive: walletHasActive,
  } = useUrlFilters<WalletFilters>(DEFAULT_WALLET_FILTERS);

  const debouncedPaymentSearch = useDebouncedValue(paymentFilters.q, 300);
  const debouncedWalletSearch = useDebouncedValue(walletFilters.q, 300);

  const paymentSearchRef = useRef<HTMLInputElement>(null);
  const walletSearchRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"ledger" | "wallets">("ledger");
  const [activeSummary, setActiveSummary] =
    useState<WalletSummaryCardKey | null>(null);
  const [action, setAction] = useState<PaymentAction>(null);
  const [drawerPayment, setDrawerPayment] = useState<Payment | null>(null);
  const [detailRow, setDetailRow] = useState<WalletWithdrawalQueueRow | null>(
    null
  );
  const [approveTarget, setApproveTarget] =
    useState<WalletWithdrawalQueueRow | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<WalletWithdrawalQueueRow | null>(null);
  const [walletConfigOpen, setWalletConfigOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const paymentRows = useMemo(() => {
    const q = debouncedPaymentSearch.trim().toLowerCase();
    let list = paymentsState.ledgerRows;
    if (q) {
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q) ||
          r.user.name.toLowerCase().includes(q)
      );
    }
    if (paymentFilters.source) {
      list = list.filter((r) => r.source === paymentFilters.source);
    }
    if (paymentFilters.method) {
      list = list.filter((r) => r.methodId === paymentFilters.method);
    }
    if (paymentFilters.status) {
      list = list.filter((r) => r.status === paymentFilters.status);
    }
    if (paymentFilters.sort === "oldest") {
      list = [...list].reverse();
    } else if (paymentFilters.sort === "amount_largest") {
      list = [...list].sort((a, b) => b.amount - a.amount);
    } else if (paymentFilters.sort === "amount_smallest") {
      list = [...list].sort((a, b) => a.amount - b.amount);
    }
    return list;
  }, [
    paymentsState.ledgerRows,
    debouncedPaymentSearch,
    paymentFilters.source,
    paymentFilters.method,
    paymentFilters.status,
    paymentFilters.sort,
  ]);

  const walletRows = useMemo(() => {
    const q = debouncedWalletSearch.trim().toLowerCase();
    let list = walletsState.queueRows;
    if (q) {
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.ownerId.toLowerCase().includes(q) ||
          (r.ownerEmail ?? "").toLowerCase().includes(q) ||
          (r.storefrontName ?? "").toLowerCase().includes(q)
      );
    }
    if (walletFilters.ownerType) {
      list = list.filter((r) => r.ownerType === walletFilters.ownerType);
    }
    if (walletFilters.status) {
      list = list.filter((r) => r.status === walletFilters.status);
    }
    if (walletFilters.view === "awaiting") {
      list = list.filter((r) => r.status === "pending_admin");
    } else if (walletFilters.view === "pending_processing") {
      list = list.filter((r) => r.status === "pending_processing");
    } else if (walletFilters.view === "history") {
      list = list.filter(
        (r) =>
          r.status === "completed" ||
          r.status === "failed" ||
          r.status === "rejected"
      );
    }
    return list;
  }, [
    walletsState.queueRows,
    debouncedWalletSearch,
    walletFilters.ownerType,
    walletFilters.status,
    walletFilters.view,
  ]);

  const liveRows: PaymentsLedgerRow[] = useMemo(
    () =>
      paymentsState.ledgerRows.filter(
        (r) => r.status === "pending" || r.status === "processing"
      ),
    [paymentsState.ledgerRows]
  );

  const failedRows: PaymentsLedgerRow[] = useMemo(
    () => paymentsState.ledgerRows.filter((r) => r.status === "failed"),
    [paymentsState.ledgerRows]
  );

  const walletPageSize = Math.max(5, Number(walletFilters.pageSize) || 20);
  const walletPage = Math.max(1, Number(walletFilters.page) || 1);
  const walletTotalPages = Math.max(
    1,
    Math.ceil(walletRows.length / walletPageSize)
  );
  const walletSafePage = Math.min(walletPage, walletTotalPages);
  const walletPaginated = useMemo(() => {
    const start = (walletSafePage - 1) * walletPageSize;
    return walletRows.slice(start, start + walletPageSize);
  }, [
    walletRows,
    walletSafePage,
    walletPageSize,
  ]);

  const paymentPageSize = Math.max(5, Number(paymentFilters.pageSize) || 20);
  const paymentPage = Math.max(1, Number(paymentFilters.page) || 1);
  const paymentTotalPages = Math.max(
    1,
    Math.ceil(paymentRows.length / paymentPageSize)
  );
  const paymentSafePage = Math.min(paymentPage, paymentTotalPages);
  const paymentPaginated = useMemo(() => {
    const start = (paymentSafePage - 1) * paymentPageSize;
    return paymentRows.slice(start, start + paymentPageSize);
  }, [
    paymentRows,
    paymentSafePage,
    paymentPageSize,
  ]);

  const handlePaymentExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(
      "atlas-payments-" + date + ".csv",
      paymentsToCsv(paymentRows)
    );
  };

  const handleWalletExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const date = new Date().toISOString().slice(0, 10);
    if (tab === "wallets") {
      downloadCsv(
        "atlas-wallet-withdrawals-" + date + ".csv",
        walletQueueToCsv(walletRows)
      );
    } else {
      downloadCsv(
        "atlas-wallet-ledger-" + date + ".csv",
        walletLedgerToCsv(walletsState.ledgerRows)
      );
    }
  };

  const handleRetry = () => {
    if (!action || action.kind !== "retry" || !admin) return;
    setSubmitting(true);
    const result = retryPayment(action.payment.id, {
      name: admin.name,
      email: admin.email,
    });
    setSubmitting(false);
    setToast({
      kind: result.ok ? "success" : "error",
      text: result.ok
        ? "Payment queued for retry."
        : result.error ?? "Retry failed.",
    });
    setAction(null);
    setDrawerPayment(null);
  };

  const handleReconcile = (providerReference: string, note: string) => {
    if (!action || action.kind !== "reconcile" || !admin) return;
    setSubmitting(true);
    const result = reconcilePayment(
      action.payment.id,
      providerReference,
      note,
      { name: admin.name, email: admin.email }
    );
    setSubmitting(false);
    setToast({
      kind: result.ok ? "success" : "error",
      text: result.ok
        ? "Reconciliation recorded."
        : result.error ?? "Reconcile failed.",
    });
    setAction(null);
    setDrawerPayment(null);
  };

  const handleFlag = (reason: PaymentFlagReason, note: string) => {
    if (!action || action.kind !== "flag" || !admin) return;
    setSubmitting(true);
    const result = flagPayment(action.payment.id, reason, note, {
      name: admin.name,
      email: admin.email,
    });
    setSubmitting(false);
    setToast({
      kind: result.ok ? "success" : "error",
      text: result.ok ? "Payment flagged." : result.error ?? "Flag failed.",
    });
    setAction(null);
    setDrawerPayment(null);
  };

  const handleWalletApprove = () => {
    if (!approveTarget || !admin) return;
    setSubmitting(true);

    const result =
      approveTarget.ownerType === "storefront_user"
        ? approveStorefrontRefund(approveTarget.id, {
            id: admin.id ?? admin.email,
            name: admin.name,
            email: admin.email,
          })
        : approveWalletWithdrawal(approveTarget.id, {
            id: admin.id ?? admin.email,
            name: admin.name,
            email: admin.email,
          });

    setSubmitting(false);
    setToast({
      kind: result.ok ? "success" : "error",
      text: result.ok
        ? "Withdrawal approved."
        : result.error ?? "Approval failed.",
    });
    setApproveTarget(null);
  };

  const handleWalletReject = (reason: string) => {
    if (!rejectTarget || !admin) return;
    setSubmitting(true);

    const result =
      rejectTarget.ownerType === "storefront_user"
        ? rejectStorefrontRefund(rejectTarget.id, reason, {
            id: admin.id ?? admin.email,
            name: admin.name,
            email: admin.email,
          })
        : rejectWalletWithdrawal(rejectTarget.id, reason, {
            id: admin.id ?? admin.email,
            name: admin.name,
            email: admin.email,
          });

    setSubmitting(false);
    setToast({
      kind: result.ok ? "success" : "error",
      text: result.ok
        ? "Withdrawal rejected."
        : result.error ?? "Rejection failed.",
    });
    setRejectTarget(null);
  };

  const handleWalletConfigSave = (patch: {
    thresholdGHS: number;
    feeRatePercent: number;
    dailyCap: number;
  }) => {
    if (!admin) return;
    setSubmitting(true);
    const result = updateWalletAutoApproveConfig(patch, {
      name: admin.name,
      email: admin.email,
    });
    setSubmitting(false);
    setToast({
      kind: result.ok ? "success" : "error",
      text: result.ok
        ? "Wallet rules updated."
        : result.error ?? "Rules update failed.",
    });
    setWalletConfigOpen(false);
  };

  const onToggleSummary = (key: WalletSummaryCardKey | null) => {
    setActiveSummary(key);
    if (key === "awaiting") {
      setTab("wallets");
      setWalletFilters({ view: "awaiting", page: "1" });
    } else {
      setTab("wallets");
      setWalletFilters(DEFAULT_WALLET_FILTERS);
    }
  };

  const goToAwaitingWallets = () => {
    setTab("wallets");
    setWalletFilters({ view: "awaiting", page: "1" });
  };

  const headerMeta = (
    <>
      <span>
        {paymentsState.summary.totalCount} payments -{" "}
        {formatCurrency(paymentsState.summary.totalVolume)} volume
      </span>
      <span aria-hidden="true">·</span>
      <span>{paymentsState.summary.flaggedCount} flagged</span>
      <span aria-hidden="true">·</span>
      <span>
        {walletsState.summary.awaitingApprovalCount} withdrawals awaiting
        approval
      </span>
    </>
  );

  const drawerFlags = drawerPayment
    ? paymentsState.flags.filter((f) => f.paymentId === drawerPayment.id)
    : [];
  const drawerRecons = drawerPayment
    ? paymentsState.reconciliations.filter(
        (r) => r.paymentId === drawerPayment.id
      )
    : [];

  const loading = paymentsState.loading || walletsState.loading;

  const exceedingThresholdCount = walletsState.summary.exceedingThresholdCount;
  const detailChangeCount = walletsState.summary.detailChangeCount;
  const storefrontAwaitingCount =
    walletsState.summary.storefrontUserAwaitingCount;
  const totalAttention =
    exceedingThresholdCount + detailChangeCount + storefrontAwaitingCount;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Every payment event across every section. Operate on the record, approve wallet withdrawals, and track Atlas revenue."
        meta={headerMeta}
        actions={
          <ExportMenu
            onExport={tab === "ledger" ? handlePaymentExport : handleWalletExport}
            formats={["csv"]}
          />
        }
      />

      <WalletSummaryCards
        summary={walletsState.summary}
        active={activeSummary}
        onToggle={onToggleSummary}
        loading={loading}
      />

      <PaymentsTabs
        value={tab}
        onChange={setTab}
        walletPendingCount={walletsState.summary.awaitingApprovalCount}
      />

      {tab === "ledger" ? (
        <div
          role="tabpanel"
          id="payments-panel-ledger"
          aria-labelledby="payments-tab-ledger"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <LivePaymentsCard
              rows={liveRows}
              onViewAll={() =>
                setPaymentFilters({ status: "pending", page: "1" })
              }
              onRowClick={(r) => setDrawerPayment(r.raw)}
            />
            <FailedPaymentsCard
              rows={failedRows}
              onViewAll={() =>
                setPaymentFilters({ status: "failed", page: "1" })
              }
              onRowClick={(r) => setDrawerPayment(r.raw)}
              onRetry={(r) => setAction({ kind: "retry", payment: r.raw })}
            />

            <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Needs your attention
                </p>
                {totalAttention > 0 && (
                  <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700 dark:bg-warning-900/60 dark:text-warning-300">
                    {formatNumber(totalAttention)}
                  </span>
                )}
              </div>

              <ul role="list" className="mt-3 space-y-2">
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Withdrawals over threshold
                  </span>
                  <Badge
                    variant={exceedingThresholdCount > 0 ? "warning" : "neutral"}
                    size="sm"
                  >
                    {formatNumber(exceedingThresholdCount)}
                  </Badge>
                </li>
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Storefront refunds
                  </span>
                  <Badge
                    variant={storefrontAwaitingCount > 0 ? "info" : "neutral"}
                    size="sm"
                  >
                    {formatNumber(storefrontAwaitingCount)}
                  </Badge>
                </li>
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    Detail change pending
                  </span>
                  <Badge
                    variant={detailChangeCount > 0 ? "warning" : "neutral"}
                    size="sm"
                  >
                    {formatNumber(detailChangeCount)}
                  </Badge>
                </li>
              </ul>

              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                {totalAttention === 0
                  ? "Nothing on the wallet queue needs your review."
                  : "Withdrawals waiting for your decision on the wallets tab."}
              </p>

              <button
                type="button"
                onClick={goToAwaitingWallets}
                className="mt-3 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                aria-label="Open wallet withdrawal queue"
              >
                Open wallet queue
              </button>
            </div>
          </div>

          <PaymentsFilters
            value={paymentFilters}
            hasActive={paymentHasActive}
            searchInputRef={paymentSearchRef}
            onChange={(patch) => setPaymentFilters(patch)}
            onClear={clearPaymentFilters}
          />

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading payments"
              className="space-y-2"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : paymentRows.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {paymentHasActive ? (
                <EmptyState
                  variant="no_results"
                  title="No payments match these filters"
                  description="Try a different source or clear the filters."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearPaymentFilters}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  variant="no_data"
                  title="No payments yet"
                  description="Payments appear here as customers, resellers, and merchants transact."
                />
              )}
            </div>
          ) : (
            <PaymentsLedgerTable
              rows={paymentPaginated}
              pageSize={paymentPageSize}
              currentPage={paymentSafePage}
              totalRows={paymentRows.length}
              nowMs={nowMs}
              onView={(r) => setDrawerPayment(r.raw)}
              onPageChange={(p) => setPaymentFilters({ page: String(p) })}
            />
          )}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="payments-panel-wallets"
          aria-labelledby="payments-tab-wallets"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <div className="min-w-56 flex-1">
                <label
                  htmlFor="wallet-search"
                  className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Search
                </label>
                <Input
                  id="wallet-search"
                  ref={walletSearchRef}
                  aria-label="Search wallet withdrawals"
                  placeholder="Owner name, ID, email, storefront"
                  value={walletFilters.q}
                  onChange={(e) =>
                    setWalletFilters({ q: e.target.value, page: "1" })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="wallet-view"
                  className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  View
                </label>
                <select
                  id="wallet-view"
                  aria-label="Filter by queue view"
                  value={walletFilters.view}
                  onChange={(e) =>
                    setWalletFilters({
                      view: e.target.value as WalletFilters["view"],
                      page: "1",
                    })
                  }
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {WALLET_QUEUE_VIEWS.map((v) => (
                    <option key={v} value={v}>
                      {WALLET_QUEUE_VIEW_LABELS[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wallet-owner-type"
                  className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Owner type
                </label>
                <select
                  id="wallet-owner-type"
                  aria-label="Filter by owner type"
                  value={walletFilters.ownerType}
                  onChange={(e) =>
                    setWalletFilters({
                      ownerType:
                        e.target.value as WalletFilters["ownerType"],
                      page: "1",
                    })
                  }
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">All owners</option>
                  {WALLET_OWNER_TYPE_FILTERS.map((v) => (
                    <option key={v} value={v}>
                      {QUEUE_OWNER_TYPE_LABEL[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wallet-status"
                  className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Status
                </label>
                <select
                  id="wallet-status"
                  aria-label="Filter by withdrawal status"
                  value={walletFilters.status}
                  onChange={(e) =>
                    setWalletFilters({
                      status: e.target.value as WalletFilters["status"],
                      page: "1",
                    })
                  }
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">All statuses</option>
                  <option value="pending_admin">Awaiting approval</option>
                  <option value="pending_processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {walletHasActive && (
                <Button variant="ghost" size="sm" onClick={clearWalletFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            <Can permission={PERMISSIONS.WALLETS_CONFIG}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWalletConfigOpen(true)}
              >
                Wallet rules
              </Button>
            </Can>
          </div>

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading wallet withdrawals"
              className="space-y-2"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : walletRows.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <EmptyState
                variant="no_data"
                title="No wallet withdrawals"
                description="Refund requests from customer and storefront user wallets appear here."
              />
            </div>
          ) : (
            <WalletWithdrawalQueueTable
              rows={walletPaginated}
              pageSize={walletPageSize}
              currentPage={walletSafePage}
              totalRows={walletRows.length}
              nowMs={nowMs}
              canApprove={Boolean(admin)}
              onView={(r) => setDetailRow(r)}
              onApprove={(r) => {
                setDetailRow(null);
                setApproveTarget(r);
              }}
              onReject={(r) => {
                setDetailRow(null);
                setRejectTarget(r);
              }}
              onPageChange={(p) => setWalletFilters({ page: String(p) })}
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Rows per page
        </span>
        <select
          aria-label="Rows per page"
          className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={
            tab === "wallets"
              ? walletFilters.pageSize
              : paymentFilters.pageSize
          }
          onChange={(e) =>
            tab === "wallets"
              ? setWalletFilters({ pageSize: e.target.value, page: "1" })
              : setPaymentFilters({ pageSize: e.target.value, page: "1" })
          }
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <PaymentDetailDrawer
        open={drawerPayment !== null}
        onClose={() => setDrawerPayment(null)}
        payment={drawerPayment}
        flags={drawerFlags}
        reconciliations={drawerRecons}
        nowMs={nowMs}
        canRetry={Boolean(admin)}
        canReconcile={Boolean(admin)}
        canFlag={Boolean(admin)}
        onRetry={(p) => setAction({ kind: "retry", payment: p })}
        onReconcile={(p) => setAction({ kind: "reconcile", payment: p })}
        onFlag={(p) => setAction({ kind: "flag", payment: p })}
      />

      <WalletWithdrawalDetailModal
        open={detailRow !== null}
        row={detailRow}
        nowMs={nowMs}
        canApprove={Boolean(admin)}
        onApprove={(r) => {
          setDetailRow(null);
          setApproveTarget(r);
        }}
        onReject={(r) => {
          setDetailRow(null);
          setRejectTarget(r);
        }}
        onClose={() => setDetailRow(null)}
      />

      <RetryPaymentModal
        open={action?.kind === "retry"}
        payment={action?.kind === "retry" ? action.payment : null}
        submitting={submitting}
        onSubmit={handleRetry}
        onClose={() => setAction(null)}
      />

      <ReconcilePaymentModal
        open={action?.kind === "reconcile"}
        payment={action?.kind === "reconcile" ? action.payment : null}
        submitting={submitting}
        onSubmit={handleReconcile}
        onClose={() => setAction(null)}
      />

      <FlagPaymentModal
        open={action?.kind === "flag"}
        payment={action?.kind === "flag" ? action.payment : null}
        submitting={submitting}
        onSubmit={handleFlag}
        onClose={() => setAction(null)}
      />

      <WalletWithdrawalApproveModal
        open={approveTarget !== null}
        row={approveTarget}
        wallet={
          approveTarget
            ? walletsState.wallets.find(
                (w) => w.id === approveTarget.walletId
              ) ?? null
            : null
        }
        submitting={submitting}
        onSubmit={handleWalletApprove}
        onClose={() => setApproveTarget(null)}
      />

      <WalletWithdrawalRejectModal
        open={rejectTarget !== null}
        row={rejectTarget}
        submitting={submitting}
        onSubmit={handleWalletReject}
        onClose={() => setRejectTarget(null)}
      />

      <WalletAutoApproveConfigModal
        open={walletConfigOpen}
        config={walletsState.config}
        submitting={submitting}
        onSubmit={handleWalletConfigSave}
        onClose={() => setWalletConfigOpen(false)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}