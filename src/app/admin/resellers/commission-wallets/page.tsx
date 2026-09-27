/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  ResellerCommissionWallet,
} from "@/lib/admin/types/reseller-commission-wallet";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { useResellerWallets } from "@/lib/admin/hooks/use-reseller-wallets";
import {
  WITHDRAWAL_METHOD_LABEL,
  WITHDRAWAL_METHOD_VARIANT,
  WITHDRAWAL_APPROVAL_REASON_LABEL,
  WITHDRAWAL_APPROVAL_REASON_VARIANT,
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
  ALL_WITHDRAWAL_METHODS,
} from "@/lib/admin/resellers/wallet-labels";
import {
  DEFAULT_WALLET_FILTERS,
  WALLETS_VIEWS_STORAGE_KEY,
  type WalletFilters,
} from "@/lib/admin/resellers/wallet-constants";
import {
  walletsToCsv,
  withdrawalsToCsv,
} from "@/lib/admin/resellers/wallet-csv-export";
import { WalletSummaryCards } from "@/components/admin/resellers/wallet-summary-cards";

export default function ResellerCommissionWalletsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResellerCommissionWalletsPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function ResellerCommissionWalletsPageInner() {
  const now = useNow();
  const { wallets, summary, resellerCount, walletCount, loading } =
    useResellerWallets();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<WalletFilters>(DEFAULT_WALLET_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WALLETS_VIEWS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedView[];
        if (Array.isArray(parsed)) setSavedViews(parsed);
      }
    } catch {
      setSavedViews([]);
    } finally {
      setViewsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!viewsLoaded) return;
    try {
      window.localStorage.setItem(
        WALLETS_VIEWS_STORAGE_KEY,
        JSON.stringify(savedViews)
      );
    } catch {
      /* ignore */
    }
  }, [savedViews, viewsLoaded]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    let list = wallets;

    if (q) {
      list = list.filter(
        (w) =>
          w.resellerName.toLowerCase().includes(q) ||
          w.resellerId.toLowerCase().includes(q)
      );
    }

    if (filters.status) {
      list = list.filter(
        (w) =>
          w.withdrawalRequests.some((r) => r.status === filters.status) ||
          w.withdrawalHistory.some((h) => h.status === filters.status)
      );
    }

    if (filters.method) {
      list = list.filter(
        (w) =>
          w.withdrawalRequests.some((r) => r.method === filters.method) ||
          w.withdrawalHistory.some((h) => h.method === filters.method)
      );
    }

    if (filters.view === "awaiting") {
      list = list.filter((w) => w.withdrawalRequests.length > 0);
    }

    const sorted = [...list];
    switch (filters.sort) {
      case "pending":
        sorted.sort((a, b) => b.pendingBalance - a.pendingBalance);
        break;
      case "lastCredit":
        sorted.sort((a, b) => {
          const at = a.lastCreditAt ? new Date(a.lastCreditAt).getTime() : 0;
          const bt = b.lastCreditAt ? new Date(b.lastCreditAt).getTime() : 0;
          return bt - at;
        });
        break;
      case "awaiting":
        sorted.sort(
          (a, b) => b.withdrawalRequests.length - a.withdrawalRequests.length
        );
        break;
      case "balance":
      default:
        sorted.sort((a, b) => b.balance - a.balance);
        break;
    }

    return sorted;
  }, [wallets, debouncedSearch, filters]);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = walletsToCsv(filtered);
    downloadCsv(
      "atlas-reseller-wallets-" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
      csv
    );
  };

  const handleExportWithdrawals = () => {
    const csv = withdrawalsToCsv(filtered);
    downloadCsv(
      "atlas-reseller-withdrawals-" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
      csv
    );
  };

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.status) snapshot.status = filters.status;
    if (filters.method) snapshot.method = filters.method;
    if (filters.sort && filters.sort !== "balance") snapshot.sort = filters.sort;
    if (filters.view && filters.view !== "all") snapshot.view = filters.view;
    setSavedViews((prev) => [...prev, { name, filters: snapshot }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({ ...DEFAULT_WALLET_FILTERS, ...view.filters });
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const headerMeta = (
    <>
      <span>
        {walletCount} of {resellerCount} resellers with wallet activity
      </span>
      <span aria-hidden="true">·</span>
      <Link
        href="/admin/payments?tab=wallets&ownerType=reseller"
        className="underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {summary.awaitingApproval} awaiting approval
      </Link>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller commission wallets"
        description="Track commission balances and history. Above-threshold withdrawal approvals live in Operations."
        meta={headerMeta}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWithdrawals}
            >
              Withdrawal history CSV
            </Button>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
          </>
        }
      />

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Withdrawal approvals moved to Operations
            </h3>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Reseller withdrawals above the shared threshold are approved
              from the Operations Wallets tab alongside merchant, customer,
              and storefront user withdrawals.
            </p>
          </div>
          <Link
            href="/admin/payments?tab=wallets&ownerType=reseller"
            className="inline-flex h-8 items-center rounded-md bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Open Operations wallet queue
          </Link>
        </div>
      </div>

      <WalletSummaryCards
        summary={summary}
        loading={loading}
        activeFilter={filters.view}
        onFilterAwaitingApproval={() =>
          setFilters({
            view: filters.view === "awaiting" ? "all" : "awaiting",
          })
        }
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            aria-label="Search resellers"
            placeholder="Search by reseller name or ID"
            className="pl-9"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </div>

        <select
          aria-label="Filter by withdrawal status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.status}
          onChange={(e) =>
            setFilters({
              status: e.target.value as WalletFilters["status"],
            })
          }
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          aria-label="Filter by withdrawal method"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.method}
          onChange={(e) =>
            setFilters({
              method: e.target.value as WalletFilters["method"],
            })
          }
        >
          <option value="">All methods</option>
          {ALL_WITHDRAWAL_METHODS.map((m) => (
            <option key={m} value={m}>
              {WITHDRAWAL_METHOD_LABEL[m]}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort wallets"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.sort}
          onChange={(e) =>
            setFilters({ sort: e.target.value as WalletFilters["sort"] })
          }
        >
          <option value="balance">Sort by balance</option>
          <option value="pending">Sort by pending</option>
          <option value="lastCredit">Sort by last credit</option>
          <option value="awaiting">Sort by requests</option>
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No wallets yet"
            description="A reseller appears here once they have commission activity on record."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_results"
            title="No wallets match these filters"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {filtered.map((wallet) => (
            <li key={wallet.id}>
              <WalletCard wallet={wallet} now={now} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WalletCard({
  wallet,
  now,
}: {
  wallet: ResellerCommissionWallet;
  now: number | null;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle className="text-base">
            <Link
              href={"/admin/resellers/" + wallet.resellerId}
              className="rounded-sm text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
            >
              {wallet.resellerName}
            </Link>
          </CardTitle>
          <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {wallet.resellerId}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="neutral" size="sm">
            {wallet.currency}
          </Badge>
          {wallet.isOverdrawn && (
            <Badge variant="danger" size="sm">
              Overdrawn
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Field
            label="Balance"
            value={formatCurrency(wallet.balance)}
            bold
            danger={wallet.isOverdrawn}
          />
          <Field
            label="Pending"
            value={formatCurrency(wallet.pendingBalance)}
            tone="warning"
          />
          <Field
            label="Total earned"
            value={formatCurrency(wallet.totalEarned)}
          />
          <Field
            label="Total withdrawn"
            value={formatCurrency(wallet.totalWithdrawn)}
          />
        </div>

        {wallet.withdrawalRequests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Awaiting approval
              </p>
              <Link
                href={
                  "/admin/payments?tab=wallets&ownerType=reseller&q=" +
                  encodeURIComponent(wallet.resellerName)
                }
                className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Review in Operations
              </Link>
            </div>
            <ul role="list" className="space-y-2">
              {wallet.withdrawalRequests.map((req) => (
                <li
                  key={req.id}
                  className="rounded-md bg-warning-50 p-2 text-sm dark:bg-warning-900/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {formatCurrency(req.amount)}
                      <Badge
                        variant={WITHDRAWAL_METHOD_VARIANT[req.method]}
                        size="sm"
                      >
                        {WITHDRAWAL_METHOD_LABEL[req.method]}
                      </Badge>
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {now ? formatRelative(req.requestedAt, now) : ""}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Fee {formatCurrency(req.fee)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Total {formatCurrency(req.total)}</span>
                  </div>
                  {req.approvalRequiredReasons &&
                    req.approvalRequiredReasons.length > 0 && (
                      <ul role="list" className="mt-1 flex flex-wrap gap-1">
                        {req.approvalRequiredReasons.map((reason) => (
                          <li key={reason}>
                            <Badge
                              variant={
                                WITHDRAWAL_APPROVAL_REASON_VARIANT[reason]
                              }
                              size="sm"
                            >
                              {WITHDRAWAL_APPROVAL_REASON_LABEL[reason]}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {wallet.withdrawalHistory.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              Withdrawal history ({wallet.withdrawalHistory.length})
            </summary>
            <ul role="list" className="mt-2 space-y-1">
              {wallet.withdrawalHistory.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                >
                  <span className="flex items-center gap-2">
                    {formatCurrency(h.amount)}
                    <Badge
                      variant={WITHDRAWAL_METHOD_VARIANT[h.method]}
                      size="sm"
                    >
                      {WITHDRAWAL_METHOD_LABEL[h.method]}
                    </Badge>
                    {h.fee > 0 && (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        fee {formatCurrency(h.fee)}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    {h.autoApproved && (
                      <Badge variant="info" size="sm">
                        Auto
                      </Badge>
                    )}
                    <Badge
                      variant={WITHDRAWAL_STATUS_VARIANT[h.status]}
                      size="sm"
                    >
                      {WITHDRAWAL_STATUS_LABEL[h.status]}
                    </Badge>
                    <span
                      className="text-neutral-500 dark:text-neutral-400"
                      title={formatDateTime(h.resolvedAt)}
                    >
                      {now ? formatRelative(h.resolvedAt, now) : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
            Recent credits ({wallet.recentCredits.length})
          </summary>
          {wallet.recentCredits.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
              No recent credits.
            </p>
          ) : (
            <ul role="list" className="mt-2 space-y-1">
              {wallet.recentCredits.map((credit) => (
                <li
                  key={credit.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  <span>
                    {credit.service} · {formatCurrency(credit.amount)}
                  </span>
                  <span>
                    {now ? formatRelative(credit.createdAt, now) : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </details>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  bold,
  tone,
  danger,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "warning";
  danger?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          bold && "font-semibold",
          tone === "warning" && "font-semibold text-warning-600",
          danger && "font-semibold text-danger-600"
        )}
      >
        {value}
      </p>
    </div>
  );
}