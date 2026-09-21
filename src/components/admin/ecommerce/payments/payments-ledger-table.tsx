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
import type { LedgerRow } from "@/lib/admin/types/merchant-money";
import {
  LEDGER_COLUMN_LABEL,
  type LedgerColumnKey,
} from "@/lib/admin/ecommerce/payments/payments-constants";

interface Props {
  rows: LedgerRow[];
  visibleColumns: LedgerColumnKey[];
  pageSize: number;
  currentPage: number;
  totalRows: number;
  nowMs: number | null;
  onView: (row: LedgerRow) => void;
  onPageChange: (page: number) => void;
}

export function PaymentsLedgerTable({
  rows,
  visibleColumns,
  pageSize,
  currentPage,
  totalRows,
  nowMs,
  onView,
  onPageChange,
}: Props) {
  const columns = useMemo<Column<LedgerRow>[]>(() => {
    const all: Column<LedgerRow>[] = [
      {
        key: "flow",
        header: LEDGER_COLUMN_LABEL.flow,
        cell: (r) => <span className="text-xs">{r.sourceLabel}</span>,
      },
      {
        key: "amount",
        header: LEDGER_COLUMN_LABEL.amount,
        cell: (r) => (
          <span className="font-medium">{formatCurrency(r.amount)}</span>
        ),
      },
      {
        key: "fee",
        header: LEDGER_COLUMN_LABEL.fee,
        cell: (r) =>
          r.fee !== undefined ? (
            <span>{formatCurrency(r.fee)}</span>
          ) : (
            <span className="text-xs text-neutral-400">None</span>
          ),
      },
      {
        key: "status",
        header: LEDGER_COLUMN_LABEL.status,
        cell: (r) => <Badge variant={r.statusVariant}>{r.statusLabel}</Badge>,
      },
      {
        key: "source",
        header: LEDGER_COLUMN_LABEL.source,
        cell: (r) => <span className="font-mono text-xs">{r.sourceRef}</span>,
      },
      {
        key: "created",
        header: LEDGER_COLUMN_LABEL.created,
        cell: (r) => (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {nowMs ? formatRelative(r.createdAt, nowMs) : "Loading"}
          </span>
        ),
      },
    ];

    const fixed: Column<LedgerRow>[] = [
      {
        key: "id",
        header: "Event",
        cell: (r) => (
          <div className="min-w-0">
            <div className="truncate font-mono text-xs">{r.id}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {r.merchantName}
            </div>
          </div>
        ),
      },
      {
        key: "kind",
        header: "Flow",
        cell: (r) => <Badge variant="neutral">{r.kind}</Badge>,
      },
    ];

    const picked = all.filter((c) =>
      visibleColumns.includes(c.key as LedgerColumnKey)
    );

    return [
      ...fixed,
      ...picked,
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
    ];
  }, [visibleColumns, nowMs, onView]);

  return (
    <AdminDataTable
      columns={columns}
      data={rows}
      isLoading={false}
      rowKey={(r) => r.id}
      onRowClick={(r) => onView(r)}
      emptyMessage="No merchant money events match these filters."
      caption="Merchant payments ledger"
      pageSize={pageSize}
      currentPage={currentPage}
      totalRows={totalRows}
      onPageChange={onPageChange}
    />
  );
}