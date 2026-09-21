/* eslint-disable react-hooks/purity */
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";


import { TransactionsSummaryCards } from "@/components/admin/transactions/transaction-summary-cards";
import { TransactionsFilters } from "@/components/admin/transactions/transactions-filters";
import { TransactionsTable } from "@/components/admin/transactions/transactions-table";
import { TransactionsEmptyState } from "@/components/admin/transactions/transactions-empty-state";
import { TransactionDetailDrawer } from "@/components/admin/transactions/transactions-detail-drawer";


import { Button } from "@/components/admin/ui/button";
import { ErrorState } from "@/components/admin/ui/error-state";
import { Can } from "@/lib/admin/rbac/can";
import { useCan } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useTransactions } from "@/lib/admin/hooks/use-transactions";
import {
  filterTransactions,
  projectTransactionSummary,
} from "@/lib/admin/transactions/transactions-projection";
import { exportTransactionsCsv } from "@/lib/admin/transactions/transactions-csv-export";
import type { TransactionLedgerFilters } from "@/lib/admin/types/transaction";
import {
  DEFAULT_TRANSACTIONS_PAGE_SIZE,
  TRANSACTIONS_KIND_FILTER_ORDER,
  TRANSACTIONS_STATUS_FILTER_ORDER,
} from "@/lib/admin/transactions/transactions-constants";
import type {
  TransactionAudience,
  TransactionSourceKind,
  TransactionStatus,
} from "@/lib/admin/types/transaction";

function parseFilters(params: URLSearchParams): TransactionLedgerFilters {
  const filters: TransactionLedgerFilters = {};
  const search = params.get("q");
  if (search) filters.search = search;
  const kind = params.get("kind");
  if (kind && (TRANSACTIONS_KIND_FILTER_ORDER as string[]).includes(kind)) {
    filters.kind = kind as TransactionSourceKind;
  }
  const audience = params.get("audience");
  if (audience) filters.audience = audience as TransactionAudience;
  const status = params.get("status");
  if (status && (TRANSACTIONS_STATUS_FILTER_ORDER as string[]).includes(status)) {
    filters.status = status as TransactionStatus;
  }
  const method = params.get("method");
  if (method) filters.paymentMethodId = method as TransactionLedgerFilters["paymentMethodId"];
  const from = params.get("from");
  if (from) filters.dateFrom = from;
  const to = params.get("to");
  if (to) filters.dateTo = to;
  return filters;
}

function filtersToParams(filters: TransactionLedgerFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentMethodId) params.set("method", filters.paymentMethodId);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  return params;
}

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = useNow();
  const canView = useCan(PERMISSIONS.TRANSACTIONS_VIEW);
  const { transactions, isLoading, error } = useTransactions();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [searchParams]);
  const selectedTransactionId = searchParams.get("txn");

  const selectedTransaction = useMemo(
    () =>
      selectedTransactionId
        ? transactions.find((t) => t.id === selectedTransactionId) ?? null
        : null,
    [transactions, selectedTransactionId]
  );

  const filteredRows = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters]
  );

  const summary = useMemo(
    () => projectTransactionSummary(transactions, now ?? Date.now()),
    [transactions, now]
  );

  const pageSize = DEFAULT_TRANSACTIONS_PAGE_SIZE;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const hasFilters = Object.keys(filters).length > 0;

  const handleFiltersChange = useCallback(
    (next: TransactionLedgerFilters) => {
      const params = filtersToParams(next);
      router.replace("/admin/transactions?" + params.toString());
    },
    [router]
  );

  const handleFiltersReset = useCallback(() => {
    router.replace("/admin/transactions");
  }, [router]);

  const handlePageChange = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams.toString());
      if (page <= 1) next.delete("page");
      else next.set("page", String(page));
      router.replace("/admin/transactions?" + next.toString());
    },
    [router, searchParams]
  );

  const handleRowClick = useCallback(
    (transactionId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("txn", transactionId);
      router.replace("/admin/transactions?" + next.toString());
    },
    [router, searchParams]
  );

  const handleCloseDrawer = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("txn");
    router.replace("/admin/transactions?" + next.toString());
  }, [router, searchParams]);

  const handleExport = useCallback(() => {
    exportTransactionsCsv(filteredRows);
  }, [filteredRows]);

  if (!canView) {
    return (
      <ErrorState
        title="You do not have access to transactions"
        description="Ask an administrator to grant you the transactions:view permission."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transactions"
        description="Read-only ledger of every Atlas wallet movement across direct, reseller, and storefront user audiences. Orders, payments, and gateway state live on their own pages."
        meta={
          <>
            <span>{transactions.length} total</span>
            <span className="text-neutral-400">·</span>
            <span>{filteredRows.length} after filters</span>
          </>
        }
        actions={
          <Can permission={PERMISSIONS.TRANSACTIONS_EXPORT}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredRows.length === 0}
            >
              Export CSV
            </Button>
          </Can>
        }
      />

      {error ? (
        <ErrorState title="Could not load transactions" description={error.message} />
      ) : (
        <>
          <TransactionsSummaryCards summary={summary} />

          <TransactionsFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />

          {filteredRows.length === 0 && !isLoading ? (
            <TransactionsEmptyState hasFilters={hasFilters} />
          ) : (
            <TransactionsTable
              rows={paginatedRows}
              isLoading={isLoading}
              page={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onRowClick={handleRowClick}
            />
          )}
        </>
      )}

      <TransactionDetailDrawer
        transaction={selectedTransaction}
        now={now}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}