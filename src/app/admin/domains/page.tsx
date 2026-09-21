"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useDomains } from "@/lib/admin/hooks/use-domains";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { domainsToCsv } from "@/lib/domains/csv-export";
import {
  filterDomains,
  type DomainFilters as DomainFilterValues,
} from "@/lib/domains/projection";
import {
  allSlugs,
  changeSubdomainSlug,
  forceFail,
  forceVerify,
  removeCustomDomain,
  setCustomDomainMethod,
  setPrimary,
  verifyDomain,
  type DomainActor,
} from "@/lib/domains/store";
import {
  DomainSummaryCards,
  type DomainSummaryFilter,
} from "@/components/admin/domains/domain-summary-cards";
import { DomainRow } from "@/components/admin/domains/domain-row";
import { DomainEditModal } from "@/components/admin/domains/domain-edit-modal";
import { DomainRemoveModal } from "@/components/admin/domains/domain-remove-modal";
import {
  DomainOverrideModal,
  type DomainOverrideMode,
} from "@/components/admin/domains/domain-override-modal";
import type { DomainRow as DomainRowType } from "@/lib/domains/projection";

interface UrlFilters extends DomainFilterValues {
  view: string;
}

const DEFAULT_FILTERS: UrlFilters = {
  q: "",
  type: "",
  status: "",
  primary: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

interface OverrideTarget {
  mode: DomainOverrideMode;
  row: DomainRowType;
}

export default function DomainsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DomainsPageInner />
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
      <div className="space-y-3">
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

function DomainsPageInner() {
  const admin = useCurrentAdmin();
  const { rows, summary, loading } = useDomains();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<UrlFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [editTarget, setEditTarget] = useState<DomainRowType | null>(null);
  const [removeTarget, setRemoveTarget] = useState<DomainRowType | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<OverrideTarget | null>(
    null
  );
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: DomainActor = useMemo(
    () =>
      admin
        ? { type: "admin", name: admin.name, email: admin.email }
        : { type: "admin", name: "System", email: "system@atlas.com" },
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
      filterDomains(rows, {
        q: debouncedSearch,
        type: filters.type,
        status: filters.status,
        primary: filters.primary,
      }),
    [rows, debouncedSearch, filters.type, filters.status, filters.primary]
  );

  const activeSummaryFilter: DomainSummaryFilter =
    filters.view === "subdomain-only"
      ? "subdomain-only"
      : filters.view === "custom-verified"
      ? "custom-verified"
      : filters.view === "custom-pending"
      ? "custom-pending"
      : "all";

  const syncEditTarget = (next: DomainRowType) => {
    setEditTarget(next);
  };

  const headerMeta = (
    <>
      <span>
        {summary.total} storefront{summary.total === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.customVerified} custom verified</span>
      {summary.customPending + summary.customFailed > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-warning-700 dark:text-warning-300">
            {summary.customPending + summary.customFailed} pending or failed
          </span>
        </>
      )}
    </>
  );

  /* --------------------------- Handlers ----------------------------- */

  const handleSaveSlug = (
    slug: string
  ): { ok: boolean; error?: string } => {
    if (!editTarget) return { ok: false, error: "No target." };
    const result = changeSubdomainSlug(
      editTarget.domain.storefrontId,
      slug,
      actor
    );
    if (result.ok && result.domain) {
      showToast(
        "success",
        "Subdomain updated to " +
          result.domain.subdomain.slug +
          "." +
          result.domain.subdomain.root +
          "."
      );
      syncEditTarget({ ...editTarget, domain: result.domain });
      return { ok: true };
    }
    showToast("error", result.error ?? "Could not update subdomain.");
    return { ok: false, error: result.error };
  };

  const handleRunDnsCheck = async () => {
    if (!editTarget) return;
    setVerifying(true);
    const result = await verifyDomain(editTarget.domain.storefrontId, actor);
    setVerifying(false);
    if (result.ok && result.domain) {
      syncEditTarget({ ...editTarget, domain: result.domain });
      const cd = result.domain.customDomain;
      if (cd?.verificationStatus === "verified") {
        showToast("success", cd.hostname + " verified.");
      } else if (cd?.verificationStatus === "failed") {
        showToast("error", cd.failureReason ?? "Verification failed.");
      }
    } else {
      showToast("error", result.error ?? "Could not run check.");
    }
  };

  const handleChangeMethod = (method: "cname" | "txt") => {
    if (!editTarget) return;
    const result = setCustomDomainMethod(
      editTarget.domain.storefrontId,
      method,
      actor
    );
    if (result.ok && result.domain) {
      syncEditTarget({ ...editTarget, domain: result.domain });
    }
  };

  const handleSetPrimary = (isPrimary: boolean) => {
    if (!editTarget) return;
    const result = setPrimary(
      editTarget.domain.storefrontId,
      isPrimary,
      actor
    );
    if (result.ok && result.domain) {
      syncEditTarget({ ...editTarget, domain: result.domain });
      showToast(
        "success",
        isPrimary
          ? "Custom domain set as primary."
          : "Subdomain set as primary."
      );
    } else {
      showToast("error", result.error ?? "Could not change primary.");
    }
  };

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    const result = removeCustomDomain(
      removeTarget.domain.storefrontId,
      actor
    );
    if (result.ok) {
      showToast("success", "Custom domain removed.");
      setEditTarget(null);
    } else {
      showToast("error", result.error ?? "Could not remove domain.");
    }
    setRemoveTarget(null);
  };

  const handleOverrideConfirm = (reason: string) => {
    if (!overrideTarget) return;
    const { mode, row } = overrideTarget;
    const result =
      mode === "force-verify"
        ? forceVerify(row.domain.storefrontId, reason, actor)
        : forceFail(row.domain.storefrontId, reason, actor);

    if (result.ok && result.domain) {
      if (
        editTarget &&
        editTarget.domain.storefrontId === row.domain.storefrontId
      ) {
        syncEditTarget({ ...editTarget, domain: result.domain });
      }
      showToast(
        "success",
        mode === "force-verify"
          ? "Domain force verified."
          : "Domain marked as failed."
      );
    } else {
      showToast("error", result.error ?? "Could not apply override.");
    }
    setOverrideTarget(null);
  };

  const handleExport = () => {
    const csv = domainsToCsv(filtered);
    downloadCsv(
      "atlas-domains-" + new Date().toISOString().slice(0, 10) + ".csv",
      csv
    );
  };

  /* --------------------------- Render ------------------------------- */

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Domains"
        description="Oversight of storefront subdomains and custom domains. Owners manage their own domains from their dashboard; use this page to review, override, or remove."
        meta={headerMeta}
        actions={<ExportMenu onExport={handleExport} formats={["csv"]} />}
      />

      <DomainSummaryCards
        summary={summary}
        activeFilter={activeSummaryFilter}
        loading={loading}
        onFilterAll={() =>
          setFilters({ view: "all", status: "", type: "", primary: "" })
        }
        onFilterSubdomainOnly={() =>
          setFilters({
            view:
              filters.view === "subdomain-only" ? "all" : "subdomain-only",
          })
        }
        onFilterCustomVerified={() =>
          setFilters({
            view:
              filters.view === "custom-verified"
                ? "all"
                : "custom-verified",
          })
        }
        onFilterCustomPending={() =>
          setFilters({
            view:
              filters.view === "custom-pending"
                ? "all"
                : "custom-pending",
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
            aria-label="Search domains"
            placeholder="Search by storefront, owner, slug, or hostname"
            className="pl-9"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </div>

        <select
          aria-label="Filter by storefront type"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value })}
        >
          <option value="">All types</option>
          <option value="reseller">Reseller</option>
          <option value="merchant">Merchant</option>
        </select>

        <select
          aria-label="Filter by domain status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="subdomain-only">Subdomain only</option>
          <option value="custom-verified">Custom verified</option>
          <option value="custom-pending">Custom pending</option>
          <option value="custom-failed">Custom failed</option>
        </select>

        <select
          aria-label="Filter by primary domain"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.primary}
          onChange={(e) => setFilters({ primary: e.target.value })}
        >
          <option value="">Any primary</option>
          <option value="subdomain">Subdomain primary</option>
          <option value="custom">Custom domain primary</option>
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
        Showing {filtered.length} of {rows.length} storefront
        {rows.length === 1 ? "" : "s"}
        {hasActive ? " (filtered)" : ""}
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No storefronts yet"
            description="Domains appear here once resellers or merchants have storefronts."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_results"
            title="No domains match these filters"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul role="list" className="space-y-3">
          {filtered.map((row) => (
            <li key={row.domain.storefrontId}>
              <DomainRow row={row} onEdit={() => setEditTarget(row)} />
            </li>
          ))}
        </ul>
      )}

      <DomainEditModal
        open={editTarget !== null}
        domain={editTarget?.domain ?? null}
        storefront={editTarget?.storefront ?? null}
        existingSlugs={allSlugs()}
        verifying={verifying}
        onClose={() => setEditTarget(null)}
        onSaveSlug={handleSaveSlug}
        onRunDnsCheck={handleRunDnsCheck}
        onChangeMethod={handleChangeMethod}
        onSetPrimary={handleSetPrimary}
        onRemoveCustomDomain={() => {
          if (editTarget?.domain.customDomain) {
            setRemoveTarget(editTarget);
          }
        }}
        onForceVerify={() => {
          if (editTarget) {
            setOverrideTarget({ mode: "force-verify", row: editTarget });
          }
        }}
        onForceFail={() => {
          if (editTarget) {
            setOverrideTarget({ mode: "force-fail", row: editTarget });
          }
        }}
      />

      <DomainRemoveModal
        open={removeTarget !== null}
        domain={removeTarget?.domain ?? null}
        storefrontName={removeTarget?.storefront.storeName ?? ""}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
      />

      <DomainOverrideModal
        open={overrideTarget !== null}
        mode={overrideTarget?.mode ?? "force-verify"}
        domain={overrideTarget?.row.domain ?? null}
        storefrontName={overrideTarget?.row.storefront.storeName ?? ""}
        onClose={() => setOverrideTarget(null)}
        onConfirm={handleOverrideConfirm}
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