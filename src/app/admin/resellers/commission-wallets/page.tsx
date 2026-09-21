"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  ResellerCommissionWallet,
  WithdrawalRequest,
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
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { useResellerWallets } from "@/lib/admin/hooks/use-reseller-wallets";
import {
  approveWalletWithdrawal,
  rejectWalletWithdrawal,
  setResellerWithdrawalRules,
} from "@/lib/admin/resellers/wallet-mutations";
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
import {
  ApproveWithdrawalModal,
  RejectWithdrawalModal,
} from "@/components/admin/resellers/wallet-action-modal";
import { WalletThresholdModal } from "@/components/admin/resellers/wallet-threshold-modal";

interface Toast {
  kind: "success" | "error";
  text: string;
}

interface ActionTarget {
  wallet: ResellerCommissionWallet;
  request: WithdrawalRequest;
  mode: "approve" | "reject";
}

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
  const admin = useCurrentAdmin();
  const now = useNow();
  const {
    wallets,
    summary,
    threshold,
    resellerCount,
    walletCount,
    loading,
  } = useResellerWallets();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<WalletFilters>(DEFAULT_WALLET_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);
  const [action, setAction] = useState<ActionTarget | null>(null);
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

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

  const handleDeleteView = (view: SavedView) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== view.name));
  };

  const handleApprove = () => {
    if (!action || !admin) return;
    setSubmitting(true);
    const result = approveWalletWithdrawal(
      action.wallet.resellerId,
      action.request.id,
      { name: admin.name, email: admin.email }
    );
    setSubmitting(false);
    if (result.ok) {
      setToast({
        kind: "success",
        text:
          formatCurrency(action.request.amount) +
          " withdrawal approved for " +
          action.wallet.resellerName +
          " (fee " +
          formatCurrency(action.request.fee) +
          ").",
      });
    } else {
      setToast({
        kind: "error",
        text: result.error ?? "Approval failed.",
      });
    }
    setAction(null);
  };

  const handleReject = (reason: string) => {
    if (!action || !admin) return;
    setSubmitting(true);
    const result = rejectWalletWithdrawal(
      action.wallet.resellerId,
      action.request.id,
      reason,
      { name: admin.name, email: admin.email }
    );
    setSubmitting(false);
    if (result.ok) {
      setToast({
        kind: "success",
        text: "Withdrawal for " + action.wallet.resellerName + " rejected.",
      });
    } else {
      setToast({
        kind: "error",
        text: result.error ?? "Rejection failed.",
      });
    }
    setAction(null);
  };

  const handleThresholdSave = (patch: {
    withdrawalApprovalThreshold: number;
    withdrawalFeePercent: number;
  }) => {
    if (!admin) return;
    setSubmitting(true);
    const result = setResellerWithdrawalRules(patch, {
      name: admin.name,
      email: admin.email,
    });
    setSubmitting(false);
    if (!result.ok) {
      setToast({
        kind: "error",
        text: result.error ?? "Rules update failed.",
      });
    } else {
      setToast({
        kind: "success",
        text:
          "Rules updated. Threshold GHS " +
          patch.withdrawalApprovalThreshold.toLocaleString("en-GH") +
          ", fee " +
          patch.withdrawalFeePercent +
          "%.",
      });
    }
    setThresholdOpen(false);
  };

  const headerMeta = (
    <>
      <span>
        {walletCount} of {resellerCount} resellers with wallet activity
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.awaitingApproval} awaiting approval</span>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={() => setThresholdOpen(true)}
        className="rounded-sm underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Edit withdrawal approval threshold and fee rate"
      >
        Threshold {formatCurrency(threshold.withdrawalApprovalThreshold)} ·
        Fee {threshold.withdrawalFeePercent}%
      </button>
      {threshold.updatedBy && now && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-neutral-500 dark:text-neutral-400">
            Changed by {threshold.updatedBy}{" "}
            {formatRelative(threshold.updatedAt, now)}
          </span>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller commission wallets"
        description="Track commission balances and approve withdrawal requests above the auto-approval threshold."
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
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Awaiting approval
                      </p>
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
                                  variant={
                                    WITHDRAWAL_METHOD_VARIANT[req.method]
                                  }
                                  size="sm"
                                >
                                  {WITHDRAWAL_METHOD_LABEL[req.method]}
                                </Badge>
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {now
                                  ? formatRelative(req.requestedAt, now)
                                  : ""}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                              <span>
                                Fee {formatCurrency(req.fee)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                Total {formatCurrency(req.total)}
                              </span>
                            </div>
                            {req.approvalRequiredReasons &&
                              req.approvalRequiredReasons.length > 0 && (
                                <ul
                                  role="list"
                                  className="mt-1 flex flex-wrap gap-1"
                                >
                                  {req.approvalRequiredReasons.map((reason) => (
                                    <li key={reason}>
                                      <Badge
                                        variant={
                                          WITHDRAWAL_APPROVAL_REASON_VARIANT[
                                            reason
                                          ]
                                        }
                                        size="sm"
                                      >
                                        {WITHDRAWAL_APPROVAL_REASON_LABEL[
                                          reason
                                        ]}
                                      </Badge>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            <Can
                              permission={
                                PERMISSIONS.RESELLERS_WITHDRAWALS_APPROVE
                              }
                            >
                              <div className="mt-2 flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAction({
                                      wallet,
                                      request: req,
                                      mode: "approve",
                                    })
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger-600"
                                  onClick={() =>
                                    setAction({
                                      wallet,
                                      request: req,
                                      mode: "reject",
                                    })
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            </Can>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {wallet.withdrawalHistory.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                        Withdrawal history (
                        {wallet.withdrawalHistory.length})
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
                                variant={
                                  WITHDRAWAL_METHOD_VARIANT[h.method]
                                }
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
                                variant={
                                  WITHDRAWAL_STATUS_VARIANT[h.status]
                                }
                                size="sm"
                              >
                                {WITHDRAWAL_STATUS_LABEL[h.status]}
                              </Badge>
                              <span
                                className="text-neutral-500 dark:text-neutral-400"
                                title={formatDateTime(h.resolvedAt)}
                              >
                                {now
                                  ? formatRelative(h.resolvedAt, now)
                                  : ""}
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
                              {credit.service} ·{" "}
                              {formatCurrency(credit.amount)}
                            </span>
                            <span>
                              {now
                                ? formatRelative(credit.createdAt, now)
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ApproveWithdrawalModal
        open={action?.mode === "approve"}
        wallet={action?.wallet ?? null}
        request={action?.request ?? null}
        onClose={() => setAction(null)}
        onConfirm={handleApprove}
        onRejectInstead={() =>
          setAction((prev) => (prev ? { ...prev, mode: "reject" } : null))
        }
      />

      <RejectWithdrawalModal
        open={action?.mode === "reject"}
        wallet={action?.wallet ?? null}
        request={action?.request ?? null}
        onClose={() => setAction(null)}
        onConfirm={handleReject}
      />

      <WalletThresholdModal
        open={thresholdOpen}
        config={threshold}
        submitting={submitting}
        onSubmit={handleThresholdSave}
        onClose={() => setThresholdOpen(false)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-md border p-3 text-sm",
            toast.kind === "success"
              ? "border-success-200 bg-success-50 text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          )}
        >
          {toast.text}
        </div>
      )}
    </div>
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