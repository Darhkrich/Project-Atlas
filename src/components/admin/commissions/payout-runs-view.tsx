"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import { formatCurrency } from "@/lib/shared/format";
import { formatAbsolute } from "@/lib/shared/format";
import type { PayoutRun } from "@/lib/admin/types/commission";
import type { PayoutSummary } from "@/lib/admin/commissions/commission-projection";
import {
  PAYOUT_RUN_STATUS_LABEL,
  PAYOUT_RUN_STATUS_VARIANT,
} from "@/lib/admin/commissions/commission-labels";

interface Props {
  payoutRuns: PayoutRun[];
  summary: PayoutSummary;
  loading: boolean;
}

function SummaryTile({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success-700 dark:text-success-300"
      : tone === "warning"
      ? "text-warning-700 dark:text-warning-300"
      : "text-danger-700 dark:text-danger-300";
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className={"mt-2 text-2xl font-semibold tabular-nums " + toneClass}>
        {count}
      </p>
    </Card>
  );
}

export function PayoutRunsView({ payoutRuns, summary, loading }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | PayoutRun["status"]>("");
  const [selected, setSelected] = useState<PayoutRun | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = payoutRuns;
    if (q) {
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.commissionIds.some((id) => id.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      list = list.filter((p) => p.status === statusFilter);
    }
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [payoutRuns, search, statusFilter]);

  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(safePage, totalPages);
  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe, pageSize]);

  const columns = useMemo<Column<PayoutRun>[]>(
    () => [
      {
        key: "id",
        header: "Payout ID",
        cell: (p) => <span className="font-mono text-xs">{p.id}</span>,
      },
      {
        key: "date",
        header: "Date",
        cell: (p) => formatAbsolute(p.date),
      },
      {
        key: "totalAmount",
        header: "Total Amount",
        cell: (p) => (
          <span className="font-semibold">{formatCurrency(p.totalAmount)}</span>
        ),
      },
      {
        key: "resellerCount",
        header: "Resellers",
        cell: (p) => p.resellerCount,
      },
      {
        key: "status",
        header: "Status",
        cell: (p) => (
          <div className="flex flex-col gap-0.5">
            <Badge variant={PAYOUT_RUN_STATUS_VARIANT[p.status]}>
              {PAYOUT_RUN_STATUS_LABEL[p.status]}
            </Badge>
            {p.status === "failed" && p.failureReason && (
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {p.failureReason.length > 60
                  ? p.failureReason.slice(0, 57) + "..."
                  : p.failureReason}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (p) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(p);
            }}
            aria-label={"View payout " + p.id}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div
        role="region"
        aria-label="Payout run summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <SummaryTile
          label="Completed payouts"
          count={summary.completed}
          tone="success"
        />
        <SummaryTile
          label="Pending payouts"
          count={summary.pending}
          tone="warning"
        />
        <SummaryTile
          label="Failed payouts"
          count={summary.failed}
          tone="danger"
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <label
            htmlFor="payout-search"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Search
          </label>
          <Input
            id="payout-search"
            aria-label="Search payout runs"
            placeholder="Payout ID or commission ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <label
            htmlFor="payout-status"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Status
          </label>
          <select
            id="payout-status"
            aria-label="Filter by payout status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PayoutRun["status"] | "");
              setPage(1);
            }}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading payout runs"
          className="space-y-2"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No payout runs yet"
            description="Payout runs appear here after settlements complete."
          />
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginated}
          isLoading={false}
          rowKey={(p) => p.id}
          onRowClick={(p) => setSelected(p)}
          rowAriaLabel={(p) => "Open payout " + p.id}
          emptyMessage="No payout runs found."
          caption="Payout runs"
          pageSize={pageSize}
          currentPage={pageSafe}
          totalCount={filtered.length}
          onPageChange={(p) => setPage(p)}
        />
      )}

      <ModalShell
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? "Payout " + selected.id : ""}
      >
        {selected && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-3 py-1.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Date
                </span>
                <span className="text-right text-sm text-neutral-900 dark:text-neutral-100">
                  {formatAbsolute(selected.date)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 py-1.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total amount
                </span>
                <span className="text-right text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(selected.totalAmount)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 py-1.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Resellers
                </span>
                <span className="text-right text-sm text-neutral-900 dark:text-neutral-100">
                  {selected.resellerCount}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 py-1.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Status
                </span>
                <Badge variant={PAYOUT_RUN_STATUS_VARIANT[selected.status]}>
                  {PAYOUT_RUN_STATUS_LABEL[selected.status]}
                </Badge>
              </div>
            </div>

            {selected.status === "failed" && selected.failureReason && (
              <div
                role="alert"
                className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
              >
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Failure reason
                </p>
                <p className="mt-1">{selected.failureReason}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Commission IDs
              </p>
              <ul role="list" className="space-y-1">
                {selected.commissionIds.map((id) => (
                  <li
                    key={id}
                    className="rounded-md bg-neutral-50 p-2 font-mono text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                  >
                    {id}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}