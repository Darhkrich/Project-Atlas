/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import { PaymentDetailDrawer } from "@/components/admin/ecommerce/payments/payment-detail-drawer";
import { useMerchantMoney } from "@/lib/admin/hooks/use-merchant-money";
import { useMerchants } from "@/lib/admin/hooks/use-merchants";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { formatCurrency } from "@/lib/admin/formatters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { ledgerToCsv } from "@/lib/admin/ecommerce/payments/payment-csv-export";
import {
  PAGE_SIZE,
  datePresetToSinceMs,
  type LedgerColumnKey,
} from "@/lib/admin/ecommerce/payments/payments-constants";
import {
  projectLedger,
  projectSummary,
} from "@/lib/admin/ecommerce/payments/payment-projection";
import type {
  LedgerRow,
  MerchantMoneyEvent,
  MetricWithDelta,
  PaymentsSummary,
} from "@/lib/admin/types/merchant-money";

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
  const nowMs = useNow();
  const { state, loading: moneyLoading } = useMerchantMoney();
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
  const [activeCard, setActiveCard] = useState<SummaryCardKey | null>(null);

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

  const summary = useMemo(() => {
    if (!state || !nowMs) return EMPTY_SUMMARY;
    return projectSummary(state, sinceMs, nowMs);
  }, [state, sinceMs, nowMs]);

  const pageSize = Math.max(5, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);

  const totalRows = ledgerRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return ledgerRows.slice(start, start + pageSize);
  }, [ledgerRows, safePage, pageSize]);

  const selectedMerchant = useMemo(() => {
    if (!selectedEvent) return null;
    return merchants.find((m) => m.id === selectedEvent.merchantId) ?? null;
  }, [selectedEvent, merchants]);

  const onToggleCard = (key: SummaryCardKey | null) => {
    setActiveCard(key);
    if (key === "pendingApprovals") {
      setFilters({ tab: "withdrawals", page: "1" });
      return;
    }
    if (key === "atlasRevenue" || key === "withdrawalVolume") {
      setFilters({ tab: "withdrawals", page: "1" });
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
    downloadCsv(
      "atlas-merchant-payments-" + date + ".csv",
      ledgerToCsv(ledgerRows)
    );
  };

  const loading = moneyLoading || merchantsLoading;
  const headerMeta = (
    <>
      <span>{merchants.length} merchants</span>
      <span aria-hidden="true">-</span>
      <Link
        href="/admin/payments?tab=wallets"
        className="underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {summary.pendingApprovals.current} awaiting approval
      </Link>
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
        description="Plan billing, storefront sales, and refunds across every merchant. Withdrawal approvals live in Operations."
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
          <PaymentsFilters
            value={filters}
            hasActive={hasActive}
            searchInputRef={searchInputRef}
            onChange={(patch) => setFilters(patch)}
            onClear={clearFilters}
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Columns:
            </span>
            {(["amount", "fee", "status", "created"] as LedgerColumnKey[]).map(
              (key) => {
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
              }
            )}
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
                  description="Events appear here as merchants bill, sell, and refund."
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
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Merchant withdrawals are reviewed in Operations
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              Above-threshold withdrawals for merchants, resellers, customers,
              and storefront users are approved from a single queue in
              Operations. Admins see every pool in one place instead of
              switching between section pages.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/admin/payments?tab=wallets"
                className="inline-flex h-9 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Open Operations wallet queue
              </Link>
            </div>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Awaiting approval
                </dt>
                <dd className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {summary.pendingApprovals.current}
                </dd>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Withdrawal volume
                </dt>
                <dd className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(summary.withdrawalVolume.current)}
                </dd>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Atlas fee revenue
                </dt>
                <dd className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(summary.atlasRevenue.current)}
                </dd>
              </div>
            </dl>
          </div>
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
        canApprove={false}
      />
    </div>
  );
}