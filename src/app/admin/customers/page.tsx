/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
// app/(admin)/customers/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { CustomerSummaryCards } from "@/components/admin/customers/customer-summary-cards";
import {
  CustomerFilters,
  type CustomerFilterValues,
} from "@/components/admin/customers/customer-filters";
import { CustomerListItem } from "@/components/admin/customers/customer-list-item";
import { CustomerDetailDrawer } from "@/components/admin/customers/customer-detail-drawer";
import { mockCustomers } from "@/lib/admin/mock/customers";
import type { Customer } from "@/lib/admin/types/customer";
import type { WalletAdjustMethod } from "@/lib/admin/customers/constants";
import { PAGE_SIZE } from "@/lib/admin/customers/constants";
import { customersToCsv } from "@/lib/admin/customers/csv-export";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";

const DEFAULT_FILTERS: CustomerFilterValues & { page: string } = {
  q: "",
  status: "",
  tag: "",
  risk: "",
  lastActive: "",
  sort: "lastActive",
  page: "1",
};

type CustomerUrlFilters = Record<string, string> & typeof DEFAULT_FILTERS;

type BulkIntent = { kind: "suspend"; ids: string[] };

interface Toast {
  kind: "success" | "error";
  text: string;
  onUndo?: () => void;
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <CustomersPageInner />
    </Suspense>
  );
}

function CustomersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function CustomersPageInner() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkIntent, setBulkIntent] = useState<BulkIntent | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<CustomerUrlFilters>(DEFAULT_FILTERS);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setCustomers(mockCustomers.filter((c) => !c.storefrontId));
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const nowMs = Date.now();

    const list = customers.filter((c) => {
      if (q) {
        const haystack = `${c.name} ${c.email} ${c.phone}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.status && c.status !== filters.status) return false;
      if (filters.tag && !c.tags.includes(filters.tag)) return false;
      if (filters.risk && c.riskLevel !== filters.risk) return false;
      if (filters.lastActive) {
        const days =
          (nowMs - new Date(c.lastActive).getTime()) / 86_400_000;
        if (filters.lastActive === "7d" && days > 7) return false;
        if (filters.lastActive === "30d" && days > 30) return false;
        if (filters.lastActive === "90d" && days > 90) return false;
        if (filters.lastActive === "90d+" && days <= 90) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (filters.sort) {
      case "joined":
        sorted.sort(
          (a, b) =>
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        );
        break;
      case "totalSpent":
        sorted.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "totalOrders":
        sorted.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case "wallet":
        sorted.sort((a, b) => b.walletBalance - a.walletBalance);
        break;
      case "lastActive":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.lastActive).getTime() -
            new Date(a.lastActive).getTime()
        );
    }

    return sorted;
  }, [customers, filters]);

  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const filteredIds = useMemo(() => paginated.map((c) => c.id), [paginated]);

  useEffect(() => {
    if (focusedId && !filteredIds.includes(focusedId)) {
      setFocusedId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-customer-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled: selectedId === null && bulkIntent === null,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selected = useMemo(
    () => customers.find((c) => c.id === selectedId) ?? null,
    [customers, selectedId]
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [customers]);

  const summaryData = useMemo(() => {
    const nowMs = Date.now();
    const thirtyDaysAgo = nowMs - 30 * 86_400_000;
    const nowDate = new Date();

    const activeCustomers = customers.filter(
      (c) => new Date(c.lastActive).getTime() >= thirtyDaysAgo
    ).length;

    const newThisMonth = customers.filter((c) => {
      const d = new Date(c.joinedAt);
      return (
        d.getMonth() === nowDate.getMonth() &&
        d.getFullYear() === nowDate.getFullYear()
      );
    }).length;

    const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
    const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);

    return {
      totalCustomers: customers.length,
      activeCustomers,
      newThisMonth,
      suspendedCustomers: customers.filter((c) => c.status === "suspended")
        .length,
      totalSpent,
      avgOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
    };
  }, [customers]);

  const updateCustomer = (
    id: string,
    patch: (c: Customer) => Customer
  ) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));
  };

  const appendActivity = (
    c: Customer,
    action: string
  ): Customer => {
    return {
      ...c,
      activityLog: [
        ...c.activityLog,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action,
        },
      ],
    };
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdjustWallet = (
    id: string,
    amount: number,
    reason: string,
    method: WalletAdjustMethod
  ) => {
    updateCustomer(id, (c) => {
      const withBalance = {
        ...c,
        walletBalance: c.walletBalance + amount,
      };
      const direction = amount >= 0 ? "Credited" : "Debited";
      return appendActivity(
        withBalance,
        `${direction} ${Math.abs(amount).toFixed(2)} GHS via ${method}. ${reason}`
      );
    });
    setToast({
      kind: "success",
      text: `Wallet ${amount >= 0 ? "credited" : "debited"} ${Math.abs(
        amount
      ).toFixed(2)} GHS.`,
    });
  };

  const handleAddTag = (id: string, tag: string) => {
    updateCustomer(id, (c) =>
      c.tags.includes(tag) ? c : { ...c, tags: [...c.tags, tag] }
    );
  };

  const handleRemoveTag = (id: string, tag: string) => {
    updateCustomer(id, (c) => ({
      ...c,
      tags: c.tags.filter((t) => t !== tag),
    }));
  };

  const handleSuspend = (id: string, reason: string) => {
    updateCustomer(id, (c) =>
      appendActivity(
        { ...c, status: "suspended" },
        `Suspended: ${reason}`
      )
    );
    setSelectedId(null);
    setToast({ kind: "success", text: "Customer suspended." });
  };

  const handleReactivate = (id: string) => {
    updateCustomer(id, (c) =>
      appendActivity({ ...c, status: "active" }, "Reactivated")
    );
    setSelectedId(null);
    setToast({ kind: "success", text: "Customer reactivated." });
  };

  const handleRevealPII = (id: string) => {
    updateCustomer(id, (c) =>
      appendActivity(c, "Revealed contact details")
    );
  };

  const handleResetPassword = (id: string) => {
    const target = customers.find((c) => c.id === id);
    if (!target) return;
    updateCustomer(id, (c) =>
      appendActivity(c, "Password reset link sent")
    );
    setToast({
      kind: "success",
      text: `Reset link sent to ${target.email}.`,
    });
  };

  const handleSendNotification = (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const target = customers.find((c) => c.id === id);
    if (!target) return;
    updateCustomer(id, (c) =>
      appendActivity(c, `Notification sent via ${channel.toUpperCase()}`)
    );
    setToast({
      kind: "success",
      text: `${channel.toUpperCase()} sent to ${target.name}.`,
    });
  };

  const handleBulkSuspend = () => {
    setBulkIntent({ kind: "suspend", ids: selectedIds });
  };

  const confirmBulkSuspend = () => {
    if (!bulkIntent) return;
    const idSet = new Set(bulkIntent.ids);
    setCustomers((prev) =>
      prev.map((c) =>
        idSet.has(c.id)
          ? appendActivity(
              { ...c, status: "suspended" },
              "Suspended via bulk action"
            )
          : c
      )
    );
    setSelectedIds([]);
    setBulkIntent(null);
    setToast({
      kind: "success",
      text: `Suspended ${bulkIntent.ids.length} customers.`,
    });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = customersToCsv(filtered);
    downloadCsv(
      `atlas-customers-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  const handleBulkExport = () => {
    const selectedCustomers = customers.filter((c) =>
      selectedIds.includes(c.id)
    );
    const csv = customersToCsv(selectedCustomers);
    downloadCsv(
      `atlas-customers-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
    setToast({
      kind: "success",
      text: `Exported ${selectedCustomers.length} customers.`,
    });
    setSelectedIds([]);
  };

  const handleBulkClear = () => {
    setSelectedIds([]);
  };

  const filterValues: CustomerFilterValues = {
    q: filters.q,
    status: filters.status,
    tag: filters.tag,
    risk: filters.risk,
    lastActive: filters.lastActive,
    sort: filters.sort,
  };

  const headerMeta = useMemo(() => {
    return (
      <>
        <span>{customers.length} customers</span>
        <span aria-hidden="true">·</span>
        <span>{summaryData.activeCustomers} active in last 30d</span>
        {summaryData.suspendedCustomers > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-danger-700 dark:text-danger-300">
              {summaryData.suspendedCustomers} suspended
            </span>
          </>
        )}
      </>
    );
  }, [customers.length, summaryData]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Atlas Digital Services direct customers."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <CustomerSummaryCards
        data={summaryData}
        activeStatus={filters.status}
        activeLastActive={filters.lastActive}
        activeSort={filters.sort}
        onFilterAll={() =>
          setFilters({
            status: "",
            lastActive: "",
            sort: "lastActive",
            page: "1",
          })
        }
        onFilterActive={() =>
          setFilters({ lastActive: "30d", status: "", page: "1" })
        }
        onFilterSuspended={() =>
          setFilters({ status: "suspended", lastActive: "", page: "1" })
        }
        onSortBySpend={() =>
          setFilters({ sort: "totalSpent", page: "1" })
        }
      />

      <CustomerFilters
        value={filterValues}
        allTags={allTags}
        hasActive={hasActive}
        onChange={(next) =>
          setFilters({
            ...next,
            page: "1",
          })
        }
        onClear={clearFilters}
      />

      {selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk customer actions"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
        >
          <span
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
            aria-live="polite"
          >
            {selectedIds.length} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Can permission={PERMISSIONS.CUSTOMERS_SUSPEND}>
              <Button variant="outline" size="sm" onClick={handleBulkSuspend}>
                Suspend
              </Button>
            </Can>
            <Can permission={PERMISSIONS.EXPORT}>
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                Export selected
              </Button>
            </Can>
            <Button variant="ghost" size="sm" onClick={handleBulkClear}>
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length} customer{filtered.length === 1 ? "" : "s"}
          {hasActive ? " (filtered)" : ""}
        </p>
      )}

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading customers"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No customers match these filters"
              description="Try a different search or clear the filters."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no_data"
              title="No customers yet"
              description="New customers will appear here once they sign up."
            />
          )}
        </div>
      ) : (
        <>
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
          >
            {paginated.map((customer) => (
              <li key={customer.id} data-customer-id={customer.id}>
                <CustomerListItem
                  customer={customer}
                  isSelected={selectedIds.includes(customer.id)}
                  onToggleSelect={handleToggleSelect}
                  onOpen={setSelectedId}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Customer pagination"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Page {safePage} of {totalPages} · {filtered.length} customers
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setFilters({ page: String(safePage - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setFilters({ page: String(safePage + 1) })}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}

      <CustomerDetailDrawer
        customer={selected}
        onClose={() => setSelectedId(null)}
        onAdjustWallet={handleAdjustWallet}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onSendNotification={handleSendNotification}
        onRevealPII={handleRevealPII}
        onResetPassword={handleResetPassword}
      />

      <ConfirmDialog
        open={bulkIntent !== null}
        title={
          bulkIntent ? `Suspend ${bulkIntent.ids.length} customers?` : ""
        }
        description="The selected customers will be signed out and blocked from placing orders or withdrawing. Their history is preserved."
        confirmLabel="Suspend customers"
        danger
        onConfirm={confirmBulkSuspend}
        onCancel={() => setBulkIntent(null)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "flex items-center justify-between gap-3 rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "flex items-center justify-between gap-3 rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          <span>{toast.text}</span>
          {toast.onUndo && (
            <Button variant="ghost" size="sm" onClick={toast.onUndo}>
              Undo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}