/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Provider,
  ProviderTransaction,
} from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { TRANSACTIONS_PAGE_SIZE } from "@/lib/admin/providers/constants";
import { providerTransactionsToCsv } from "@/lib/admin/providers/csv-export";

interface ProviderTransactionsProps {
  provider: Provider;
  transactions: ProviderTransaction[];
}

export function ProviderTransactions({
  provider,
  transactions,
}: ProviderTransactionsProps) {
  const now = useNow();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [provider.id, transactions.length]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) set.add(t.providerStatus);
    return Array.from(set).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (q) {
        const hay = `${tx.atlasTransactionId} ${tx.service} ${tx.customer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (
        statusFilter &&
        tx.providerStatus.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / TRANSACTIONS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * TRANSACTIONS_PAGE_SIZE,
    safePage * TRANSACTIONS_PAGE_SIZE
  );

  const handleExport = () => {
    const csv = providerTransactionsToCsv(provider, filtered);
    downloadCsv(
      `atlas-provider-${provider.id}-transactions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      csv
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Provider transactions</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
          </span>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            aria-label="Search transactions"
            placeholder="Search ID, service, or customer"
            className="max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            aria-label="Filter by provider status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {paginated.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {filtered.length === 0 && transactions.length > 0
              ? "No transactions match your filters."
              : "No transactions recorded."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Provider transactions for {provider.name}
                </caption>
                <thead>
                  <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                    <th scope="col" className="py-2 pr-2">
                      <span className="sr-only">Expand</span>
                    </th>
                    <th scope="col" className="py-2">
                      Time
                    </th>
                    <th scope="col" className="py-2">
                      Transaction
                    </th>
                    <th scope="col" className="py-2">
                      Service
                    </th>
                    <th scope="col" className="py-2">
                      Amount
                    </th>
                    <th scope="col" className="py-2">
                      Provider
                    </th>
                    <th scope="col" className="py-2">
                      Atlas
                    </th>
                    <th scope="col" className="py-2">
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => {
                    const expanded = expandedId === tx.id;
                    return (
                      <FragmentRow
                        key={tx.id}
                        tx={tx}
                        expanded={expanded}
                        now={now}
                        onToggle={() =>
                          setExpandedId(expanded ? null : tx.id)
                        }
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Transactions pagination"
                className="flex items-center justify-between"
              >
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Page {safePage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FragmentRow({
  tx,
  expanded,
  now,
  onToggle,
}: {
  tx: ProviderTransaction;
  expanded: boolean;
  now: Date | null;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
        <td className="py-2 pr-2">
          <button
            type="button"
            aria-label={expanded ? "Collapse details" : "Expand details"}
            aria-expanded={expanded}
            onClick={onToggle}
            className="rounded-sm p-0.5 text-neutral-400 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-neutral-200"
          >
            <AtlasIcon
              name="chevron-down"
              aria-hidden="true"
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
        </td>
        <td
          className="py-2 text-neutral-600 dark:text-neutral-300"
          title={formatDateTime(tx.createdAt)}
        >
          {formatRelative(tx.createdAt, now)}
        </td>
        <td className="py-2 font-mono text-xs">{tx.atlasTransactionId}</td>
        <td className="py-2">{tx.service}</td>
        <td className="py-2">{formatCurrency(tx.amount)}</td>
        <td className="py-2">
          <Badge variant={statusVariant(tx.providerStatus)} size="sm">
            {tx.providerStatus}
          </Badge>
        </td>
        <td className="py-2">
          <Badge variant={atlasVariant(tx.atlasStatus)} size="sm">
            {tx.atlasStatus}
          </Badge>
        </td>
        <td
          className={cn(
            "py-2",
            tx.responseTime === 0
              ? "text-neutral-500 dark:text-neutral-400"
              : tx.responseTime < 800
              ? "text-success-600"
              : tx.responseTime < 3000
              ? "text-warning-600"
              : "text-danger-600"
          )}
        >
          {tx.responseTime === 0 ? "—" : `${tx.responseTime}ms`}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-neutral-50 dark:bg-neutral-900/50">
          <td colSpan={8} className="px-3 py-3 text-xs">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                  Provider response
                </p>
                {tx.providerResponse ? (
                  <ul className="mt-1 space-y-0.5 text-neutral-600 dark:text-neutral-400">
                    <li>HTTP {tx.providerResponse.httpStatus}</li>
                    <li>Code: {tx.providerResponse.providerCode}</li>
                    <li>Message: {tx.providerResponse.message}</li>
                  </ul>
                ) : (
                  <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    No response captured.
                  </p>
                )}
              </div>
              <div>
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                  Customer
                </p>
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                  {tx.customer}
                </p>
                {tx.providerTransactionId && (
                  <p className="mt-1 font-mono text-neutral-500 dark:text-neutral-400">
                    Provider ID: {tx.providerTransactionId}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function statusVariant(status: string): "success" | "warning" | "danger" | "info" {
  const s = status.toLowerCase();
  if (s.includes("success")) return "success";
  if (s.includes("timeout") || s.includes("pending")) return "warning";
  if (s.includes("fail") || s.includes("error")) return "danger";
  return "info";
}

function atlasVariant(status: string): "success" | "warning" | "danger" | "info" {
  const s = status.toLowerCase();
  if (s.includes("success") || s.includes("complete")) return "success";
  if (s.includes("pending")) return "warning";
  if (s.includes("fail") || s.includes("cancel")) return "danger";
  return "info";
}