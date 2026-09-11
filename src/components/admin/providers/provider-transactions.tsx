/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { ProviderTransaction } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface Props {
  providerId: string;
  transactions: ProviderTransaction[];
}

const PAGE_SIZE = 8;

export function ProviderTransactions({ providerId, transactions }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (
        search &&
        !tx.atlasTransactionId.toLowerCase().includes(search.toLowerCase()) &&
        !tx.service.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (statusFilter && tx.providerStatus !== statusFilter) return false;
      return true;
    });
  }, [transactions, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const providerStatusVariant = (status: string) => {
    if (status.toLowerCase().includes("success")) return "success";
    if (status.toLowerCase().includes("timeout")) return "warning";
    if (status.toLowerCase().includes("fail")) return "danger";
    return "info";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Provider Transactions</CardTitle>
        <span className="text-xs text-neutral-500">
          {filtered.length} transactions
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search transaction or service..."
            className="max-w-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Successful">Successful</option>
            <option value="Timeout">Timeout</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {paginated.length === 0 ? (
          <p className="text-sm text-neutral-400">No transactions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500">
                    <th className="py-2">Transaction</th>
                    <th className="py-2">Service</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Provider Status</th>
                    <th className="py-2">Atlas Status</th>
                    <th className="py-2">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
                    >
                      <td className="py-2 font-mono text-xs">
                        {tx.atlasTransactionId}
                      </td>
                      <td className="py-2">{tx.service}</td>
                      <td className="py-2">{formatCurrency(tx.amount)}</td>
                      <td className="py-2">
                        <Badge variant={providerStatusVariant(tx.providerStatus)}>
                          {tx.providerStatus}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={
                            tx.atlasStatus === "Successful"
                              ? "success"
                              : tx.atlasStatus === "Pending"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {tx.atlasStatus}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "py-2",
                          tx.responseTime < 800
                            ? "text-success-600"
                            : "text-warning-600"
                        )}
                      >
                        {tx.responseTime}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}