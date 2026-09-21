"use client";

import { useMemo } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import type { PaymentsLedgerRow } from "@/lib/admin/payments/payments-projection";

interface Props {
  rows: PaymentsLedgerRow[];
  pageSize: number;
  currentPage: number;
  totalRows: number;
  nowMs: number | null;
  onView: (row: PaymentsLedgerRow) => void;
  onPageChange: (page: number) => void;
}

export function PaymentsLedgerTable({
  rows,
  pageSize,
  currentPage,
  totalRows,
  nowMs,
  onView,
  onPageChange,
}: Props) {
  const columns = useMemo<Column<PaymentsLedgerRow>[]>(
    () => [
      {
        key: "id",
        header: "Payment",
        cell: (r) => (
          <div className="min-w-0">
            <div className="truncate font-mono text-xs">{r.id}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {r.reference}
            </div>
          </div>
        ),
      },
      {
        key: "user",
        header: "User",
        cell: (r) => (
          <div className="min-w-0">
            <div className="truncate text-sm">{r.user.name}</div>
            <div className="truncate text-xs capitalize text-neutral-500 dark:text-neutral-400">
              {r.user.type}
            </div>
          </div>
        ),
      },
      {
        key: "source",
        header: "Source",
        cell: (r) => <Badge variant={r.sourceVariant}>{r.sourceLabel}</Badge>,
      },
      {
        key: "method",
        header: "Method",
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs">{r.methodLabel}</span>
            {r.provider && (
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {r.provider}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (r) => (
          <span className="font-medium">{formatCurrency(r.amount)}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <div className="flex flex-col gap-1">
            <Badge variant={r.statusVariant}>{r.statusLabel}</Badge>
            {r.refundLabel && r.refundVariant && (
              <Badge variant={r.refundVariant} size="sm">
                {r.refundLabel}
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "wallet",
        header: "Wallet credit",
        cell: (r) =>
          r.walletCreditLabel && r.walletCreditVariant ? (
            <Badge variant={r.walletCreditVariant} size="sm">
              {r.walletCreditLabel}
            </Badge>
          ) : (
            <span className="text-xs text-neutral-400">Not applicable</span>
          ),
      },
      {
        key: "flags",
        header: "Flags",
        cell: (r) => (
          <div className="flex items-center gap-1">
            {r.flagCount > 0 && (
              <Badge variant="warning" size="sm">
                {r.flagCount} open
              </Badge>
            )}
            {r.reconciliationCount > 0 && (
              <Badge variant="info" size="sm">
                Reconciled
              </Badge>
            )}
            {r.flagCount === 0 && r.reconciliationCount === 0 && (
              <span className="text-xs text-neutral-400">Clean</span>
            )}
          </div>
        ),
      },
      {
        key: "created",
        header: "Created",
        cell: (r) => (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {nowMs ? formatRelative(r.createdAt, nowMs) : "Loading"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (r) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(r);
            }}
            aria-label={"View " + r.id}
          >
            View
          </Button>
        ),
      },
    ],
    [nowMs, onView]
  );

  return (
    <AdminDataTable
      columns={columns}
      data={rows}
      isLoading={false}
      rowKey={(r) => r.id}
      onRowClick={(r) => onView(r)}
      rowAriaLabel={(r) => "Open payment " + r.id}
      emptyMessage="No payments match these filters."
      caption="Payments ledger"
      pageSize={pageSize}
      currentPage={currentPage}
      totalCount={totalRows}
      onPageChange={onPageChange}
    />
  );
}