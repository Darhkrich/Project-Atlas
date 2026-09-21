"use client";

import { useMemo, useState } from "react";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import type { HistoryRow } from "@/lib/admin/orders/orders-projection";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  ORDER_AUDIENCE_LABELS,
  ORDER_AUDIENCE_VARIANTS,
} from "@/lib/admin/orders/orders-labels";

interface OrdersTableProps {
  rows: HistoryRow[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (orderId: string) => void;
}

type SortKey = "createdAt" | "amount";

export function OrdersTable({
  rows,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: OrdersTableProps) {
  const now = useNow();
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      const aMs = new Date(a.createdAt).getTime();
      const bMs = new Date(b.createdAt).getTime();
      return (aMs - bMs) * dir;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "Order",
        cell: (row: HistoryRow) => (
          <span className="font-mono text-xs font-medium">{row.id}</span>
        ),
      },
      {
        key: "audience",
        header: "Audience",
        cell: (row: HistoryRow) => (
          <Badge variant={ORDER_AUDIENCE_VARIANTS[row.audience]}>
            {ORDER_AUDIENCE_LABELS[row.audience]}
          </Badge>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (row: HistoryRow) => (
          <span className="text-sm">{row.customerName}</span>
        ),
      },
      {
        key: "service",
        header: "Service",
        cell: (row: HistoryRow) => (
          <div className="text-sm">
            <div>{row.serviceLabel}</div>
            {row.networkLabel !== "—" && (
              <div className="text-xs text-neutral-500">{row.networkLabel}</div>
            )}
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        sortable: true,
        cell: (row: HistoryRow) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.amount)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row: HistoryRow) => (
          <Badge variant={ORDER_STATUS_VARIANTS[row.status]}>
            {ORDER_STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        sortable: true,
        cell: (row: HistoryRow) => (
          <span
            className="text-xs text-neutral-500"
            title={formatAbsolute(row.createdAt)}
          >
            {now ? formatRelative(row.createdAt, now) : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row: HistoryRow) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={"View order " + row.id}
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
      data={sortedRows}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      onRowClick={(row) => onRowClick(row.id)}
      pageSize={pageSize}
      currentPage={page}
      onPageChange={onPageChange}
      onSortChange={(key, dir) => {
        if (key === "amount" || key === "createdAt") {
          setSortKey(key);
          setSortDir(dir);
        }
      }}
      sortKey={sortKey}
      sortDirection={sortDir}
      emptyMessage="No orders match the current filters."
      caption="Orders ledger"
    />
  );
}