/* eslint-disable react-hooks/set-state-in-effect */
// src/app/admin/ecommerce/storefront-users/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import { MerchantStorefrontUserSummaryCards } from "@/components/admin/merchant-storefront-users/merchant-storefront-user-summary-cards";
import {
  MerchantStorefrontUserFilters,
  type MerchantStorefrontUserFilterValues,
} from "@/components/admin/merchant-storefront-users/merchant-storefront-user-filters";
import { MerchantStorefrontUserCard } from "@/components/admin/merchant-storefront-users/merchant-storefront-user-card";
import { MerchantStorefrontUserDetailDrawer } from "@/components/admin/merchant-storefront-users/merchant-storefront-user-detail-drawer";
import { StorefrontUserNotifyModal } from "@/components/admin/storefront-users/storefront-user-action-modals";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { mockStorefrontUsers } from "@/lib/admin/mock/storefront-users";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { mockStorefrontUserOrders } from "@/lib/admin/mock/storefront-user-orders";
import {
  HIGH_VALUE_THRESHOLD,
  PAGE_SIZE,
  TAG_PRESETS,
  type SortKey,
} from "@/lib/admin/storefront-users/constants";
import {
  appendActivity,
  appendAuditTrail,
  buildAuditEntry,
} from "@/lib/admin/storefront-users/helpers";
import { storefrontUsersToCsv } from "@/lib/admin/storefront-users/csv-export";
import type {
  StorefrontUser,
  StorefrontUserSegment,
} from "@/lib/admin/types/storefront-user";
import { formatCurrency } from "@/lib/admin/formatters";

const VIEWS_KEY = "atlas-merchant-storefront-users-views-v2";

type MerchantSfuUrlFilters = MerchantStorefrontUserFilterValues;

const DEFAULT_FILTERS: MerchantSfuUrlFilters = {
  q: "",
  storefrontId: "",
  segment: "",
  status: "",
  risk: "",
  minSpend: "",
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
  | { kind: "tag"; ids: string[] };

export default function MerchantStorefrontUsersPage() {
  return (
    <Suspense fallback={<MerchantSfuSkeleton />}>
      <MerchantSfuPageInner />
    </Suspense>
  );
}

function MerchantSfuSkeleton() {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function MerchantSfuPageInner() {
  const admin = useCurrentAdmin();

  const [allUsers, setAllUsers] = useState<StorefrontUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewsLoaded, setViewsLoaded] = useState(false);
  const [bulkIntent, setBulkIntent] = useState<BulkIntent | null>(null);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkCampaignOpen, setBulkCampaignOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<MerchantSfuUrlFilters>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(filters.q, 300);
  const debouncedMinSpend = useDebouncedValue(filters.minSpend, 400);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setAllUsers(
        mockStorefrontUsers.filter((u) => u.storefrontType === "merchant")
      );
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
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const merchantStorefronts = useMemo(
    () => mockStorefronts.filter((s) => s.type === "merchant"),
    []
  );

  const storefrontById = useMemo(
    () => new Map(merchantStorefronts.map((s) => [s.id, s])),
    [merchantStorefronts]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const minSpendNum = debouncedMinSpend ? Number(debouncedMinSpend) : 0;
    const list = allUsers.filter((u) => {
      if (q) {
        const haystack = `${u.name} ${u.email} ${u.phone}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.storefrontId && u.storefrontId !== filters.storefrontId) {
        return false;
      }
      if (filters.segment && u.segment !== filters.segment) return false;
      if (filters.status && u.status !== filters.status) return false;
      if (filters.risk && u.riskLevel !== filters.risk) return false;
      if (minSpendNum > 0 && u.totalSpent < minSpendNum) return false;
      return true;
    });

    const sorted = [...list];
    const key = filters.sort as SortKey;
    sorted.sort((a, b) => {
      switch (key) {
        case "name":
          return a.name.localeCompare(b.name);
        case "joined":
          return (
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
        case "totalSpent":
          return b.totalSpent - a.totalSpent;
        case "orders":
          return b.ordersCount - a.ordersCount;
        case "lastActive":
        default:
          return (
            new Date(b.lastActive).getTime() -
            new Date(a.lastActive).getTime()
          );
      }
    });
    return sorted;
  }, [allUsers, debouncedSearch, debouncedMinSpend, filters]);

  const pageSize = Math.max(6, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const paginatedIds = useMemo(() => paginated.map((u) => u.id), [paginated]);

  useEffect(() => {
    if (focusedId && !paginatedIds.includes(focusedId)) {
      setFocusedId(paginatedIds[0] ?? null);
    }
  }, [paginatedIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(
      `[data-storefront-user-id="${focusedId}"]`
    );
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: paginatedIds,
    focusedId,
    enabled:
      selectedId === null &&
      bulkIntent === null &&
      !bulkTagOpen &&
      !bulkCampaignOpen,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selectedUser = useMemo(
    () => allUsers.find((u) => u.id === selectedId) ?? null,
    [allUsers, selectedId]
  );

  const selectedUserOrders = useMemo(
    () =>
      selectedUser
        ? mockStorefrontUserOrders.filter(
            (o) => o.storefrontUserId === selectedUser.id
          )
        : [],
    [selectedUser]
  );

  const updateUser = (
    id: string,
    patch: (u: StorefrontUser) => StorefrontUser
  ) => {
    setAllUsers((prev) => prev.map((u) => (u.id === id ? patch(u) : u)));
  };

  const applyAudit = (
    user: StorefrontUser,
    action: string
  ): StorefrontUser => {
    const entry = buildAuditEntry({
      admin: admin ?? SYSTEM_ADMIN,
      action,
    });
    return { ...user, auditTrail: appendAuditTrail(user, entry) };
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ------------------------------ Single actions ------------------- */

  const handleAddTag = (id: string, tag: string) => {
    updateUser(id, (u) => {
      if (u.tags.includes(tag)) return u;
      const next: StorefrontUser = { ...u, tags: [...u.tags, tag] };
      return applyAudit(next, `Added tag "${tag}"`);
    });
    setToast({ kind: "success", text: `Tag "${tag}" added.` });
  };

  const handleRemoveTag = (id: string, tag: string) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = {
        ...u,
        tags: u.tags.filter((t) => t !== tag),
      };
      return applyAudit(next, `Removed tag "${tag}"`);
    });
  };

  const handleAddToSegment = (
    id: string,
    segment: StorefrontUserSegment,
    note: string
  ) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = { ...u, segment };
      const withActivity: StorefrontUser = {
        ...next,
        activityLog: appendActivity(
          next,
          `Segment changed to ${segment}`
        ),
      };
      return applyAudit(
        withActivity,
        `Segment: ${u.segment ?? "none"} → ${segment}${
          note ? `. ${note}` : ""
        }`
      );
    });
    setToast({ kind: "success", text: `Segment set to ${segment}.` });
  };

  const handleSuspend = (id: string, reason: string) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = { ...u, status: "suspended" };
      const withActivity: StorefrontUser = {
        ...next,
        activityLog: appendActivity(next, `Suspended: ${reason}`),
      };
      return applyAudit(withActivity, `Suspended: ${reason}`);
    });
    setSelectedId(null);
    setToast({ kind: "success", text: "User suspended." });
  };

  const handleReactivate = (id: string) => {
    updateUser(id, (u) => {
      const next: StorefrontUser = { ...u, status: "active" };
      return applyAudit(next, "Reactivated");
    });
    setToast({ kind: "success", text: "User reactivated." });
  };

  const handleSendNotification = (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    updateUser(id, (u) => {
      const next: StorefrontUser = {
        ...u,
        activityLog: appendActivity(
          u,
          `Notification sent via ${channel.toUpperCase()}`
        ),
      };
      return applyAudit(
        next,
        `Notification sent to ${target.email} via ${channel.toUpperCase()}`
      );
    });
    setToast({
      kind: "success",
      text: `${channel.toUpperCase()} sent to ${target.name}.`,
    });
  };

  const handleSendCoupon = (
    id: string,
    code: string,
    amount: number,
    reason: string
  ) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    updateUser(id, (u) => {
      const next: StorefrontUser = {
        ...u,
        activityLog: appendActivity(
          u,
          `Coupon ${code} (${formatCurrency(amount)}) sent`
        ),
      };
      return applyAudit(
        next,
        `Coupon ${code} (${formatCurrency(amount)}) issued. ${reason}`
      );
    });
    setToast({
      kind: "success",
      text: `Coupon ${code} sent to ${target.name}.`,
    });
  };

  const handleRevealPII = (id: string) => {
    updateUser(id, (u) => applyAudit(u, "Revealed contact details"));
  };

  const handleResetPassword = (id: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (!target) return;
    updateUser(id, (u) =>
      applyAudit(u, `Password reset link sent to ${target.email}`)
    );
    setToast({
      kind: "success",
      text: `Reset link sent to ${target.email}.`,
    });
  };

  /* ------------------------------ Bulk ----------------------------- */

  const handleBulkSuspend = () => {
    setBulkIntent({ kind: "suspend", ids: selectedIds });
  };

  const handleBulkTag = (tag: string) => {
    setBulkIntent({ kind: "tag", ids: selectedIds });
    setBulkTagOpen(false);
    const idSet = new Set(selectedIds);
    setAllUsers((prev) =>
      prev.map((u) => {
        if (!idSet.has(u.id)) return u;
        if (u.tags.includes(tag)) return u;
        const next: StorefrontUser = { ...u, tags: [...u.tags, tag] };
        return applyAudit(next, `Added tag "${tag}" (bulk)`);
      })
    );
    setToast({
      kind: "success",
      text: `Tag "${tag}" applied to ${selectedIds.length} users.`,
    });
    setSelectedIds([]);
    setBulkIntent(null);
  };

  const handleBulkExport = () => {
    const selected = allUsers.filter((u) => selectedIds.includes(u.id));
    const csv = storefrontUsersToCsv(selected, storefrontById);
    downloadCsv(
      `atlas-merchant-storefront-users-selected-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      csv
    );
    setToast({
      kind: "success",
      text: `Exported ${selected.length} users.`,
    });
    setSelectedIds([]);
  };

  const handleBulkCampaign = (
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const idSet = new Set(selectedIds);
    setAllUsers((prev) =>
      prev.map((u) => {
        if (!idSet.has(u.id)) return u;
        return applyAudit(
          u,
          `Campaign sent via ${channel.toUpperCase()} (bulk)`
        );
      })
    );
    setToast({
      kind: "success",
      text: `Campaign queued for ${selectedIds.length} users.`,
    });
    setSelectedIds([]);
    setBulkCampaignOpen(false);
  };

  const confirmBulk = () => {
    if (!bulkIntent) return;
    if (bulkIntent.kind === "suspend") {
      const idSet = new Set(bulkIntent.ids);
      setAllUsers((prev) =>
        prev.map((u) => {
          if (!idSet.has(u.id)) return u;
          const next: StorefrontUser = { ...u, status: "suspended" };
          const withActivity: StorefrontUser = {
            ...next,
            activityLog: appendActivity(
              next,
              "Suspended via bulk action"
            ),
          };
          return applyAudit(withActivity, "Suspended via bulk action");
        })
      );
      setToast({
        kind: "success",
        text: `Suspended ${bulkIntent.ids.length} users.`,
      });
    }
    setSelectedIds([]);
    setBulkIntent(null);
  };

  /* ------------------------------ Export --------------------------- */

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = storefrontUsersToCsv(filtered, storefrontById);
    downloadCsv(
      `atlas-merchant-storefront-users-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      csv
    );
  };

  /* ---------------------------- Saved views ------------------------ */

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.storefrontId) snapshot.storefrontId = filters.storefrontId;
    if (filters.segment) snapshot.segment = filters.segment;
    if (filters.status) snapshot.status = filters.status;
    if (filters.risk) snapshot.risk = filters.risk;
    if (filters.minSpend) snapshot.minSpend = filters.minSpend;
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

  const headerMeta = (
    <>
      <span>{allUsers.length} customers</span>
      <span aria-hidden="true">·</span>
      <span>{merchantStorefronts.length} storefronts</span>
      <span aria-hidden="true">·</span>
      <span>
        {allUsers.filter((u) => u.segment === "at_risk").length} at risk
      </span>
      {allUsers.filter((u) => u.totalSpent >= HIGH_VALUE_THRESHOLD).length >
        0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-success-700 dark:text-success-300">
            {allUsers.filter((u) => u.totalSpent >= HIGH_VALUE_THRESHOLD).length}{" "}
            high value
          </span>
        </>
      )}
    </>
  );

  const filterValues: MerchantStorefrontUserFilterValues = filters;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Merchant storefront users"
        description="Customers of merchant storefronts across Atlas Ecommerce."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <MerchantStorefrontUserSummaryCards
        users={allUsers}
        storefrontCount={merchantStorefronts.length}
        activeSegment={filters.segment}
        activeMinSpend={filters.minSpend}
        onFilterAll={() =>
          setFilters({ segment: "", minSpend: "", page: "1" })
        }
        onFilterRepeat={() =>
          setFilters({ segment: "repeat", minSpend: "", page: "1" })
        }
        onFilterHighValue={() =>
          setFilters({
            minSpend: String(HIGH_VALUE_THRESHOLD),
            segment: "",
            page: "1",
          })
        }
        onFilterAtRisk={() =>
          setFilters({ segment: "at_risk", minSpend: "", page: "1" })
        }
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <MerchantStorefrontUserFilters
        value={filterValues}
        storefronts={merchantStorefronts}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      {selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk merchant customer actions"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
        >
          <span
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
            aria-live="polite"
          >
            {selectedIds.length} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Can permission={PERMISSIONS.STOREFRONT_USERS_SUSPEND}>
              <Button variant="outline" size="sm" onClick={handleBulkSuspend}>
                Suspend
              </Button>
            </Can>
            <Can permission={PERMISSIONS.STOREFRONT_USERS_TAG}>
              <Button
                variant={bulkTagOpen ? "primary" : "outline"}
                size="sm"
                aria-expanded={bulkTagOpen}
                onClick={() => setBulkTagOpen((v) => !v)}
              >
                Add tag
              </Button>
            </Can>
            <Can permission={PERMISSIONS.STOREFRONT_USERS_NOTIFY}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkCampaignOpen(true)}
              >
                Send campaign
              </Button>
            </Can>
            <Can permission={PERMISSIONS.STOREFRONT_USERS_EXPORT}>
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

          {bulkTagOpen && (
            <div className="w-full border-t border-brand-200 pt-2 dark:border-brand-800/60">
              <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                Apply tag to all {selectedIds.length} selected:
              </p>
              <div className="flex flex-wrap gap-2">
                {TAG_PRESETS.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          Showing {paginated.length} of {filtered.length} merchant customer
          {filtered.length === 1 ? "" : "s"}
          {hasActive ? " (filtered)" : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Per page
          </span>
          <select
            aria-label="Users per page"
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.pageSize}
            onChange={(e) =>
              setFilters({ pageSize: e.target.value, page: "1" })
            }
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading merchant storefront users"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No merchant customers match these filters"
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
              title="No merchant customers yet"
              description="Merchant customers appear here once they place their first order."
            />
          )}
        </div>
      ) : (
        <>
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {paginated.map((user) => (
              <li key={user.id}>
                <MerchantStorefrontUserCard
                  user={user}
                  storefront={storefrontById.get(user.storefrontId)}
                  isSelected={selectedIds.includes(user.id)}
                  isFocused={focusedId === user.id}
                  onToggleSelect={toggleSelect}
                  onOpen={setSelectedId}
                  onFocus={setFocusedId}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Merchant storefront user pagination"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Page {safePage} of {totalPages} · {filtered.length} users
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

      <MerchantStorefrontUserDetailDrawer
        user={selectedUser}
        storefront={
          selectedUser
            ? storefrontById.get(selectedUser.storefrontId)
            : undefined
        }
        orders={selectedUserOrders}
        onClose={() => setSelectedId(null)}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onAddToSegment={handleAddToSegment}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onSendNotification={handleSendNotification}
        onSendCoupon={handleSendCoupon}
        onRevealPII={handleRevealPII}
        onResetPassword={handleResetPassword}
      />

      <StorefrontUserNotifyModal
        open={bulkCampaignOpen}
        userName={`${selectedIds.length} merchant customers`}
        storefrontName="selected merchant storefronts"
        title="Send campaign"
        description={`Broadcast a message to ${selectedIds.length} selected customer${
          selectedIds.length === 1 ? "" : "s"
        }. The message is delivered through the chosen channel.`}
        confirmLabel="Send campaign"
        onClose={() => setBulkCampaignOpen(false)}
        onConfirm={(channel, message) => handleBulkCampaign(channel, message)}
      />

      <ConfirmDialog
        open={bulkIntent !== null}
        title={
          bulkIntent?.kind === "suspend"
            ? `Suspend ${bulkIntent.ids.length} merchant customers?`
            : ""
        }
        description={
          bulkIntent?.kind === "suspend"
            ? "They will be signed out and blocked from placing new orders on their merchant's storefront."
            : ""
        }
        confirmLabel="Suspend customers"
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