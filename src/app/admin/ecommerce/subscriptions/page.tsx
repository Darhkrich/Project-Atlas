"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type {
  Invoice,
  MerchantSubscription,
} from "@/lib/admin/types/ecommerce";
import type { PlanCode } from "@/config/subscription-plans";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useEcommerceSubscriptions } from "@/lib/admin/hooks/use-ecommerce-subscriptions";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { subscriptionsToCsv } from "@/lib/admin/ecommerce/subscription-csv-export";
import {
  filterSubscriptions,
  type SubscriptionFilters,
} from "@/lib/admin/ecommerce/subscription-projection";
import {
  ALL_SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_STATUS_LABEL,
} from "@/lib/admin/ecommerce/subscription-labels";
import { subscriptionPlans } from "@/config/subscription-plans";
import {
  applySubscriptionDiscount,
  cancelSubscription,
  changeSubscriptionPlan,
  reactivateSubscription,
  type MerchantActor,
} from "@/lib/admin/merchants/merchant-mutations";
import { SubscriptionsSummaryCards } from "@/components/admin/ecommerce/subscriptions-summary-cards";
import { SubscriptionsTable } from "@/components/admin/ecommerce/subscriptions-table";
import { SubscriptionDetailDrawer } from "@/components/admin/ecommerce/subscription-detail-drawer";
import {
  ChangePlanModal,
  ApplyDiscountModal,
  CancelSubscriptionModal,
  ReactivateSubscriptionModal,
} from "@/components/admin/ecommerce/subscription-action-modals";

interface UrlFilters extends SubscriptionFilters {
  view: string;
}

const DEFAULT_FILTERS: UrlFilters = {
  q: "",
  status: "",
  plan: "",
  billingCycle: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function EcommerceSubscriptionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EcommerceSubscriptionsPageInner />
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
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function EcommerceSubscriptionsPageInner() {
  const admin = useCurrentAdmin();
  const { subscriptions, summary, invoicesFor, loading } =
    useEcommerceSubscriptions();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<UrlFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [drawerTarget, setDrawerTarget] =
    useState<MerchantSubscription | null>(null);
  const [changePlanTarget, setChangePlanTarget] =
    useState<MerchantSubscription | null>(null);
  const [discountTarget, setDiscountTarget] =
    useState<MerchantSubscription | null>(null);
  const [cancelTarget, setCancelTarget] =
    useState<MerchantSubscription | null>(null);
  const [reactivateTarget, setReactivateTarget] =
    useState<MerchantSubscription | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: MerchantActor = useMemo(
    () =>
      admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    [admin]
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
  };

  const filtered = useMemo(
    () =>
      filterSubscriptions(subscriptions, {
        q: debouncedSearch,
        status: filters.status,
        plan: filters.plan,
        billingCycle: filters.billingCycle,
      }),
    [subscriptions, debouncedSearch, filters]
  );

  const headerMeta = (
    <>
      <span>
        {summary.total} subscription{summary.total === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.active} active</span>
      {summary.pastDue + summary.expired > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summary.pastDue + summary.expired} at risk
          </span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>
        {new Intl.NumberFormat("en-GH", {
          style: "currency",
          currency: "GHS",
          maximumFractionDigits: 0,
        }).format(summary.mrr)}{" "}
        MRR
      </span>
    </>
  );

  const handleChangePlan = (planCode: PlanCode) => {
    if (!changePlanTarget) return;
    const result = changeSubscriptionPlan(
      changePlanTarget.merchantId,
      planCode,
      actor
    );
    if (result.ok) {
      showToast("success", "Plan changed.");
      if (drawerTarget?.id === changePlanTarget.id && result.merchant) {
        setDrawerTarget(null);
      }
    } else {
      showToast("error", result.error ?? "Could not change plan.");
    }
    setChangePlanTarget(null);
  };

  const handleApplyDiscount = (discountPercent: number) => {
    if (!discountTarget) return;
    const result = applySubscriptionDiscount(
      discountTarget.merchantId,
      discountPercent,
      actor
    );
    if (result.ok) {
      showToast(
        "success",
        discountPercent === 0
          ? "Discount removed."
          : discountPercent + "% discount applied."
      );
      if (drawerTarget?.id === discountTarget.id) {
        setDrawerTarget(null);
      }
    } else {
      showToast("error", result.error ?? "Could not apply discount.");
    }
    setDiscountTarget(null);
  };

  const handleCancel = (reason: string) => {
    if (!cancelTarget) return;
    const result = cancelSubscription(
      cancelTarget.merchantId,
      reason,
      actor
    );
    if (result.ok) {
      showToast("success", "Subscription cancelled.");
      if (drawerTarget?.id === cancelTarget.id) {
        setDrawerTarget(null);
      }
    } else {
      showToast("error", result.error ?? "Could not cancel subscription.");
    }
    setCancelTarget(null);
  };

  const handleReactivate = () => {
    if (!reactivateTarget) return;
    const result = reactivateSubscription(
      reactivateTarget.merchantId,
      actor
    );
    if (result.ok) {
      showToast("success", "Subscription reactivated.");
      if (drawerTarget?.id === reactivateTarget.id) {
        setDrawerTarget(null);
      }
    } else {
      showToast("error", result.error ?? "Could not reactivate subscription.");
    }
    setReactivateTarget(null);
  };

  const handleExport = () => {
    const csv = subscriptionsToCsv(filtered, subscriptionPlans);
    downloadCsv(
      "atlas-ecommerce-subscriptions-" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
      csv
    );
  };

  const drawerInvoices: Invoice[] = drawerTarget
    ? invoicesFor(drawerTarget.id)
    : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscriptions"
        description="Merchant subscription plans, billing status, and lifecycle."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <SubscriptionsSummaryCards summary={summary} loading={loading} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            aria-label="Search subscriptions"
            placeholder="Search by merchant name or ID"
            className="pl-9"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </div>

        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          {ALL_SUBSCRIPTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SUBSCRIPTION_STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by plan"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.plan}
          onChange={(e) => setFilters({ plan: e.target.value })}
        >
          <option value="">All plans</option>
          {subscriptionPlans.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by billing cycle"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.billingCycle}
          onChange={(e) => setFilters({ billingCycle: e.target.value })}
        >
          <option value="">All cycles</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <p
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        Showing {filtered.length} of {subscriptions.length} subscription
        {subscriptions.length === 1 ? "" : "s"}
        {hasActive ? " (filtered)" : ""}
      </p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No subscriptions yet"
            description="Subscriptions appear here once merchants are onboarded."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_results"
            title="No subscriptions match these filters"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <SubscriptionsTable
          subscriptions={filtered}
          onView={(sub) => setDrawerTarget(sub)}
        />
      )}

      <SubscriptionDetailDrawer
        subscription={drawerTarget}
        invoices={drawerInvoices}
        onClose={() => setDrawerTarget(null)}
        onChangePlan={(sub) => {
          setDrawerTarget(null);
          setChangePlanTarget(sub);
        }}
        onApplyDiscount={(sub) => {
          setDrawerTarget(null);
          setDiscountTarget(sub);
        }}
        onCancel={(sub) => {
          setDrawerTarget(null);
          setCancelTarget(sub);
        }}
        onReactivate={(sub) => {
          setDrawerTarget(null);
          setReactivateTarget(sub);
        }}
      />

      <ChangePlanModal
        open={changePlanTarget !== null}
        subscription={changePlanTarget}
        onClose={() => setChangePlanTarget(null)}
        onConfirm={handleChangePlan}
      />

      <ApplyDiscountModal
        open={discountTarget !== null}
        subscription={discountTarget}
        onClose={() => setDiscountTarget(null)}
        onConfirm={handleApplyDiscount}
      />

      <CancelSubscriptionModal
        open={cancelTarget !== null}
        subscription={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />

      <ReactivateSubscriptionModal
        open={reactivateTarget !== null}
        subscription={reactivateTarget}
        onClose={() => setReactivateTarget(null)}
        onConfirm={handleReactivate}
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