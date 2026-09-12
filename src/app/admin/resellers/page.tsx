/* eslint-disable react-hooks/set-state-in-effect */
// src/app/admin/resellers/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Badge } from "@/components/admin/ui/badge";
import {
  SavedViews,
  type SavedView,
} from "@/components/admin/ui/saved-views";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { ResellerSummaryCards } from "@/components/admin/resellers/reseller-summary-cards";
import {
  ResellerFilters,
  type ResellerFilterValues,
} from "@/components/admin/resellers/reseller-filters";
import { ResellerDetailDrawer } from "@/components/admin/resellers/reseller-detail-drawer";
import {
  ResellerOnboardModal,
  type OnboardResellerInput,
} from "@/components/admin/resellers/reseller-onboard-modal";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useCurrentAdmin, Can, PERMISSIONS } from "@/lib/admin/rbac";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { mockResellerTiers } from "@/lib/admin/mock/commissions";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  PAGE_SIZE,
  OPTIONAL_COLUMN_KEYS,
  COLUMN_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  VERIFICATION_LABEL,
  VERIFICATION_VARIANT,
  type ColumnKey,
  type SortKey,
  type WalletAdjustMethod,
} from "@/lib/admin/resellers/constants";
import {
  appendActivity,
  appendAuditTrail,
  buildAuditEntry,
  computeCommissionTotals,
  tierById,
} from "@/lib/admin/resellers/helpers";
import { resellersToCsv } from "@/lib/admin/resellers/csv-export";
import type { Reseller } from "@/lib/admin/types/reseller";

const VIEWS_KEY = "atlas-reseller-views-v2";
const COLUMNS_KEY = "atlas-reseller-columns-v2";

type ResellerUrlFilters = ResellerFilterValues & { pageSize: string };

const DEFAULT_FILTERS: ResellerUrlFilters = {
  q: "",
  status: "",
  verification: "",
  tier: "",
  joinedFrom: "",
  joinedTo: "",
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
  onUndo?: () => void;
}

type BulkIntent =
  | { kind: "suspend"; ids: string[] }
  | { kind: "verify"; ids: string[] }
  | { kind: "tier"; ids: string[]; tierId: string };

export default function ResellersPage() {
  return (
    <Suspense fallback={<ResellersSkeleton />}>
      <ResellersPageInner />
    </Suspense>
  );
}

function ResellersSkeleton() {
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

function ResellersPageInner() {
  const admin = useCurrentAdmin();

  const [resellers, setResellers] = useState<Reseller[]>([]);
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
  const [tierPickerOpen, setTierPickerOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<ResellerUrlFilters>(DEFAULT_FILTERS);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const enriched: Reseller[] = mockResellers.map((r) => {
        const totals = computeCommissionTotals(r.id);
        return {
          ...r,
          commissionsEarned: totals.earned,
          commissionsPending: totals.pending,
          commissionsPaid: totals.paid,
        };
      });
      setResellers(enriched);
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

  const storefrontByOwner = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of mockStorefronts) {
      if (s.type === "reseller") map.set(s.ownerId, s.id);
    }
    return map;
  }, []);

  const availableTiers = useMemo(
    () => mockResellerTiers.map((t) => t.name),
    []
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = resellers;

    if (q) {
      list = list.filter((r) =>
        `${r.businessName} ${r.storeName ?? ""} ${r.contactPerson} ${
          r.email
        }`
          .toLowerCase()
          .includes(q)
      );
    }
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.verification) {
      list = list.filter((r) => r.verificationStatus === filters.verification);
    }
    if (filters.tier) list = list.filter((r) => r.tierName === filters.tier);
    if (filters.joinedFrom) {
      const from = new Date(filters.joinedFrom).getTime();
      list = list.filter((r) => new Date(r.joinedAt).getTime() >= from);
    }
    if (filters.joinedTo) {
      const to = new Date(filters.joinedTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((r) => new Date(r.joinedAt).getTime() <= to.getTime());
    }

    const sorted = [...list];
    const key = filters.sort as SortKey;
    sorted.sort((a, b) => {
      switch (key) {
        case "joined":
          return (
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
        case "totalRevenue":
          return b.totalRevenue - a.totalRevenue;
        case "wallet":
          return b.walletBalance - a.walletBalance;
        case "commissionsEarned":
          return b.commissionsEarned - a.commissionsEarned;
        case "commissionsPending":
          return b.commissionsPending - a.commissionsPending;
        case "businessName":
          return a.businessName.localeCompare(b.businessName);
        case "lastActive":
        default:
          return (
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          );
      }
    });
    return sorted;
  }, [resellers, filters]);

  const pageSize = Math.max(5, Number(filters.pageSize) || PAGE_SIZE);
  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const paginatedIds = useMemo(() => paginated.map((r) => r.id), [paginated]);

  useEffect(() => {
    if (focusedId && !paginatedIds.includes(focusedId)) {
      setFocusedId(paginatedIds[0] ?? null);
    }
  }, [paginatedIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-reseller-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: paginatedIds,
    focusedId,
    enabled: selectedId === null && bulkIntent === null,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selected = useMemo(
    () => resellers.find((r) => r.id === selectedId) ?? null,
    [resellers, selectedId]
  );

  const summaryData = useMemo(() => {
    const nowDate = new Date();
    const newThisMonth = resellers.filter((r) => {
      const d = new Date(r.joinedAt);
      return (
        d.getMonth() === nowDate.getMonth() &&
        d.getFullYear() === nowDate.getFullYear()
      );
    }).length;

    return {
      totalResellers: resellers.length,
      activeResellers: resellers.filter((r) => r.status === "active").length,
      pendingVerification: resellers.filter(
        (r) => r.verificationStatus === "pending"
      ).length,
      suspendedResellers: resellers.filter((r) => r.status === "suspended")
        .length,
      pendingPayoutTotal: resellers.reduce(
        (s, r) => s + r.commissionsPending,
        0
      ),
      newThisMonth,
    };
  }, [resellers]);

  const updateReseller = (id: string, patch: (r: Reseller) => Reseller) => {
    setResellers((prev) => prev.map((r) => (r.id === id ? patch(r) : r)));
  };

  const toggleSelect = (id: string) => {
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

  const applyAudit = (reseller: Reseller, action: string): Reseller => {
    const entry = buildAuditEntry({ admin: admin ?? SYSTEM_ADMIN, action });
    return { ...reseller, auditTrail: appendAuditTrail(reseller, entry) };
  };

  const handleAdjustWallet = (
    id: string,
    amount: number,
    reason: string,
    method: WalletAdjustMethod
  ) => {
    updateReseller(id, (r) => {
      const withBalance: Reseller = {
        ...r,
        walletBalance: r.walletBalance + amount,
      };
      const direction = amount >= 0 ? "Credited" : "Debited";
      const withActivity: Reseller = {
        ...withBalance,
        activityLog: appendActivity(
          withBalance,
          `${direction} ${formatCurrency(Math.abs(amount))} via ${method}. ${reason}`
        ),
      };
      return applyAudit(
        withActivity,
        `${direction} wallet ${formatCurrency(Math.abs(amount))} via ${method}. ${reason}`
      );
    });
    setToast({
      kind: "success",
      text: `Wallet ${amount >= 0 ? "credited" : "debited"} ${formatCurrency(
        Math.abs(amount)
      )}.`,
    });
  };

  const handleSuspend = (id: string, reason: string) => {
    updateReseller(id, (r) => {
      const next: Reseller = { ...r, status: "suspended" };
      return applyAudit(next, `Suspended: ${reason}`);
    });
    setSelectedId(null);
    setToast({ kind: "success", text: "Reseller suspended." });
  };

  const handleReactivate = (id: string) => {
    updateReseller(id, (r) => {
      const next: Reseller = { ...r, status: "active" };
      return applyAudit(next, "Reactivated");
    });
    setToast({ kind: "success", text: "Reseller reactivated." });
  };

  const handleApproveVerification = (id: string) => {
    updateReseller(id, (r) => {
      const next: Reseller = {
        ...r,
        verificationStatus: "verified",
        lastVerifiedAt: new Date().toISOString(),
      };
      return applyAudit(next, "Verified identity");
    });
    setToast({ kind: "success", text: "Verification approved." });
  };

  const handleRejectVerification = (id: string, reason: string) => {
    updateReseller(id, (r) => {
      const next: Reseller = { ...r, verificationStatus: "rejected" };
      return applyAudit(next, `Verification rejected: ${reason}`);
    });
    setToast({ kind: "success", text: "Verification rejected." });
  };

  const handleToggleStorefront = (id: string) => {
    const storefrontId = storefrontByOwner.get(id);
    if (!storefrontId) return;
    updateReseller(id, (r) =>
      applyAudit(
        r,
        r.status === "active" ? "Disabled storefront" : "Enabled storefront"
      )
    );
    setToast({ kind: "success", text: "Storefront status toggled." });
  };

  const handleAssignTier = (id: string, tierId: string) => {
    const tier = tierById(tierId);
    if (!tier) return;
    updateReseller(id, (r) => {
      const next: Reseller = { ...r, tierId: tier.id, tierName: tier.name };
      return applyAudit(next, `Tier changed to ${tier.name}`);
    });
    setToast({ kind: "success", text: `Tier updated to ${tier.name}.` });
  };

  const handleSendNotification = (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const target = resellers.find((r) => r.id === id);
    if (!target) return;
    updateReseller(id, (r) => {
      const withActivity: Reseller = {
        ...r,
        activityLog: appendActivity(
          r,
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
    const target = resellers.find((r) => r.id === id);
    if (!target) return;
    updateReseller(id, (r) => {
      const withActivity: Reseller = {
        ...r,
        activityLog: appendActivity(
          r,
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

  const handleOnboard = (input: OnboardResellerInput) => {
    const tier = tierById(input.tierId);
    const nowIso = new Date().toISOString();
    const newReseller: Reseller = {
      id: `RS-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      businessName: input.businessName,
      storeName: input.storeName,
      contactPerson: input.contactPerson,
      email: input.email,
      phone: input.phone,
      walletBalance: 0,
      totalOrders: 0,
      totalRevenue: 0,
      commissionRate: input.commissionRate,
      status: "pending",
      verificationStatus: "not_submitted",
      joinedAt: nowIso,
      lastActive: nowIso,
      tierName: tier?.name,
      tierId: tier?.id,
      commissionRateIsDefault: true,
      commissionsEarned: 0,
      commissionsPending: 0,
      commissionsPaid: 0,
      activityLog: [
        {
          id: crypto.randomUUID(),
          timestamp: nowIso,
          action: "Account created",
        },
      ],
      auditTrail: [
        buildAuditEntry({
          admin: admin ?? SYSTEM_ADMIN,
          action: "Created reseller account",
        }),
      ],
    };
    setResellers((prev) => [newReseller, ...prev]);
    setToast({
      kind: "success",
      text: `Created ${input.businessName}.`,
    });
  };

  const handleBulkSuspend = () => {
    setBulkIntent({ kind: "suspend", ids: selectedIds });
  };

  const handleBulkVerify = () => {
    setBulkIntent({ kind: "verify", ids: selectedIds });
  };

  const handleBulkAssignTier = (tierId: string) => {
    setBulkIntent({ kind: "tier", ids: selectedIds, tierId });
    setTierPickerOpen(false);
  };

  const confirmBulk = () => {
    if (!bulkIntent) return;
    const idSet = new Set(bulkIntent.ids);
    if (bulkIntent.kind === "suspend") {
      setResellers((prev) =>
        prev.map((r) => {
          if (!idSet.has(r.id)) return r;
          const next: Reseller = { ...r, status: "suspended" };
          return applyAudit(next, "Suspended via bulk action");
        })
      );
      setToast({
        kind: "success",
        text: `Suspended ${bulkIntent.ids.length} resellers.`,
      });
    } else if (bulkIntent.kind === "verify") {
      setResellers((prev) =>
        prev.map((r) => {
          if (!idSet.has(r.id)) return r;
          const next: Reseller = {
            ...r,
            verificationStatus: "verified",
            lastVerifiedAt: new Date().toISOString(),
          };
          return applyAudit(next, "Verified via bulk action");
        })
      );
      setToast({
        kind: "success",
        text: `Verified ${bulkIntent.ids.length} resellers.`,
      });
    } else if (bulkIntent.kind === "tier") {
      const tier = tierById(bulkIntent.tierId);
      if (!tier) return;
      setResellers((prev) =>
        prev.map((r) => {
          if (!idSet.has(r.id)) return r;
          const next: Reseller = {
            ...r,
            tierId: tier.id,
            tierName: tier.name,
          };
          return applyAudit(next, `Tier changed to ${tier.name} (bulk)`);
        })
      );
      setToast({
        kind: "success",
        text: `Assigned ${tier.name} to ${bulkIntent.ids.length} resellers.`,
      });
    }
    setSelectedIds([]);
    setBulkIntent(null);
  };

  const handleBulkExport = () => {
    const selectedResellers = resellers.filter((r) =>
      selectedIds.includes(r.id)
    );
    const csv = resellersToCsv(selectedResellers);
    downloadCsv(
      `atlas-resellers-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
    setToast({
      kind: "success",
      text: `Exported ${selectedResellers.length} resellers.`,
    });
    setSelectedIds([]);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = resellersToCsv(filtered);
    downloadCsv(
      `atlas-resellers-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  const handleSaveView = (name: string) => {
    const snapshot: Record<string, string> = {};
    if (filters.q) snapshot.q = filters.q;
    if (filters.status) snapshot.status = filters.status;
    if (filters.verification) snapshot.verification = filters.verification;
    if (filters.tier) snapshot.tier = filters.tier;
    if (filters.joinedFrom) snapshot.joinedFrom = filters.joinedFrom;
    if (filters.joinedTo) snapshot.joinedTo = filters.joinedTo;
    if (filters.sort && filters.sort !== "lastActive") {
      snapshot.sort = filters.sort;
    }
    setSavedViews((prev) => [...prev, { name, filters: snapshot }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters({ ...DEFAULT_FILTERS, ...view.filters, page: "1" });
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const allColumns: Column<Reseller>[] = useMemo(
    () => [
      {
        key: "__select__",
        header: "",
        cell: (r) => (
          <input
            type="checkbox"
            aria-label={`Select ${r.businessName}`}
            checked={selectedIds.includes(r.id)}
            onChange={() => toggleSelect(r.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4"
          />
        ),
      },
      {
        key: "businessName",
        header: "Business",
        cell: (r) => (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {r.businessName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                {r.businessName}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {r.storeName ?? "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        header: "Contact",
        cell: (r) => (
          <div className="text-xs">
            <p className="text-neutral-800 dark:text-neutral-200">
              {r.contactPerson}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">{r.email}</p>
          </div>
        ),
      },
      {
        key: "tier",
        header: "Tier",
        cell: (r) =>
          r.tierName ? (
            <Badge variant="info" size="sm">
              {r.tierName}
            </Badge>
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              —
            </span>
          ),
      },
      {
        key: "wallet",
        header: "Wallet",
        cell: (r) => (
          <span className="text-neutral-800 dark:text-neutral-200">
            {formatCurrency(r.walletBalance)}
          </span>
        ),
      },
      {
        key: "orders",
        header: "Orders",
        cell: (r) => (
          <span className="text-neutral-800 dark:text-neutral-200">
            {r.totalOrders}
          </span>
        ),
      },
      {
        key: "revenue",
        header: "Revenue",
        cell: (r) => (
          <span className="text-neutral-800 dark:text-neutral-200">
            {formatCurrency(r.totalRevenue)}
          </span>
        ),
      },
      {
        key: "commissions",
        header: "Commissions",
        cell: (r) => (
          <div className="text-xs">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatCurrency(r.commissionsEarned)}
            </p>
            {r.commissionsPending > 0 && (
              <p className="text-warning-700 dark:text-warning-300">
                {formatCurrency(r.commissionsPending)} pending
              </p>
            )}
          </div>
        ),
      },
      {
        key: "verification",
        header: "Verification",
        cell: (r) => (
          <Badge variant={VERIFICATION_VARIANT[r.verificationStatus]} size="sm">
            {VERIFICATION_LABEL[r.verificationStatus]}
          </Badge>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <Badge variant={STATUS_VARIANT[r.status]} size="sm">
            {STATUS_LABEL[r.status]}
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
      <span>{resellers.length} resellers</span>
      <span aria-hidden="true">·</span>
      <span>{summaryData.activeResellers} active</span>
      {summaryData.pendingVerification > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-warning-700 dark:text-warning-300">
            {summaryData.pendingVerification} pending verification
          </span>
        </>
      )}
      {summaryData.suspendedResellers > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-danger-700 dark:text-danger-300">
            {summaryData.suspendedResellers} suspended
          </span>
        </>
      )}
    </>
  );

  const filterValues: ResellerFilterValues = {
    q: filters.q,
    status: filters.status,
    verification: filters.verification,
    tier: filters.tier,
    joinedFrom: filters.joinedFrom,
    joinedTo: filters.joinedTo,
    sort: filters.sort,
    page: filters.page,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Resellers"
        description="Manage reseller accounts, verification, wallets, and storefronts."
        meta={headerMeta}
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Button size="sm" onClick={() => setOnboardOpen(true)}>
              Add reseller
            </Button>
          </>
        }
      />

      <ResellerSummaryCards
        data={summaryData}
        activeStatus={filters.status}
        activeVerification={filters.verification}
        activeSort={filters.sort}
        onFilterAll={() =>
          setFilters({
            status: "",
            verification: "",
            sort: "lastActive",
            page: "1",
          })
        }
        onFilterActive={() =>
          setFilters({ status: "active", verification: "", page: "1" })
        }
        onFilterPending={() =>
          setFilters({ verification: "pending", status: "", page: "1" })
        }
        onFilterSuspended={() =>
          setFilters({ status: "suspended", verification: "", page: "1" })
        }
        onSortByPendingPayout={() =>
          setFilters({ sort: "commissionsPending", page: "1" })
        }
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <ResellerFilters
        value={filterValues}
        availableTiers={availableTiers}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      {selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk reseller actions"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
        >
          <span
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
            aria-live="polite"
          >
            {selectedIds.length} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Can permission={PERMISSIONS.RESELLERS_SUSPEND}>
              <Button variant="outline" size="sm" onClick={handleBulkSuspend}>
                Suspend
              </Button>
            </Can>
            <Can permission={PERMISSIONS.RESELLERS_VERIFY}>
              <Button variant="outline" size="sm" onClick={handleBulkVerify}>
                Verify
              </Button>
            </Can>
            <Can permission={PERMISSIONS.RESELLERS_TIER}>
              <Button
                variant={tierPickerOpen ? "primary" : "outline"}
                size="sm"
                aria-expanded={tierPickerOpen}
                onClick={() => setTierPickerOpen((v) => !v)}
              >
                Assign tier
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

          {tierPickerOpen && (
            <div className="w-full border-t border-brand-200 pt-2 dark:border-brand-800/60">
              <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                Apply this tier to all {selectedIds.length} selected:
              </p>
              <div className="flex flex-wrap gap-2">
                {mockResellerTiers.map((tier) => (
                  <Button
                    key={tier.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAssignTier(tier.id)}
                  >
                    {tier.name}
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
          {filtered.length} reseller{filtered.length === 1 ? "" : "s"}
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
          aria-label="Loading resellers"
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
              title="No resellers match these filters"
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
              title="No resellers yet"
              description="Add your first reseller to get started."
              action={
                <Button size="sm" onClick={() => setOnboardOpen(true)}>
                  Add reseller
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={displayColumns}
          data={paginated}
          isLoading={false}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyMessage="No resellers found."
          caption="Resellers"
          pageSize={pageSize}
          currentPage={safePage}
          onPageChange={(p) => setFilters({ page: String(p) })}
        />
      )}

      <ResellerDetailDrawer
        reseller={selected}
        onClose={() => setSelectedId(null)}
        onAdjustWallet={handleAdjustWallet}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onApproveVerification={handleApproveVerification}
        onRejectVerification={handleRejectVerification}
        onToggleStorefront={handleToggleStorefront}
        onAssignTier={handleAssignTier}
        onSendNotification={handleSendNotification}
        onResetSecurity={handleResetSecurity}
      />

      <ResellerOnboardModal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onConfirm={handleOnboard}
      />

      <ConfirmDialog
        open={bulkIntent !== null}
        title={
          bulkIntent?.kind === "suspend"
            ? `Suspend ${bulkIntent.ids.length} resellers?`
            : bulkIntent?.kind === "verify"
            ? `Verify ${bulkIntent.ids.length} resellers?`
            : bulkIntent?.kind === "tier"
            ? `Assign tier to ${bulkIntent.ids.length} resellers?`
            : ""
        }
        description={
          bulkIntent?.kind === "suspend"
            ? "Their storefronts will be disabled and customers will lose the ability to place new orders."
            : bulkIntent?.kind === "verify"
            ? "Only do this after reviewing submitted documents for each reseller."
            : bulkIntent?.kind === "tier"
            ? "The new tier rate will apply to future orders. Existing commissions are unchanged."
            : ""
        }
        confirmLabel="Confirm"
        danger={bulkIntent?.kind === "suspend"}
        onConfirm={confirmBulk}
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