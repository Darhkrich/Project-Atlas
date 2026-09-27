"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ErrorState } from "@/components/admin/ui/error-state";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import { Can, useCan } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { WalletSummaryCards } from "@/components/admin/wallets/wallet-summary-cards";
import { WalletDetailDrawer } from "@/components/admin/wallets/wallet-detail-drawer";
import { useWalletRegistry } from "@/lib/admin/hooks/use-wallet-registry";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  REGISTRY_PAGE_SIZE,
  REGISTRY_PAGE_SIZE_OPTIONS,
  REGISTRY_POOLS,
} from "@/lib/admin/wallets/registry-constants";
import {
  REGISTRY_POOL_LABELS,
  REGISTRY_POOL_VARIANTS,
  WALLET_STATUS_LABELS,
  WALLET_STATUS_VARIANTS,
} from "@/lib/admin/wallets/registry-labels";
import type {
  RegistryRow,
  WalletPoolType,
} from "@/lib/admin/wallets/registry-types";
import type { RegistryFilterValues } from "@/lib/admin/wallets/registry-projection";

interface WalletRegistryFilters extends RegistryFilterValues {
  page: string;
  pageSize: string;
}

const DEFAULT_FILTERS: WalletRegistryFilters = {
  search: "",
  pool: "",
  status: "",
  page: "1",
  pageSize: String(REGISTRY_PAGE_SIZE),
};

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function WalletsPage() {
  const canView = useCan(PERMISSIONS.WALLETS_VIEW);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<WalletRegistryFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { rows, summary, loading, error, nowMs } = useWalletRegistry({
    search: debouncedSearch,
    pool: filters.pool as WalletPoolType | "",
    status: filters.status as "active" | "frozen" | "",
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId]
  );

  const pageSize = Math.max(
    5,
    Number(filters.pageSize) || REGISTRY_PAGE_SIZE
  );
  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );

  const onSelectPool = useCallback(
    (pool: WalletPoolType | "") => {
      setFilters({ pool, page: "1" });
    },
    [setFilters]
  );

  const handleExport = useCallback(() => {
    const header = [
      "walletId",
      "pool",
      "ownerId",
      "ownerName",
      "balance",
      "status",
      "lastActivityAt",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          escapeCsv(r.id),
          escapeCsv(r.pool),
          escapeCsv(r.ownerId),
          escapeCsv(r.ownerName),
          escapeCsv(r.balance),
          escapeCsv(r.status),
          escapeCsv(r.lastActivityAt ?? ""),
        ].join(",")
      );
    }
    downloadCsv(
      "atlas-wallets-" + new Date().toISOString().slice(0, 10) + ".csv",
      lines.join("\r\n")
    );
  }, [rows]);

  const columns: Column<RegistryRow>[] = useMemo(
    () => [
      {
        key: "owner",
        header: "Owner",
        cell: (r) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
              {r.ownerName}
            </p>
            <p className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {r.ownerId}
            </p>
          </div>
        ),
      },
      {
        key: "pool",
        header: "Pool",
        cell: (r) => (
          <Badge variant={REGISTRY_POOL_VARIANTS[r.pool]}>
            {REGISTRY_POOL_LABELS[r.pool]}
          </Badge>
        ),
      },
      {
        key: "walletId",
        header: "Wallet",
        cell: (r) => (
          <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
            {r.id}
          </span>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        align: "right",
        cell: (r) => (
          <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {formatCurrency(r.balance)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <Badge variant={WALLET_STATUS_VARIANTS[r.status]}>
            {WALLET_STATUS_LABELS[r.status]}
          </Badge>
        ),
      },
      {
        key: "lastActivity",
        header: "Last activity",
        align: "right",
        cell: (r) =>
          r.lastActivityAt ? (
            <span
              title={formatAbsolute(r.lastActivityAt)}
              className="text-xs text-neutral-600 dark:text-neutral-400"
            >
              {nowMs ? formatRelative(r.lastActivityAt, nowMs) : "—"}
            </span>
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              No activity
            </span>
          ),
      },
    ],
    [nowMs]
  );

  if (!canView) {
    return (
      <ErrorState
        title="You do not have access to wallets"
        description="Ask an administrator to grant you the wallets:view permission."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Wallets"
        description="Liabilities registry. Who Atlas holds money on behalf of, across every pool. Read-only."
        meta={
          <>
            <span>{formatNumber(summary.totalWallets)} wallets</span>
            <span aria-hidden="true">·</span>
            <span>{formatCurrency(summary.totalBalance)} liabilities</span>
            {summary.totalFrozen > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-danger-700 dark:text-danger-300">
                  {summary.totalFrozen} frozen
                </span>
              </>
            )}
          </>
        }
        actions={
          <Can permission={PERMISSIONS.EXPORT}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={rows.length === 0}
            >
              Export CSV
            </Button>
          </Can>
        }
      />

      {error ? (
        <ErrorState
          title="Could not load wallets"
          description={error.message}
        />
      ) : (
        <>
          <WalletSummaryCards
            summary={summary}
            activePool={filters.pool as WalletPoolType | ""}
            onSelectPool={onSelectPool}
          />

          <div
            role="region"
            aria-label="Wallet filters"
            className="flex flex-wrap items-end gap-2"
          >
            <div className="min-w-56 flex-1">
              <label
                htmlFor="wallet-search"
                className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                Search
              </label>
              <input
                id="wallet-search"
                ref={searchInputRef}
                aria-label="Search wallets"
                placeholder="Owner name, wallet id, owner id"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ search: e.target.value, page: "1" })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label
                htmlFor="wallet-pool"
                className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                Pool
              </label>
              <select
                id="wallet-pool"
                aria-label="Filter by pool"
                value={filters.pool}
                onChange={(e) =>
                  setFilters({
                    pool: e.target.value as WalletPoolType | "",
                    page: "1",
                  })
                }
                className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">All pools</option>
                {REGISTRY_POOLS.map((p) => (
                  <option key={p} value={p}>
                    {REGISTRY_POOL_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="wallet-status"
                className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                Status
              </label>
              <select
                id="wallet-status"
                aria-label="Filter by status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    status: e.target.value as "active" | "frozen" | "",
                    page: "1",
                  })
                }
                className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="wallet-page-size"
                className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                Rows
              </label>
              <select
                id="wallet-page-size"
                aria-label="Rows per page"
                value={filters.pageSize}
                onChange={(e) =>
                  setFilters({ pageSize: e.target.value, page: "1" })
                }
                className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {REGISTRY_PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {hasActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          {loading ? (
            <div
              aria-busy="true"
              aria-label="Loading wallets"
              className="space-y-2"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {hasActive ? (
                <EmptyState
                  variant="no_results"
                  title="No wallets match these filters"
                  description="Try a different search or clear the filters."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  variant="no_data"
                  title="No wallets yet"
                  description="Wallets appear here as users fund and transact."
                />
              )}
            </div>
          ) : (
            <AdminDataTable
              columns={columns}
              data={paginated}
              isLoading={false}
              rowKey={(r) => r.id}
              onRowClick={(r) => setSelectedId(r.id)}
              emptyMessage="No wallets found."
              caption="Wallets"
              pageSize={pageSize}
              currentPage={safePage}
              totalCount={rows.length}
              onPageChange={(p) => setFilters({ page: String(p) })}
            />
          )}
        </>
      )}

      <WalletDetailDrawer
        wallet={selected}
        nowMs={nowMs}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}