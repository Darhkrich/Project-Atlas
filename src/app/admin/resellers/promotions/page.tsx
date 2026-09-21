/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useResellerPromotions } from "@/lib/admin/hooks/use-reseller-promotions";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { promotionsToCsv } from "@/lib/admin/resellers/promotion-csv-export";
import {
  filterPromotions,
  promotionStatus,
} from "@/lib/admin/resellers/promotion-projection";
import {
  createPromotion,
  updatePromotion,
  endPromotion,
  deletePromotion,
  type PromotionActor,
  type PromotionInput,
} from "@/lib/admin/mock/reseller-promotion-store";
import { PromotionSummaryCards } from "@/components/admin/resellers/promotion-summary-cards";
import { PromotionCard } from "@/components/admin/resellers/promotion-card";
import { PromotionEditorModal } from "@/components/admin/resellers/promotion-editor-modal";
import { PromotionDeleteModal } from "@/components/admin/resellers/promotion-delete-modal";
import { PromotionEndModal } from "@/components/admin/resellers/promotion-end-modal";
import { PROMOTION_SCOPE_LABEL } from "@/lib/admin/resellers/promotion-labels";

interface PromotionFilters {
  q: string;
  status: string;
  scope: string;
  view: string;
}

const DEFAULT_FILTERS: PromotionFilters = {
  q: "",
  status: "",
  scope: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function ResellerPromotionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResellerPromotionsPageInner />
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

function ResellerPromotionsPageInner() {
  const admin = useCurrentAdmin();
  const { promotions, summary, tiers, resellers, loading } =
    useResellerPromotions();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<PromotionFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [editorState, setEditorState] = useState<
    | { kind: "closed" }
    | { kind: "create" }
    | { kind: "edit"; promotion: ResellerPromotion }
  >({ kind: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<ResellerPromotion | null>(
    null
  );
  const [endTarget, setEndTarget] = useState<ResellerPromotion | null>(null);
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

  const filtered = useMemo(() => {
    const now = Date.now();
    return filterPromotions(
      promotions,
      { ...filters, q: debouncedSearch },
      now
    );
  }, [promotions, debouncedSearch, filters]);

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
    if (editorState.kind !== "edit") return { ok: false, error: "No target." };
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
    const csv = promotionsToCsv(filtered);
    downloadCsv(
      "atlas-reseller-promotions-" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
      csv
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller promotions"
        description="Commission boosts applied to resellers for a defined window."
        meta={headerMeta}
        actions={
          <Can permission={PERMISSIONS.RESELLERS_PROMOTIONS_MANAGE}>
            <Button
              size="sm"
              onClick={() => setEditorState({ kind: "create" })}
            >
              New commission boost
            </Button>
          </Can>
        }
      />

      <PromotionSummaryCards
        summary={summary}
        loading={loading}
        activeFilter={activeFilter}
        onFilterAll={() =>
          setFilters({ view: "all", status: "", scope: "" })
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
          aria-label="Filter by scope"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.scope}
          onChange={(e) => setFilters({ scope: e.target.value })}
        >
          <option value="">All scopes</option>
          <option value="all">{PROMOTION_SCOPE_LABEL.all}</option>
          <option value="tier">{PROMOTION_SCOPE_LABEL.tier}</option>
          <option value="resellers">
            {PROMOTION_SCOPE_LABEL.resellers}
          </option>
          <option value="service">{PROMOTION_SCOPE_LABEL.service}</option>
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No promotions yet"
            description="Create your first commission boost to increase what resellers earn."
            action={
              <Can permission={PERMISSIONS.RESELLERS_PROMOTIONS_MANAGE}>
                <Button
                  size="sm"
                  onClick={() => setEditorState({ kind: "create" })}
                >
                  New commission boost
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
          {filtered.map((promo) => (
            <li key={promo.id}>
              <PromotionCard
                promotion={promo}
                tiers={tiers}
                resellers={resellers}
                onEdit={() =>
                  setEditorState({ kind: "edit", promotion: promo })
                }
                onEnd={() => setEndTarget(promo)}
                onDelete={() => setDeleteTarget(promo)}
              />
            </li>
          ))}
        </ul>
      )}

      <PromotionEditorModal
        open={editorState.kind !== "closed"}
        mode={editorState.kind === "edit" ? "edit" : "create"}
        current={editorState.kind === "edit" ? editorState.promotion : null}
        allPromotions={promotions}
        tiers={tiers}
        resellers={resellers}
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