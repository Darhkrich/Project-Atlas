/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/admin/ecommerce/merchants/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import { MerchantSummaryCards } from "@/components/admin/merchants/merchant-summary-cards";
import {
  MerchantFilters,
  type MerchantFilterValues,
} from "@/components/admin/merchants/merchant-filters";
import { MerchantDetailDrawer } from "@/components/admin/merchants/merchant-detail-drawer";
import {
  MerchantNotifyModal,
  MerchantPlanChangeModal,
} from "@/components/admin/merchants/merchant-action-modals";
import { subscriptionPlans } from "@/config/subscription-plans";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  MERCHANT_STATUS_LABELS,
  STORE_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  getMerchantMrr,
  type Merchant,
  type SubscriptionPlan,
} from "@/lib/admin/types/merchant";
import {
  MERCHANT_STATUS_VARIANT,
  STORE_STATUS_VARIANT,
  SUBSCRIPTION_STATUS_VARIANT,
  VERIFICATION_VARIANT,
  OPTIONAL_COLUMN_KEYS,
  COLUMN_LABEL,
  PAGE_SIZE,
  type ColumnKey,
  type SortKey,
} from "@/lib/admin/merchants/constants";
import {
  appendActivity,
  appendAuditTrail,
  buildAuditEntry,
  daysUntilRenewalAt,
  planChangeImpact,
} from "@/lib/admin/merchants/helpers";
import { merchantsToCsv } from "@/lib/admin/merchants/csv-export";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";

const VIEWS_KEY = "atlas-merchant-views-v2";
const COLUMNS_KEY = "atlas-merchant-columns-v2";

type MerchantUrlFilters = MerchantFilterValues;

const DEFAULT_FILTERS: MerchantUrlFilters = {
  q: "",
  merchantStatus: "",
  subscriptionStatus: "",
  storeStatus: "",
  plan: "",
  renewalWindow: "",
  sort: "lastActive",
  page: "1",
  pageSize: String(PAGE_SIZE),
};

const SYSTEM_ADMIN = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
  role: "super_admin" as const,
  extraPermissions: [],
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

type BulkIntent =
  | { kind: "suspend"; ids: string[] }
  | { kind: "notify"; ids: string[] };

export default function MerchantsPage() {
  return (
    <Suspense fallback={<MerchantsSkeleton />}>
      <MerchantsPageInner />
    </Suspense>
  );
}

function MerchantsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function MerchantsPageInner() {
  const admin = useCurrentAdmin();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>([
    ...OPTIONAL_COLUMN_KEYS,
  ]);
  const [columnsLoaded, setColumnsLoaded] = useState(false);
  const [bulkIntent, setBulkIntent] = useState<BulkIntent | null>(null);
  const [bulkPlanOpen, setBulkPlanOpen] = useState(false);
  const [bulkNotifyOpen, setBulkNotifyOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<MerchantUrlFilters>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setMerchants(mockMerchants);
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEWS_KEY);
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
      window.localStorage.setItem(VIEWS_KEY, JSON.stringify(savedViews));
    } catch {
      /* ignore */
    }
  }, [savedViews, viewsLoaded]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLUMNS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ColumnKey[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((k) =>
            (OPTIONAL_COLUMN_KEYS as readonly string[]).includes(k)
          );
          if (valid.length > 0) setVisibleColumns(valid);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setColumnsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!columnsLoaded) return;
    try {
      window.localStorage.setItem(
        COLUMNS_KEY,
        JSON.stringify(visibleColumns)
      );
    } catch {
      /* ignore */
    }
  }, [visibleColumns, columnsLoaded]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = merchants;

    if (q) {
      list = list.filter((m) =>
        `${m.businessName} ${m.email} ${m.contactPerson} ${m.storeConfig.storeName}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (filters.merchantStatus) {
      list = list.filter((m) => m.merchantStatus === filters.merchantStatus);
    }
    if (filters.subscriptionStatus) {
      list = list.filter(
        (m) => m.subscription.status === filters.subscriptionStatus
      );
    }
    if (filters.storeStatus) {
      list = list.filter((m) => m.storeStatus === filters.storeStatus);
    }
    if (filters.plan) {
      list = list.filter((m) => m.subscription.planId === filters.plan);
    }
    if (filters.renewalWindow) {
      const nowMs = Date.now();
      list = list.filter((m) => {
        const days = daysUntilRenewalAt(m, nowMs);
        switch (filters.renewalWindow) {
          case "overdue":
            return days < 0;
          case "7d":
            return days >= 0 && days <= 7;
          case "14d":
            return days >= 0 && days <= 14;
          case "30d":
            return days >= 0 && days <= 30;
          default:
            return true;
        }
      });
    }

    const sorted = [...list];
    const key = filters.sort as SortKey;
    sorted.sort((a, b) => {
      switch (key) {
        case "created":
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        case "revenue":
          return b.totalRevenue - a.totalRevenue;
        case "orders":
          return b.totalOrders - a.totalOrders;
        case "mrr":
          return getMerchantMrr(b) - getMerchantMrr(a);
        case "renewal":
          return (
            new Date(a.subscription.endDate).getTime() -
            new Date(b.subscription.endDate).getTime()
          );
        case "lastActive":
        default:
          return (
            new Date(b.lastActive).getTime() -
            new Date(a.lastActive).getTime()
          );
      }
    });
    return sorted;
  }, [merchants, debouncedSearch, filters]);

  const pageSize = Math.max(5, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const paginatedIds = useMemo(() => paginated.map((m) => m.id), [paginated]);

  useEffect(() => {
    if (focusedId && !paginatedIds.includes(focusedId)) {
      setFocusedId(paginatedIds[0] ?? null);
    }
  }, [paginatedIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-merchant-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: paginatedIds,
    focusedId,
    enabled:
      selectedId === null &&
      bulkIntent === null &&
      !bulkPlanOpen &&
      !bulkNotifyOpen,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selectedMerchant = useMemo(
    () => merchants.find((m) => m.id === selectedId) ?? null,
    [merchants, selectedId]
  );

  const summaryData = useMemo(() => {
    const activeMrr = merchants
      .filter((m) => m.subscription.status === "active")
      .reduce((s, m) => s + getMerchantMrr(m), 0);
    const pastDueList = merchants.filter(
      (m) => m.subscription.status === "past_due"
    );
    const pastDueMrr = pastDueList.reduce(
      (s, m) => s + getMerchantMrr(m),
      0
    );

    return {
      totalMerchants: merchants.length,
      liveStores: merchants.filter((m) => m.storeStatus === "live").length,
      activeSubscriptions: merchants.filter(
        (m) => m.subscription.status === "active"
      ).length,
      activeMrr,
      pastDueMrr,
      pastDueCount: pastDueList.length,
      suspendedMerchants: merchants.filter(
        (m) => m.merchantStatus === "suspended"
      ).length,
      totalSales: merchants.reduce((s, m) => s + m.totalRevenue, 0),
    };
  }, [merchants]);

  const updateMerchant = (
    id: string,
    patch: (m: Merchant) => Merchant
  ) => {
    setMerchants((prev) => prev.map((m) => (m.id === id ? patch(m) : m)));
  };

  const applyAudit = (
    merchant: Merchant,
    action: string
  ): Merchant => {
    const entry = buildAuditEntry({
      admin: admin ?? SYSTEM_ADMIN,
      action,
    });
    return { ...merchant, auditTrail: appendAuditTrail(merchant, entry) };
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  /* ---------------------------- Single actions --------------------- */

  const handleChangePlan = (id: string, planCode: SubscriptionPlan) => {
    const target = merchants.find((m) => m.id === id);
    if (!target) return;
    const impact = planChangeImpact(target, planCode);
    updateMerchant(id, (m) => {
      const next: Merchant = {
        ...m,
        subscription: { ...m.subscription, planId: planCode },
      };
      const withActivity: Merchant = {
        ...next,
        activityLog: appendActivity(
          next,
          `Plan changed to ${
            subscriptionPlans.find((p) => p.code === planCode)?.name ?? planCode
          }`
        ),
      };
      return applyAudit(
        withActivity,
        `Plan changed: ${impact.fromPlan} → ${planCode}${
          impact.mrrDelta !== 0
            ? ` (${impact.mrrDelta > 0 ? "+" : ""}${formatCurrency(impact.mrrDelta)})`
            : ""
        }`
      );
    });
    setToast({
      kind: "success",
      text: `Plan updated to ${
        subscriptionPlans.find((p) => p.code === planCode)?.name ?? planCode
      }.`,
    });
  };

  const handleSuspend = (id: string, reason: string) => {
    updateMerchant(id, (m) => {
      const next: Merchant = {
        ...m,
        merchantStatus: "suspended",
        storeStatus: "disabled",
      };
      return applyAudit(next, `Suspended: ${reason}`);
    });
    setSelectedId(null);
    setToast({ kind: "success", text: "Merchant suspended." });
  };

  const handleReactivate = (id: string) => {
    updateMerchant(id, (m) => {
      const next: Merchant = {
        ...m,
        merchantStatus: "active",
        storeStatus: "live",
      };
      return applyAudit(next, "Reactivated");
    });
    setToast({ kind: "success", text: "Merchant reactivated." });
  };

  const handleToggleStore = (id: string) => {
    updateMerchant(id, (m) => {
      const next: Merchant = {
        ...m,
        storeStatus: m.storeStatus === "live" ? "disabled" : "live",
      };
      const action =
        next.storeStatus === "live" ? "Enabled storefront" : "Disabled storefront";
      return applyAudit(next, action);
    });
    setToast({ kind: "success", text: "Storefront status updated." });
  };

  const handleUpdateContractMrr = (
    id: string,
    value: number,
    reason: string
  ) => {
    updateMerchant(id, (m) => {
      const previous = m.contractMrr ?? 0;
      const next: Merchant = { ...m, contractMrr: value };
      const withActivity: Merchant = {
        ...next,
        activityLog: appendActivity(
          next,
          `Contract MRR updated to ${formatCurrency(value)}`
        ),
      };
      return applyAudit(
        withActivity,
        `Contract MRR: ${formatCurrency(previous)} → ${formatCurrency(value)}. ${reason}`
      );
    });
    setToast({
      kind: "success",
      text: `Contract MRR updated to ${formatCurrency(value)}.`,
    });
  };

  const handleApproveVerification = (id: string) => {
    updateMerchant(id, (m) => {
      const next: Merchant = {
        ...m,
        verificationStatus: "verified",
        lastVerifiedAt: new Date().toISOString(),
      };
      return applyAudit(next, "Verified account");
    });
    setToast({ kind: "success", text: "Verification approved." });
  };

  const handleRejectVerification = (id: string, reason: string) => {
    updateMerchant(id, (m) => {
      const next: Merchant = { ...m, verificationStatus: "rejected" };
      return applyAudit(next, `Verification rejected: ${reason}`);
    });
    setToast({ kind: "success", text: "Verification rejected." });
  };

  const handleSendNotification = (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const target = merchants.find((m) => m.id === id);
    if (!target) return;
    updateMerchant(id, (m) => {
      const withActivity: Merchant = {
        ...m,
        activityLog: appendActivity(
          m,
          `Notification sent via ${channel.toUpperCase()}`
        ),
      };
      return applyAudit(
        withActivity,
        `Notification sent to ${target.email} via ${channel.toUpperCase()}`
      );
    });
    setToast({
      kind: "success",
      text: `${channel.toUpperCase()} sent to ${target.businessName}.`,
    });
  };

  const handleResetSecurity = (id: string) => {
    const target = merchants.find((m) => m.id === id);
    if (!target) return;
    updateMerchant(id, (m) => {
      const withActivity: Merchant = {
        ...m,
        activityLog: appendActivity(
          m,
          "Security reset. All sessions revoked."
        ),
      };
      return applyAudit(
        withActivity,
        `Reset security. Password reset link sent to ${target.email}`
      );
    });
    setToast({
      kind: "success",
      text: `Security reset for ${target.businessName}.`,
    });
  };

  /* ------------------------------ Bulk ----------------------------- */

  const handleBulkSuspend = () => {
    setBulkIntent({ kind: "suspend", ids: selectedIds });
  };

  const handleBulkPlan = (planCode: SubscriptionPlan) => {
    const idSet = new Set(selectedIds);
    setMerchants((prev) =>
      prev.map((m) => {
        if (!idSet.has(m.id)) return m;
        const next: Merchant = {
          ...m,
          subscription: { ...m.subscription, planId: planCode },
        };
        const withActivity: Merchant = {
          ...next,
          activityLog: appendActivity(
            next,
            `Plan changed to ${
              subscriptionPlans.find((p) => p.code === planCode)?.name ??
              planCode
            } (bulk)`
          ),
        };
        return applyAudit(
          withActivity,
          `Plan changed to ${planCode} (bulk action)`
        );
      })
    );
    setToast({
      kind: "success",
      text: `Plan updated for ${selectedIds.length} merchants.`,
    });
    setSelectedIds([]);
    setBulkPlanOpen(false);
  };

  const handleBulkNotify = (channel: "email" | "sms" | "push", message: string) => {
    void message;
    const idSet = new Set(selectedIds);
    setMerchants((prev) =>
      prev.map((m) => {
        if (!idSet.has(m.id)) return m;
        return applyAudit(
          m,
          `Notification sent via ${channel.toUpperCase()} (bulk)`
        );
      })
    );
    setToast({
      kind: "success",
      text: `Notification queued for ${selectedIds.length} merchants.`,
    });
    setSelectedIds([]);
    setBulkNotifyOpen(false);
  };

  const handleBulkExport = () => {
    const selected = merchants.filter((m) => selectedIds.includes(m.id));
    const csv = merchantsToCsv(selected);
    downloadCsv(
      `atlas-merchants-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
    setToast({
      kind: "success",
      text: `Exported ${selected.length} merchants.`,
    });
    setSelectedIds([]);
  };

  const confirmBulk = () => {
    if (!bulkIntent) return;
    const idSet = new Set(bulkIntent.ids);
    if (bulkIntent.kind === "suspend") {
      setMerchants((prev) =>
        prev.map((m) => {
          if (!idSet.has(m.id)) return m;
          const next: Merchant = {
            ...m,
            merchantStatus: "suspended",
            storeStatus: "disabled",
          };
          return applyAudit(next, "Suspended via bulk action");
        })
      );
      setToast({
        kind: "success",
        text: `Suspended ${bulkIntent.ids.length} merchants.`,
      });
    }
    setSelectedIds([]);
    setBulkIntent(null);
  };

  /* ------------------------------ Export --------------------------- */

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = merchantsToCsv(filtered);
    downloadCsv(
      `atlas-merchants-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  /* ---------------------------- Saved views ------------------------ */

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.merchantStatus)
      snapshot.merchantStatus = filters.merchantStatus;
    if (filters.subscriptionStatus)
      snapshot.subscriptionStatus = filters.subscriptionStatus;
    if (filters.storeStatus) snapshot.storeStatus = filters.storeStatus;
    if (filters.plan) snapshot.plan = filters.plan;
    if (filters.renewalWindow)
      snapshot.renewalWindow = filters.renewalWindow;
    if (filters.sort && filters.sort !== "lastActive") {
      snapshot.sort = filters.sort;
    }
    setSavedViews((prev) => [...prev, { name, filters: snapshot }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({ ...DEFAULT_FILTERS, ...view.filters, page: "1" });
  };

  const handleDeleteView = (view: SavedView) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== view.name));
  };

  /* ------------------------------ Table ---------------------------- */

  const allColumns: Column<Merchant>[] = useMemo(
    () => [
      {
        key: "__select__",
        header: "",
        cell: (m) => (
          <input
            type="checkbox"
            aria-label={`Select ${m.businessName}`}
            checked={selectedIds.includes(m.id)}
            onChange={() => toggleSelected(m.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4"
          />
        ),
      },
      {
        key: "businessName",
        header: "Merchant",
        cell: (m) => (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {m.businessName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                {m.businessName}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {m.storeConfig.storeName}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact",
        cell: (m) => (
          <div className="text-xs">
            <p className="text-neutral-800 dark:text-neutral-200">
              {m.contactPerson}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              {m.email}
            </p>
          </div>
        ),
      },
      {
        key: "plan",
        header: "Plan",
        cell: (m) => (
          <Badge variant="info" size="sm">
            {subscriptionPlans.find((p) => p.code === m.subscription.planId)
              ?.name ?? m.subscription.planId}
          </Badge>
        ),
      },
      {
        key: "subStatus",
        header: "Subscription",
        cell: (m) => (
          <Badge
            variant={SUBSCRIPTION_STATUS_VARIANT[m.subscription.status]}
            size="sm"
          >
            {SUBSCRIPTION_STATUS_LABELS[m.subscription.status]}
          </Badge>
        ),
      },
      {
        key: "mrr",
        header: "MRR",
        cell: (m) => {
          const v = getMerchantMrr(m);
          return v > 0 ? (
            <span className="text-neutral-800 dark:text-neutral-200">
              {formatCurrency(v)}
            </span>
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Custom
            </span>
          );
        },
      },
      {
        key: "orders",
        header: "Orders",
        cell: (m) => (
          <span className="text-neutral-800 dark:text-neutral-200">
            {m.totalOrders.toLocaleString("en-GH")}
          </span>
        ),
      },
      {
        key: "revenue",
        header: "Revenue",
        cell: (m) => (
          <span className="text-neutral-800 dark:text-neutral-200">
            {formatCurrency(m.totalRevenue)}
          </span>
        ),
      },
      {
        key: "wallet",
        header: "Wallet",
        cell: (m) => (
          <span className="text-neutral-800 dark:text-neutral-200">
            {formatCurrency(m.walletBalance ?? 0)}
          </span>
        ),
      },
      {
        key: "storeStatus",
        header: "Store",
        cell: (m) => (
          <Badge variant={STORE_STATUS_VARIANT[m.storeStatus]} size="sm">
            {STORE_STATUS_LABELS[m.storeStatus]}
          </Badge>
        ),
      },
      {
        key: "verification",
        header: "Verification",
        cell: (m) => (
          <Badge
            variant={VERIFICATION_VARIANT[m.verificationStatus]}
            size="sm"
          >
            {VERIFICATION_STATUS_LABELS[m.verificationStatus]}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds]
  );

  const displayColumns = useMemo(
    () =>
      allColumns.filter(
        (c) =>
          c.key === "__select__" ||
          visibleColumns.includes(c.key as ColumnKey)
      ),
    [allColumns, visibleColumns]
  );

  const headerMeta = (
    <>
      <span>{merchants.length} merchants</span>
      <span aria-hidden="true">·</span>
      <span>{summaryData.activeSubscriptions} active subscriptions</span>
      <span aria-hidden="true">·</span>
      <span>{formatCurrency(summaryData.activeMrr)} MRR</span>
      {summaryData.pastDueCount > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-warning-700 dark:text-warning-300">
            {summaryData.pastDueCount} past due
          </span>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Merchants"
        description="Ecommerce merchant accounts, subscriptions, and storefront configuration."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <MerchantSummaryCards
        data={summaryData}
        activeStatus={filters.merchantStatus}
        activeSubscription={filters.subscriptionStatus}
        activeSort={filters.sort}
        onFilterAll={() =>
          setFilters({
            merchantStatus: "",
            subscriptionStatus: "",
            page: "1",
          })
        }
        onFilterActive={() =>
          setFilters({ subscriptionStatus: "active", merchantStatus: "", page: "1" })
        }
        onFilterPastDue={() =>
          setFilters({ subscriptionStatus: "past_due", merchantStatus: "", page: "1" })
        }
        onFilterSuspended={() =>
          setFilters({ merchantStatus: "suspended", subscriptionStatus: "", page: "1" })
        }
        onSortByMrr={() => setFilters({ sort: "mrr", page: "1" })}
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <MerchantFilters
        value={filters}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      {selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk merchant actions"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
        >
          <span
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
            aria-live="polite"
          >
            {selectedIds.length} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Can permission={PERMISSIONS.MERCHANTS_SUSPEND}>
              <Button variant="outline" size="sm" onClick={handleBulkSuspend}>
                Suspend
              </Button>
            </Can>
            <Can permission={PERMISSIONS.MERCHANTS_PLAN}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkPlanOpen(true)}
              >
                Change plan
              </Button>
            </Can>
            <Can permission={PERMISSIONS.MERCHANTS_NOTIFY}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkNotifyOpen(true)}
              >
                Notify
              </Button>
            </Can>
            <Can permission={PERMISSIONS.EXPORT}>
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                Export
              </Button>
            </Can>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length} merchant{filtered.length === 1 ? "" : "s"}
          {hasActive ? " (filtered)" : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Rows per page
          </span>
          <select
            aria-label="Rows per page"
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.pageSize}
            onChange={(e) =>
              setFilters({ pageSize: e.target.value, page: "1" })
            }
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Columns:
        </span>
        {OPTIONAL_COLUMN_KEYS.map((key) => {
          const isVisible = visibleColumns.includes(key);
          const isLastVisible = visibleColumns.length === 1 && isVisible;
          return (
            <label key={key} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                aria-label={`Toggle ${COLUMN_LABEL[key]} column`}
                checked={isVisible}
                disabled={isLastVisible}
                onChange={() => toggleColumn(key)}
                className="h-3 w-3"
              />
              {COLUMN_LABEL[key]}
            </label>
          );
        })}
        {visibleColumns.length < OPTIONAL_COLUMN_KEYS.length && (
          <button
            type="button"
            onClick={() => setVisibleColumns([...OPTIONAL_COLUMN_KEYS])}
            className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Show all
          </button>
        )}
      </div>

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading merchants"
          className="space-y-2"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No merchants match these filters"
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
              title="No merchants yet"
              description="Merchant accounts appear here once they onboard."
            />
          )}
        </div>
      ) : (
        <>
          <AdminDataTable
            columns={displayColumns}
            data={paginated}
            isLoading={false}
            rowKey={(m) => m.id}
            onRowClick={(m) => setSelectedId(m.id)}
            emptyMessage="No merchants found."
            caption="Merchants"
            pageSize={pageSize}
            currentPage={safePage}
            onPageChange={(p) => setFilters({ page: String(p) })}
          />
        </>
      )}

      <MerchantDetailDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedId(null)}
        onChangePlan={handleChangePlan}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onToggleStore={handleToggleStore}
        onUpdateContractMrr={handleUpdateContractMrr}
        onApproveVerification={handleApproveVerification}
        onRejectVerification={handleRejectVerification}
        onSendNotification={handleSendNotification}
        onResetSecurity={handleResetSecurity}
      />

      <MerchantPlanChangeModal
        open={bulkPlanOpen}
        merchant={null}
        onClose={() => setBulkPlanOpen(false)}
        onConfirm={(planCode) => handleBulkPlan(planCode)}
      />

      <MerchantNotifyModal
        open={bulkNotifyOpen}
        merchantName={`${selectedIds.length} merchants`}
        onClose={() => setBulkNotifyOpen(false)}
        onConfirm={(channel, message) => handleBulkNotify(channel, message)}
      />

      <ConfirmDialog
        open={bulkIntent !== null}
        title={
          bulkIntent?.kind === "suspend"
            ? `Suspend ${bulkIntent.ids.length} merchants?`
            : ""
        }
        description={
          bulkIntent?.kind === "suspend"
            ? "Their accounts will be suspended and their storefronts disabled. Shoppers will lose access immediately."
            : ""
        }
        confirmLabel="Suspend merchants"
        danger
        onConfirm={confirmBulk}
        onCancel={() => setBulkIntent(null)}
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