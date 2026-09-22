"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { PlatformMarginView } from "@/components/admin/commissions/platform-margin-view";
import { PayoutRunsView } from "@/components/admin/commissions/payout-runs-view";
import { CommissionLedgerPanel } from "@/components/admin/commissions/commission-ledger-panel";
import { ResellerCommissionDetailDrawer } from "@/components/admin/commissions/reseller-commission-detail-drawer";
import { CommissionCancelModal } from "@/components/admin/commissions/commission-cancel-modal";
import { useCommissions } from "@/lib/admin/hooks/use-commissions";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  commissionsToCsv,
  marginsToCsv,
  payoutRunsToCsv,
} from "@/lib/admin/commissions/commission-csv-export";
import {
  COMMISSION_TABS,
  COMMISSION_TAB_LABELS,
  DEFAULT_COMMISSION_FILTERS,
  type CommissionFilters,
} from "@/lib/admin/commissions/commission-constants";
import { cancelOrderCommission } from "@/lib/admin/commissions/commission-mutations";
import type { ResellerCommission } from "@/lib/admin/types/commission";

interface Toast {
  kind: "success" | "error";
  text: string;
}

type CancelIntent = { ids: string[] } | null;

export default function CommissionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CommissionsPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
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
    </div>
  );
}

function CommissionsPageInner() {
  const admin = useCurrentAdmin();
  const nowMs = useNow();
  const state = useCommissions();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<CommissionFilters>(DEFAULT_COMMISSION_FILTERS);

  const [selectedCommission, setSelectedCommission] =
    useState<ResellerCommission | null>(null);
  const [cancelIntent, setCancelIntent] = useState<CancelIntent>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const actor = useMemo(
    () =>
      admin
        ? {
            name: admin.name,
            email: admin.email,
          }
        : { name: "System", email: "system@atlas.com" },
    [admin]
  );

  const confirmCancel = (reason: string) => {
    if (!cancelIntent) return;
    setSubmitting(true);
    let okCount = 0;
    let failCount = 0;
    for (const id of cancelIntent.ids) {
      const result = cancelOrderCommission(id, reason, actor);
      if (result.ok) okCount += 1;
      else failCount += 1;
    }
    setSubmitting(false);
    setToast({
      kind: failCount === 0 ? "success" : "error",
      text:
        failCount === 0
          ? "Cancelled " + okCount + " commissions."
          : "Cancelled " + okCount + " of " + cancelIntent.ids.length + ".",
    });
    setCancelIntent(null);
    setSelectedCommission(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const date = new Date().toISOString().slice(0, 10);
    if (filters.tab === "margin") {
      downloadCsv(
        "atlas-platform-margins-" + date + ".csv",
        marginsToCsv(state.commissionRows)
      );
      return;
    }
    if (filters.tab === "payouts") {
      downloadCsv(
        "atlas-payout-runs-" + date + ".csv",
        payoutRunsToCsv(state.payoutRuns)
      );
      return;
    }
    downloadCsv(
      "atlas-reseller-commissions-" + date + ".csv",
      commissionsToCsv(state.commissionRows)
    );
  };

  const drawerAudit = useMemo(() => {
    if (!selectedCommission) return [];
    return state.audit
      .filter((a) => a.commissionId === selectedCommission.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [selectedCommission, state.audit]);

  const headerMeta = (
    <>
      <span>{formatNumber(state.commissionRows.length)} commissions</span>
      <span aria-hidden="true">·</span>
      <span>
        {formatCurrency(state.commissionSummary.pendingCommission)} pending
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {formatCurrency(state.commissionSummary.atlasType3Margin)} Atlas
        revenue
      </span>
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Commissions"
        description="Reseller commissions, Atlas base margin, extra cut, and payout history. Commissions pay automatically on order settlement."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <div
        role="tablist"
        aria-label="Commissions views"
        className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800"
      >
        {COMMISSION_TABS.map((tab) => {
          const selected = filters.tab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              id={"commissions-tab-" + tab}
              aria-controls={"commissions-panel-" + tab}
              onClick={() => setFilters({ tab, page: "1" })}
              className={
                "border-b-2 px-4 py-2 text-sm font-medium " +
                (selected
                  ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200")
              }
            >
              {COMMISSION_TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {filters.tab === "reseller" && (
        <div
          role="tabpanel"
          id="commissions-panel-reseller"
          aria-labelledby="commissions-tab-reseller"
        >
          <CommissionLedgerPanel
            rows={state.commissionRows}
            summary={state.commissionSummary}
            loading={state.loading}
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            hasActive={hasActive}
            onViewCommission={setSelectedCommission}
            onBulkCancel={(ids) => setCancelIntent({ ids })}
          />
        </div>
      )}

      {filters.tab === "margin" && (
        <div
          role="tabpanel"
          id="commissions-panel-margin"
          aria-labelledby="commissions-tab-margin"
        >
          <PlatformMarginView
            rows={state.commissionRows}
            trend={state.platformTrend}
            loading={state.loading}
          />
        </div>
      )}

      {filters.tab === "payouts" && (
        <div
          role="tabpanel"
          id="commissions-panel-payouts"
          aria-labelledby="commissions-tab-payouts"
          className="space-y-4"
        >
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Reseller tier configuration
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Commission rates and the extra cut percentage are set on
                  the reseller tier editor.
                </p>
              </div>
              <a
                href="/admin/resellers/tiers"
                className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Open tier editor
              </a>
            </div>
          </div>

          <PayoutRunsView
            payoutRuns={state.payoutRuns}
            summary={state.payoutSummary}
            loading={state.loading}
          />
        </div>
      )}

      <ResellerCommissionDetailDrawer
        open={selectedCommission !== null}
        onClose={() => setSelectedCommission(null)}
        commission={selectedCommission}
        audit={drawerAudit}
        nowMs={nowMs}
        canManage={Boolean(admin)}
        onCancel={(c) => setCancelIntent({ ids: [c.id] })}
      />

      <CommissionCancelModal
        open={cancelIntent !== null}
        commissionIds={cancelIntent?.ids ?? []}
        submitting={submitting}
        onSubmit={confirmCancel}
        onClose={() => {
          setCancelIntent(null);
          setSelectedCommission(null);
        }}
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