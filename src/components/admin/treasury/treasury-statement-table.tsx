"use client";

import { useMemo } from "react";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import { cn } from "@/lib/utils";
import type { TreasuryStatementRow } from "@/lib/domains/treasury/types";
import {
  TREASURY_KIND_LABELS,
  TREASURY_KIND_VARIANTS,
  TREASURY_DIRECTION_LABELS,
  TREASURY_APPROVAL_LABELS,
  TREASURY_APPROVAL_VARIANTS,
  TREASURY_RECONCILIATION_LABELS,
  TREASURY_RECONCILIATION_VARIANTS,
} from "@/lib/domains/treasury/labels";

interface TreasuryStatementTableProps {
  rows: TreasuryStatementRow[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (eventId: string) => void;
}

export function TreasuryStatementTable({
  rows,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: TreasuryStatementTableProps) {
  const now = useNow();

  const columns = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        cell: (row: TreasuryStatementRow) => (
          <span
            className="text-xs text-neutral-500"
            title={formatAbsolute(row.createdAt)}
          >
            {now ? formatRelative(row.createdAt, now) : "—"}
          </span>
        ),
      },
      {
        key: "kind",
        header: "Kind",
        cell: (row: TreasuryStatementRow) => (
          <Badge variant={TREASURY_KIND_VARIANTS[row.kind]}>
            {TREASURY_KIND_LABELS[row.kind]}
          </Badge>
        ),
      },
      {
        key: "direction",
        header: "Direction",
        cell: (row: TreasuryStatementRow) => (
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              row.direction === "in"
                ? "text-success-700 dark:text-success-300"
                : row.direction === "out"
                ? "text-danger-700 dark:text-danger-300"
                : "text-neutral-500"
            )}
          >
            {TREASURY_DIRECTION_LABELS[row.direction]}
          </span>
        ),
      },
      {
        key: "counterparty",
        header: "Counterparty",
        cell: (row: TreasuryStatementRow) => (
          <span className="text-sm">{row.counterpartyName ?? "—"}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (row: TreasuryStatementRow) => (
          <span
            className={cn(
              "text-sm font-medium",
              row.direction === "in"
                ? "text-success-700 dark:text-success-300"
                : row.direction === "out"
                ? "text-danger-700 dark:text-danger-300"
                : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            {row.direction === "out" ? "−" : row.direction === "in" ? "+" : ""}
            {formatCurrency(row.amount)}
          </span>
        ),
      },
      {
        key: "reference",
        header: "Reference",
        cell: (row: TreasuryStatementRow) => (
          <span className="font-mono text-xs">{row.reference}</span>
        ),
      },
      {
        key: "approval",
        header: "Approval",
        cell: (row: TreasuryStatementRow) => (
          <Badge variant={TREASURY_APPROVAL_VARIANTS[row.approvalStatus]}>
            {TREASURY_APPROVAL_LABELS[row.approvalStatus]}
          </Badge>
        ),
      },
      {
        key: "reconciliation",
        header: "Reconciliation",
        cell: (row: TreasuryStatementRow) => (
          <Badge
            variant={TREASURY_RECONCILIATION_VARIANTS[row.reconciliationStatus]}
          >
            {TREASURY_RECONCILIATION_LABELS[row.reconciliationStatus]}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row: TreasuryStatementRow) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={"View event " + row.id}
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
      emptyMessage="No treasury events match the current filters."
      caption="Treasury statement"
    />
  );
}