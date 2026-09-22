"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  PaymentsSummaryCards,
  type SummaryCardKey,
} from "@/components/admin/ecommerce/payments/payments-summary-cards";
import { PaymentsTabs } from "@/components/admin/ecommerce/payments/payments-tabs";
import {
  PaymentsFilters,
  type PaymentsFilterValues,
} from "@/components/admin/ecommerce/payments/payments-filters";
import { PaymentsLedgerTable } from "@/components/admin/ecommerce/payments/payments-ledger-table";
import { WithdrawalQueueTable } from "@/components/admin/ecommerce/payments/withdrawal-queue-table";
import { PaymentDetailDrawer } from "@/components/admin/ecommerce/payments/payment-detail-drawer";
import { WithdrawalApproveModal } from "@/components/admin/ecommerce/payments/withdrawal-approve-modal";
import { WithdrawalRejectModal } from "@/components/admin/ecommerce/payments/withdrawal-reject-modal";
import { AutoApproveConfigModal } from "@/components/admin/ecommerce/payments/auto-approve-config-modal";
import { useMerchantMoney } from "@/lib/admin/hooks/use-merchant-money";
import { useMerchants } from "@/lib/admin/hooks/use-merchants";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { Can } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { formatCurrency } from "@/lib/admin/formatters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  ledgerToCsv,
  withdrawalQueueToCsv,
} from "@/lib/admin/ecommerce/payments/payment-csv-export";
import {
  PAGE_SIZE,
  datePresetToSinceMs,
  type LedgerColumnKey,
} from "@/lib/admin/ecommerce/payments/payments-constants";
import {
  projectLedger,
  projectSummary,
  projectWithdrawalQueue,
} from "@/lib/admin/ecommerce/payments/payment-projection";
import {
  adminApproveWithdrawal,
  adminRejectWithdrawal,
} from "@/lib/admin/ecommerce/payments/payment-mutations";
import { adminUpdateAutoApproveConfig } from "@/lib/admin/ecommerce/payments/payment-config";
import type {
  LedgerRow,
  MerchantMoneyEvent,
  MetricWithDelta,
  PaymentsSummary,
  WithdrawalQueueRow,
} from "@/lib/admin/types/merchant-money";
import type { MerchantWithdrawalRequest } from "@/lib/domains/wallet/merchant-money/types";

const DEFAULT_FILTERS: PaymentsFilterValues = {
  tab: "ledger",
  q: "",
  flow: "",
  status: "",
  preset: "30d",
  sort: "newest",
  page: "1",
  pageSize: String(PAGE_SIZE),
};

const EMPTY_DELTA: MetricWithDelta = {
  current: 0,
  previous: 0,
  changePct: null,
  direction: "flat",
};

const EMPTY_SUMMARY: PaymentsSummary = {
  atlasRevenue: EMPTY_DELTA,
  atlasRevenueFeePercent: 0.5,
  atlasRevenueWithdrawalCount: 0,
  pendingApprovals: EMPTY_DELTA,
  pendingOldestIso: null,
  withdrawalVolume: EMPTY_DELTA,
  withdrawalCount: 0,
  withdrawalsByStatus: { completed: 0, processing: 0, failed: 0 },
  planCharges: EMPTY_DELTA,
  planChargeCount: 0,
  pastDuePlanCount: 0,
  failedEvents: EMPTY_DELTA,
  failedBreakdown: { plan: 0, checkout: 0, withdrawal: 0 },
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

function last4FromMasked(masked: string | undefined): string | undefined {
  if (!masked) return undefined;
  const digits = masked.replace(/\D+/g, "");
  if (digits.length === 0) return undefined;
  return digits.slice(-4);
}

export default function EcommercePaymentsPage() {
  return (
    <Suspense fallback={<PaymentsSkeleton />}>
      <PaymentsPageInner />
    </Suspense>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function PaymentsPageInner() {
  const admin = useCurrentAdmin();
  const nowMs = useNow();
  const { state, loading: moneyLoading, config } = useMerchantMoney();
  const { merchants, loading: merchantsLoading } = useMerchants();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<PaymentsFilterValues>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [visibleColumns, setVisibleColumns] = useState<LedgerColumnKey[]>([
    "amount",
    "fee",
    "status",
    "created",
  ]);

  const [selectedEvent, setSelectedEvent] = useState<MerchantMoneyEvent | null>(
    null
  );
  const [pendingApprove, setPendingApprove] =
    useState<MerchantWithdrawalRequest | null>(null);
  const [pendingReject, setPendingReject] =
    useState<MerchantWithdrawalRequest | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeCard, setActiveCard] = useState<SummaryCardKey | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const sinceMs = useMemo(() => {
    if (!nowMs) return 0;
    return datePresetToSinceMs(filters.preset, nowMs);
  }, [filters.preset, nowMs]);

  const ledgerRows = useMemo(() => {
    if (!state) return [] as LedgerRow[];
    const all = projectLedger(state, merchants);
    const q = debouncedSearch.trim().toLowerCase();

    let filtered = all;
    if (q) {
      filtered = filtered.filter(
        (r) =>
          r.merchantName.toLowerCase().includes(q) ||
          r.merchantId.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.sourceRef.toLowerCase().includes(q)
      );
    }
    if (filters.flow) {
      filtered = filtered.filter((r) => r.kind === filters.flow);
    }
    if (filters.preset !== "all" && sinceMs > 0) {
      filtered = filtered.filter(
        (r) => new Date(r.createdAt).getTime() >= sinceMs
      );
    }
    if (filters.sort === "oldest") {
      filtered = [...filtered].reverse();
    } else if (filters.sort === "largest") {
      filtered = [...filtered].sort((a, b) => b.amount - a.amount);
    }
    return filtered;
  }, [
    state,
    merchants,
    debouncedSearch,
    filters.flow,
    filters.preset,
    filters.sort,
    sinceMs,
  ]);

  const withdrawalRows = useMemo(() => {
    if (!state) return [] as WithdrawalQueueRow[];
    const all = projectWithdrawalQueue(state, merchants);
    const q = debouncedSearch.trim().toLowerCase();
    let filtered = all;
    if (q) {
      filtered = filtered.filter(
        (r) =>
          r.merchantName.toLowerCase().includes(q) ||
          r.merchantId.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }
    if (filters.preset !== "all" && sinceMs > 0) {
      filtered = filtered.filter(
        (r) => new Date(r.createdAt).getTime() >= sinceMs
      );
    }
    return filtered;
  }, [state, merchants, debouncedSearch, filters.preset, sinceMs]);

  const summary = useMemo(() => {
    if (!state || !nowMs) return EMPTY_SUMMARY;
    return projectSummary(state, sinceMs, nowMs);
  }, [state, sinceMs, nowMs]);

  const pageSize = Math.max(5, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);

  const currentRows =
    filters.tab === "withdrawals" ? withdrawalRows : ledgerRows;
  const totalRows = currentRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return currentRows.slice(start, start + pageSize);
  }, [currentRows, safePage, pageSize]);

  const selectedMerchant = useMemo(() => {
    if (!selectedEvent) return null;
    return merchants.find((m) => m.id === selectedEvent.merchantId) ?? null;
  }, [selectedEvent, merchants]);

  const onToggleCard = (key: SummaryCardKey | null) => {
    setActiveCard(key);
    if (key === "pendingApprovals") {
      setFilters({ tab: "withdrawals", preset: "all", page: "1" });
      return;
    }
    if (key === "atlasRevenue" || key === "withdrawalVolume") {
      setFilters({ tab: "withdrawals", preset: "30d", page: "1" });
      return;
    }
    if (key === "planCharges") {
      setFilters({
        tab: "ledger",
        flow: "plan_charge",
        preset: "30d",
        page: "1",
      });
      return;
    }
    if (key === "failedEvents") {
      setFilters({ tab: "ledger", flow: "", preset: "30d", page: "1" });
      return;
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const date = new Date().toISOString().slice(0, 10);
    if (filters.tab === "withdrawals") {
      downloadCsv(
        "atlas-merchant-withdrawals-" + date + ".csv",
        withdrawalQueueToCsv(withdrawalRows)
      );
    } else {
      downloadCsv(
        "atlas-merchant-payments-" + date + ".csv",
        ledgerToCsv(ledgerRows)
      );
    }
  };

  const handleApprove = (
    withdrawal: MerchantWithdrawalRequest,
    note: string
  ) => {
    setSubmitting(true);
    const result = adminApproveWithdrawal(withdrawal.id, admin, note);
    setSubmitting(false);
    if (!result.ok) {
      setToast({ kind: "error", text: result.error ?? "Approval failed." });
    } else {
      setToast({
        kind: "success",
        text: "Withdrawal approved and moved to processing.",
      });
    }
    setPendingApprove(null);
    setSelectedEvent(null);
  };

  const handleReject = (
    withdrawal: MerchantWithdrawalRequest,
    reason: string
  ) => {
    setSubmitting(true);
    const result = adminRejectWithdrawal(withdrawal.id, admin, reason);
    setSubmitting(false);
    if (!result.ok) {
      setToast({ kind: "error", text: result.error ?? "Rejection failed." });
    } else {
      setToast({ kind: "success", text: "Withdrawal rejected." });
    }
    setPendingReject(null);
    setSelectedEvent(null);
  };

  const handleConfigSave = (patch: {
    thresholdGHS: number;
    feeRatePercent: number;
    dailyCap: number;
  }) => {
    setSubmitting(true);
    const result = adminUpdateAutoApproveConfig(patch, admin);
    setSubmitting(false);
    if (!result.ok) {
      setToast({
        kind: "error",
        text: result.error ?? "Config update failed.",
      });
    } else {
      setToast({ kind: "success", text: "Auto-approve rules updated." });
    }
    setConfigOpen(false);
  };

  const loading = moneyLoading || merchantsLoading;
  const headerMeta = (
    <>
      <span>{merchants.length} merchants</span>
      <span aria-hidden="true">-</span>
      <span>{summary.pendingApprovals.current} awaiting approval</span>
      <span aria-hidden="true">-</span>
      <span>{formatCurrency(summary.atlasRevenue.current)} Atlas revenue</span>
    </>
  );

  const selectedBillingWallet =
    selectedEvent && state
      ? state.wallets[selectedEvent.merchantId]?.billing
      : undefined;
  const selectedMainWallet =
    selectedEvent && state
      ? state.wallets[selectedEvent.merchantId]?.main
      : undefined;
  const selectedSavedMethod =
    selectedEvent && state
      ? state.savedMethods[selectedEvent.merchantId]?.[0]
      : undefined;
  const selectedCardLast4 = last4FromMasked(selectedSavedMethod?.maskedLabel);
  const selectedCardBrand = selectedSavedMethod?.provider;
  const selectedAutoPayEnabled =
    selectedEvent && state
      ? Boolean(state.autopay[selectedEvent.merchantId]?.enabled)
      : false;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Merchant Payments"
        description="Plan billing, storefront sales, refunds, and withdrawals across every merchant."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <PaymentsSummaryCards
        summary={summary}
        active={activeCard}
        onToggle={onToggleCard}
        nowMs={nowMs}
      />

      <PaymentsTabs
        value={filters.tab}
        onChange={(tab) => setFilters({ tab, page: "1" })}
        pendingCount={summary.pendingApprovals.current}
      />

      {filters.tab === "ledger" ? (
        <div
          role="tabpanel"
          id="payments-panel-ledger"
          aria-labelledby="payments-tab-ledger"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PaymentsFilters
              value={filters}
              hasActive={hasActive}
              searchInputRef={searchInputRef}
              onChange={(patch) => setFilters(patch)}
              onClear={clearFilters}
            />
            <Can permission={PERMISSIONS.PAYMENTS_CONFIG}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigOpen(true)}
              >
                Auto-approve rules
              </Button>
            </Can>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Columns:
            </span>
            {(
              ["amount", "fee", "status", "created"] as LedgerColumnKey[]
            ).map((key) => {
              const checked = visibleColumns.includes(key);
              return (
                <label key={key} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    aria-label={"Toggle " + key + " column"}
                    checked={checked}
                    onChange={() =>
                      setVisibleColumns((prev) =>
                        prev.includes(key)
                          ? prev.filter((k) => k !== key)
                          : [...prev, key]
                      )
                    }
                    className="h-3 w-3"
                  />
                  {key}
                </label>
              );
            })}
          </div>

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
          ) : ledgerRows.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {hasActive ? (
                <EmptyState
                  variant="no_results"
                  title="No events match these filters"
                  description="Try a different flow or clear the filters."
                  action={
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  variant="no_data"
                  title="No merchant money events yet"
                  description="Events appear here as merchants bill, sell, refund, and withdraw."
                />
              )}
            </div>
          ) : (
            <PaymentsLedgerTable
              rows={paginated as LedgerRow[]}
              visibleColumns={visibleColumns}
              pageSize={pageSize}
              currentPage={safePage}
              totalRows={totalRows}
              nowMs={nowMs}
              onView={(row) => setSelectedEvent(row.raw)}
              onPageChange={(p) => setFilters({ page: String(p) })}
            />
          )}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="payments-panel-withdrawals"
          aria-labelledby="payments-tab-withdrawals"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PaymentsFilters
              value={filters}
              hasActive={hasActive}
              searchInputRef={searchInputRef}
              onChange={(patch) => setFilters(patch)}
              onClear={clearFilters}
            />
            <Can permission={PERMISSIONS.PAYMENTS_CONFIG}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigOpen(true)}
              >
                Auto-approve rules
              </Button>
            </Can>
          </div>

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading withdrawals"
              className="space-y-2"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : withdrawalRows.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <EmptyState
                variant="no_data"
                title="No withdrawals yet"
                description="Withdrawal requests appear here as merchants cash out."
              />
            </div>
          ) : (
            <WithdrawalQueueTable
                    rows={paginated as WithdrawalQueueRow[]}
                    pageSize={pageSize}
                    currentPage={safePage}
                    totalRows={totalRows}
                    nowMs={nowMs}
                    onView={(row) => setSelectedEvent({ ...row.raw, kind: "withdrawal" as const })}
                    onApprove={(row) => setPendingApprove(row.raw)}
                    onReject={(row) => setPendingReject(row.raw)}
                    onPageChange={(p) => setFilters({ page: String(p) })} canApprove={false}            />
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
          value={filters.pageSize}
          onChange={(e) => setFilters({ pageSize: e.target.value, page: "1" })}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <PaymentDetailDrawer
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        merchant={selectedMerchant}
        billingWallet={selectedBillingWallet}
        mainWallet={selectedMainWallet}
        cardLast4={selectedCardLast4}
        cardBrand={selectedCardBrand}
        autoPayEnabled={selectedAutoPayEnabled}
        nowMs={nowMs}
        onApprove={(w) => {
          setSelectedEvent(null);
          setPendingApprove(w);
        } }
        onReject={(w) => {
          setSelectedEvent(null);
          setPendingReject(w);
        } } canApprove={false}      />

      <WithdrawalApproveModal
        open={pendingApprove !== null}
        withdrawal={pendingApprove}
        merchantName={
          pendingApprove
            ? merchants.find((m) => m.id === pendingApprove.merchantId)
                ?.businessName ?? pendingApprove.merchantId
            : ""
        }
        settlementBalance={
          pendingApprove && state
            ? state.wallets[pendingApprove.merchantId]?.main.balance ?? 0
            : 0
        }
        submitting={submitting}
        onSubmit={(note) => {
          if (pendingApprove) handleApprove(pendingApprove, note);
        }}
        onClose={() => setPendingApprove(null)}
      />

      <WithdrawalRejectModal
        open={pendingReject !== null}
        withdrawal={pendingReject}
        merchantName={
          pendingReject
            ? merchants.find((m) => m.id === pendingReject.merchantId)
                ?.businessName ?? pendingReject.merchantId
            : ""
        }
        submitting={submitting}
        onSubmit={(reason) => {
          if (pendingReject) handleReject(pendingReject, reason);
        }}
        onClose={() => setPendingReject(null)}
      />

      <AutoApproveConfigModal
        open={configOpen}
        config={config}
        submitting={submitting}
        onSubmit={handleConfigSave}
        onClose={() => setConfigOpen(false)}
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