"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type {
  Promotion,
  PromotionStatus,
} from "@/lib/admin/types/promotion";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useResellerTiers } from "@/lib/admin/hooks/use-reseller-tiers";
import { usePromotions } from "@/lib/admin/hooks/use-promotions";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { promotionsToCsv } from "@/lib/admin/promotions/promotion-csv-export";
import { promotionStatus } from "@/lib/admin/promotions/promotion-projection";
import { promotionStatus as resellerPromotionStatus } from "@/lib/admin/resellers/promotion-projection";
import {
  createPromotion,
  updatePromotion,
  endPromotion,
  deletePromotion,
  type PromotionActor,
  type PromotionInput,
} from "@/lib/admin/mock/promotion-store";
import {
  ALL_MECHANIC_KINDS,
  MECHANIC_KIND_LABEL,
  PROMOTION_AUDIENCE_LABEL,
} from "@/lib/admin/promotions/promotion-labels";
import { PromotionSummaryCards } from "@/components/admin/promotions/promotion-summary-cards";
import { PromotionCard } from "@/components/admin/promotions/promotion-card";
import { PromotionEditorModal } from "@/components/admin/promotions/promotion-editor-modal";
import { PromotionDeleteModal } from "@/components/admin/promotions/promotion-delete-modal";
import { PromotionEndModal } from "@/components/admin/promotions/promotion-end-modal";

interface PromotionFilters {
  q: string;
  status: string;
  audience: string;
  mechanic: string;
  view: string;
}

const DEFAULT_FILTERS: PromotionFilters = {
  q: "",
  status: "",
  audience: "",
  mechanic: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

type RenderedItem =
  | { source: "general"; promotion: Promotion; status: PromotionStatus }
  | {
      source: "reseller";
      promotion: ResellerPromotion;
      status: PromotionStatus;
    };

const STATUS_WEIGHT: Record<PromotionStatus, number> = {
  active: 0,
  scheduled: 1,
  expired: 2,
  ended: 3,
};

const SEVEN_DAYS = 7 * 86_400_000;

function isExpiringSoon(endDate: string, now: number): boolean {
  const end = new Date(endDate).getTime();
  return end >= now && end - now <= SEVEN_DAYS;
}

export default function PromotionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PromotionsPageInner />
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function PromotionsPageInner() {
  const admin = useCurrentAdmin();
  const { promotions, resellerBoosts, summary, loading } = usePromotions();
  const { tiers } = useResellerTiers();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<PromotionFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [editorState, setEditorState] = useState<
    | { kind: "closed" }
    | { kind: "create" }
    | { kind: "edit"; promotion: Promotion }
  >({ kind: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [endTarget, setEndTarget] = useState<Promotion | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: PromotionActor = useMemo(
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

  const filtered = useMemo<RenderedItem[]>(() => {
    const now = Date.now();
    const q = debouncedSearch.trim().toLowerCase();

    const generalItems: RenderedItem[] = promotions
      .filter((p) => {
        if (q) {
          const hay = (p.name + " " + p.description).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        const status = promotionStatus(p, now);
        if (filters.status && status !== filters.status) return false;
        if (filters.audience && p.audience !== filters.audience) return false;
        if (filters.mechanic && p.mechanic.kind !== filters.mechanic) {
          return false;
        }
        if (filters.view === "active" && status !== "active") return false;
        if (filters.view === "scheduled" && status !== "scheduled") {
          return false;
        }
        if (filters.view === "expiring") {
          if (status !== "active") return false;
          if (!isExpiringSoon(p.endDate, now)) return false;
        }
        return true;
      })
      .map((p) => ({
        source: "general" as const,
        promotion: p,
        status: promotionStatus(p, now),
      }));

    const includeResellerByAudience =
      !filters.audience || filters.audience === "reseller";
    const includeResellerByMechanic = !filters.mechanic;

    const resellerItems: RenderedItem[] =
      includeResellerByAudience && includeResellerByMechanic
        ? resellerBoosts
            .filter((p) => {
              if (q) {
                const hay = (p.name + " " + p.description).toLowerCase();
                if (!hay.includes(q)) return false;
              }
              const status = resellerPromotionStatus(p, now);
              if (filters.status && status !== filters.status) return false;
              if (filters.view === "active" && status !== "active") {
                return false;
              }
              if (filters.view === "scheduled" && status !== "scheduled") {
                return false;
              }
              if (filters.view === "expiring") {
                if (status !== "active") return false;
                if (!isExpiringSoon(p.endDate, now)) return false;
              }
              return true;
            })
            .map((p) => ({
              source: "reseller" as const,
              promotion: p,
              status: resellerPromotionStatus(p, now),
            }))
        : [];

    const merged = [...generalItems, ...resellerItems];
    merged.sort((a, b) => {
      const wa = STATUS_WEIGHT[a.status];
      const wb = STATUS_WEIGHT[b.status];
      if (wa !== wb) return wa - wb;
      return (
        new Date(b.promotion.startDate).getTime() -
        new Date(a.promotion.startDate).getTime()
      );
    });
    return merged;
  }, [promotions, resellerBoosts, debouncedSearch, filters]);

  const activeFilter:
    | "all"
    | "active"
    | "scheduled"
    | "expiring" =
    filters.view === "active"
      ? "active"
      : filters.view === "scheduled"
      ? "scheduled"
      : filters.view === "expiring"
      ? "expiring"
      : "all";

  const headerMeta = (
    <>
      <span>
        {summary.total} promotion{summary.total === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.active} active</span>
      {summary.scheduled > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>{summary.scheduled} scheduled</span>
        </>
      )}
      {summary.expiringSoon > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-warning-700 dark:text-warning-300">
            {summary.expiringSoon} expiring soon
          </span>
        </>
      )}
    </>
  );

  const handleCreate = (input: PromotionInput) => {
    const result = createPromotion(input, actor);
    if (result.ok && result.promotion) {
      showToast("success", result.promotion.name + " created.");
    } else {
      showToast("error", result.error ?? "Could not create promotion.");
    }
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  };

  const handleEdit = (input: PromotionInput) => {
    if (editorState.kind !== "edit") {
      return { ok: false, error: "No target." };
    }
    const result = updatePromotion(editorState.promotion.id, input, actor);
    if (result.ok && result.promotion) {
      showToast("success", result.promotion.name + " updated.");
    } else {
      showToast("error", result.error ?? "Could not update promotion.");
    }
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  };

  const handleEnd = (reason: string) => {
    if (!endTarget) return;
    const result = endPromotion(endTarget.id, reason, actor);
    if (result.ok) {
      showToast("success", endTarget.name + " ended.");
    } else {
      showToast("error", result.error ?? "Could not end promotion.");
    }
    setEndTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = deletePromotion(deleteTarget.id, actor);
    if (result.ok) {
      showToast("success", deleteTarget.name + " deleted.");
    } else {
      showToast("error", result.error ?? "Could not delete promotion.");
    }
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const generalOnly = filtered
      .filter(
        (item): item is RenderedItem & { source: "general" } =>
          item.source === "general"
      )
      .map((item) => item.promotion);
    const csv = promotionsToCsv(generalOnly);
    downloadCsv(
      "atlas-promotions-" + new Date().toISOString().slice(0, 10) + ".csv",
      csv
    );
  };

  const openPromotionsCount = resellerBoosts.length + promotions.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Promotions"
        description="Cross-audience campaigns for customers, resellers, and merchants. Reseller commission boosts are managed on their own page and rendered here read-only."
        meta={headerMeta}
        actions={
          <Can permission={PERMISSIONS.PROMOTIONS_MANAGE}>
            <Button
              size="sm"
              onClick={() => setEditorState({ kind: "create" })}
            >
              New promotion
            </Button>
          </Can>
        }
      />

      <PromotionSummaryCards
        summary={summary}
        loading={loading}
        activeFilter={activeFilter}
        onFilterAll={() =>
          setFilters({ view: "all", status: "", audience: "", mechanic: "" })
        }
        onFilterActive={() =>
          setFilters({
            view: filters.view === "active" ? "all" : "active",
          })
        }
        onFilterScheduled={() =>
          setFilters({
            view: filters.view === "scheduled" ? "all" : "scheduled",
          })
        }
        onFilterExpiring={() =>
          setFilters({
            view: filters.view === "expiring" ? "all" : "expiring",
          })
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            aria-label="Search promotions"
            placeholder="Search by name or description"
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
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
          <option value="ended">Ended</option>
        </select>

        <select
          aria-label="Filter by audience"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.audience}
          onChange={(e) => setFilters({ audience: e.target.value })}
        >
          <option value="">All audiences</option>
          <option value="customer">
            {PROMOTION_AUDIENCE_LABEL.customer}
          </option>
          <option value="reseller">
            {PROMOTION_AUDIENCE_LABEL.reseller}
          </option>
          <option value="merchant">
            {PROMOTION_AUDIENCE_LABEL.merchant}
          </option>
        </select>

        <select
          aria-label="Filter by mechanic"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.mechanic}
          onChange={(e) => setFilters({ mechanic: e.target.value })}
        >
          <option value="">All mechanics</option>
          {ALL_MECHANIC_KINDS.map((k) => (
            <option key={k} value={k}>
              {MECHANIC_KIND_LABEL[k]}
            </option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={handleExport}>
          Export CSV
        </Button>

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
        Showing {filtered.length} of {openPromotionsCount} promotion
        {openPromotionsCount === 1 ? "" : "s"}
        {hasActive ? " (filtered)" : ""}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : openPromotionsCount === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No promotions yet"
            description="Create your first cross-audience promotion to get started."
            action={
              <Can permission={PERMISSIONS.PROMOTIONS_MANAGE}>
                <Button
                  size="sm"
                  onClick={() => setEditorState({ kind: "create" })}
                >
                  New promotion
                </Button>
              </Can>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_results"
            title="No promotions match these filters"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((item) => (
            <li key={item.source + "-" + item.promotion.id}>
              {item.source === "general" ? (
                <PromotionCard
                  item={{ source: "general", promotion: item.promotion }}
                  onEdit={() =>
                    setEditorState({ kind: "edit", promotion: item.promotion })
                  }
                  onEnd={() => setEndTarget(item.promotion)}
                  onDelete={() => setDeleteTarget(item.promotion)}
                />
              ) : (
                <PromotionCard
                  item={{ source: "reseller", promotion: item.promotion }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <PromotionEditorModal
        open={editorState.kind !== "closed"}
        mode={editorState.kind === "edit" ? "edit" : "create"}
        current={editorState.kind === "edit" ? editorState.promotion : null}
        tiers={tiers}
        onClose={() => setEditorState({ kind: "closed" })}
        onSubmit={editorState.kind === "edit" ? handleEdit : handleCreate}
      />

      <PromotionEndModal
        open={endTarget !== null}
        promotion={endTarget}
        onClose={() => setEndTarget(null)}
        onConfirm={handleEnd}
      />

      <PromotionDeleteModal
        open={deleteTarget !== null}
        promotion={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
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