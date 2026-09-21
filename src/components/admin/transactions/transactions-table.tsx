"use client";

import { useMemo } from "react";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import type { TransactionLedgerRow } from "@/lib/admin/types/transaction";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KIND_VARIANTS,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_STATUS_VARIANTS,
  TRANSACTION_AUDIENCE_LABELS,
  TRANSACTION_AUDIENCE_VARIANTS,
} from "@/lib/admin/transactions/transactions-labels";

interface TransactionsTableProps {
  rows: TransactionLedgerRow[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (transactionId: string) => void;
}

export function TransactionsTable({
  rows,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: TransactionsTableProps) {
  const now = useNow();

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "Transaction",
        cell: (row: TransactionLedgerRow) => (
          <span className="font-mono text-xs font-medium">{row.id}</span>
        ),
      },
      {
        key: "kind",
        header: "Kind",
        cell: (row: TransactionLedgerRow) => (
          <Badge variant={TRANSACTION_KIND_VARIANTS[row.kind]}>
            {TRANSACTION_KIND_LABELS[row.kind]}
          </Badge>
        ),
      },
      {
        key: "audience",
        header: "Audience",
        cell: (row: TransactionLedgerRow) => (
          <Badge variant={TRANSACTION_AUDIENCE_VARIANTS[row.audience]}>
            {TRANSACTION_AUDIENCE_LABELS[row.audience]}
          </Badge>
        ),
      },
      {
        key: "owner",
        header: "Owner",
        cell: (row: TransactionLedgerRow) => (
          <span className="text-sm">{row.ownerName}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (row: TransactionLedgerRow) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.amount)}
          </span>
        ),
      },
      {
        key: "method",
        header: "Method",
        cell: (row: TransactionLedgerRow) => (
          <span className="text-xs text-neutral-500">{row.paymentMethodId}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row: TransactionLedgerRow) => (
          <Badge variant={TRANSACTION_STATUS_VARIANTS[row.status]}>
            {TRANSACTION_STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        cell: (row: TransactionLedgerRow) => (
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
        cell: (row: TransactionLedgerRow) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={"View transaction " + row.id}
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
      emptyMessage="No transactions match the current filters."
      caption="Transaction ledger"
    />
  );
}