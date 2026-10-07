/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { AtlasCard } from "@/components/atlas/card";
import { useMerchantTransactions } from "@/lib/merchant/transactions/use-merchant-transactions";
import { useTransactionFilters } from "@/lib/merchant/transactions/use-transaction-filters";
import {
  filterTransactions,
  projectTotals,
  projectPendingTotal,
} from "@/lib/merchant/transactions/projection";
import { TRANSACTIONS_PAGE_SIZE } from "@/lib/merchant/transactions/constants";
import { TransactionsSummaryStrip } from "./transactions-summary-strip";
import { TransactionsToolbar } from "./transactions-toolbar";
import { TransactionsFilterStrip } from "./transactions-filter-strip";
import { TransactionRow } from "./transaction-row";
import { TransactionCard } from "./transaction-card";
import { TransactionDetailModal } from "./transaction-detail-modal";
import { TransactionsEmptyState } from "./transactions-empty-state";
import { TransactionsPagination } from "./transactions-pagination";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import type { MerchantTransaction } from "@/lib/merchant/transactions/types";

export function MerchantTransactionsOverview() {
  const nowMs = useNow();
  const { transactions, loading, error } = useMerchantTransactions();
  const {
    filters,
    page,
    setKind,
    setWallet,
    setRange,
    setSearch,
    setPage,
    reset,
  } = useTransactionFilters();

  const [detail, setDetail] = useState<MerchantTransaction | null>(null);

  const effectiveNow = nowMs ?? Date.now();

  const filtered = useMemo(
    () => filterTransactions(transactions, filters, effectiveNow),
    [transactions, filters, effectiveNow]
  );

  const totals = useMemo(
    () => projectTotals(transactions, filters.range, effectiveNow),
    [transactions, filters.range, effectiveNow]
  );

  const pendingTotal = useMemo(
    () => projectPendingTotal(transactions),
    [transactions]
  );

  const totalsWithPending = useMemo(
    () => ({ ...totals, pending: pendingTotal }),
    [totals, pendingTotal]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / TRANSACTIONS_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * TRANSACTIONS_PAGE_SIZE;
  const visible = filtered.slice(start, start + TRANSACTIONS_PAGE_SIZE);

  const filtersActive =
    filters.kind !== "all" ||
    filters.wallet !== "all" ||
    filters.search.trim() !== "" ||
    filters.range !== "30d";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <AtlasSkeleton className="h-12 w-full rounded-lg" />
        <AtlasSkeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <AtlasErrorState
        title="Could not load transactions"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Finance
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Every cedi that moved through your business. Funding, sales, plan
          charges, refunds, and payouts in one place.
        </p>
      </div>

      <TransactionsSummaryStrip totals={totalsWithPending} />

      <div className="space-y-3">
        <TransactionsToolbar
          search={filters.search}
          range={filters.range}
          onSearch={setSearch}
          onRange={setRange}
        />
        <TransactionsFilterStrip
          wallet={filters.wallet}
          kind={filters.kind}
          onWallet={setWallet}
          onKind={setKind}
        />
      </div>

      {filtered.length === 0 ? (
        <TransactionsEmptyState
          variant={transactions.length === 0 ? "no_data" : "no_match"}
          onClear={filtersActive ? reset : undefined}
        />
      ) : (
        <>
          <AtlasCard padding="none" className="overflow-hidden">
            <div className="hidden lg:block">
              <table className="w-full">
                <caption className="sr-only">
                  Your transaction history
                </caption>
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      When
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Kind
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      row={tx}
                      nowMs={nowMs}
                      onOpen={setDetail}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul
              role="list"
              className="divide-y divide-neutral-100 lg:hidden dark:divide-neutral-800"
            >
              {visible.map((tx) => (
                <li key={tx.id}>
                  <TransactionCard
                    row={tx}
                    nowMs={nowMs}
                    onOpen={setDetail}
                  />
                </li>
              ))}
            </ul>

            <TransactionsPagination
              page={safePage}
              totalPages={totalPages}
              onPage={setPage}
            />
          </AtlasCard>

          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Showing {visible.length} of {filtered.length}{" "}
            {filtered.length === 1 ? "transaction" : "transactions"}
          </p>
        </>
      )}

      <TransactionDetailModal
        row={detail}
        nowMs={nowMs}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}