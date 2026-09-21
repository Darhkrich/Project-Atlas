"use client";

import { useMemo } from "react";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import type { RefundLedgerRow } from "@/lib/admin/refunds/refunds-projection";
import {
  REFUND_TYPE_LABELS,
  REFUND_TYPE_VARIANTS,
  REFUND_STATUS_VARIANTS,
  REFUND_AUDIENCE_LABELS,
  REFUND_AUDIENCE_VARIANTS,
  RISK_BAND_LABELS,
  RISK_BAND_VARIANTS,
} from "@/lib/admin/refunds/refunds-labels";

interface OrderRefundsTableProps {
  rows: RefundLedgerRow[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (refundId: string) => void;
}

export function OrderRefundsTable({
  rows,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: OrderRefundsTableProps) {
  const now = useNow();

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "Refund",
        cell: (row: RefundLedgerRow) => (
          <span className="font-mono text-xs font-medium">{row.id}</span>
        ),
      },
      {
        key: "type",
        header: "Type",
        cell: (row: RefundLedgerRow) => (
          <Badge variant={REFUND_TYPE_VARIANTS[row.type]}>
            {REFUND_TYPE_LABELS[row.type]}
          </Badge>
        ),
      },
      {
        key: "audience",
        header: "Audience",
        cell: (row: RefundLedgerRow) => (
          <Badge variant={REFUND_AUDIENCE_VARIANTS[row.audience]}>
            {REFUND_AUDIENCE_LABELS[row.audience]}
          </Badge>
        ),
      },
      {
        key: "order",
        header: "Order",
        cell: (row: RefundLedgerRow) => (
          <span className="font-mono text-xs">{row.orderId}</span>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (row: RefundLedgerRow) => (
          <div className="text-sm">
            <div>{row.customerName}</div>
            {row.resellerName && (
              <div className="text-xs text-neutral-500">{row.resellerName}</div>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (row: RefundLedgerRow) => (
          <span className="text-sm font-medium">{formatCurrency(row.amount)}</span>
        ),
      },
      {
        key: "risk",
        header: "Risk",
        cell: (row: RefundLedgerRow) => (
          <Badge variant={RISK_BAND_VARIANTS[row.riskBand]}>
            {RISK_BAND_LABELS[row.riskBand]}
          </Badge>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row: RefundLedgerRow) => (
          <div className="flex items-center gap-2">
            <Badge variant={REFUND_STATUS_VARIANTS[row.status]}>
              {row.statusLabel}
            </Badge>
            {row.isOverdue && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-danger-600">
                Overdue
              </span>
            )}
          </div>
        ),
      },
      {
        key: "requestedAt",
        header: "Requested",
        cell: (row: RefundLedgerRow) => (
          <span
            className="text-xs text-neutral-500"
            title={formatAbsolute(row.requestedAt)}
          >
            {now ? formatRelative(row.requestedAt, now) : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row: RefundLedgerRow) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={"View refund " + row.id}
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(row.id);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [now, onRowClick]
  );

  return (
    <AdminDataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      onRowClick={(row) => onRowClick(row.id)}
      pageSize={pageSize}
      currentPage={page}
      onPageChange={onPageChange}
      emptyMessage="No refunds match the current filters."
      caption="Order refunds ledger"
    />
  );
}