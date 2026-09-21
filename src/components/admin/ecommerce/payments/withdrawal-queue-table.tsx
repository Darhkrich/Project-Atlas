"use client";

import { useMemo } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import {
  WITHDRAWAL_APPROVAL_REASON_LABELS,
} from "@/lib/admin/ecommerce/payments/payments-labels";
import type { WithdrawalQueueRow } from "@/lib/admin/types/merchant-money";

interface Props {
  rows: WithdrawalQueueRow[];
  pageSize: number;
  currentPage: number;
  totalRows: number;
  nowMs: number | null;
  canApprove: boolean;
  onView: (row: WithdrawalQueueRow) => void;
  onApprove: (row: WithdrawalQueueRow) => void;
  onReject: (row: WithdrawalQueueRow) => void;
  onPageChange: (page: number) => void;
}

export function WithdrawalQueueTable({
  rows,
  pageSize,
  currentPage,
  totalRows,
  nowMs,
  canApprove,
  onView,
  onApprove,
  onReject,
  onPageChange,
}: Props) {
  const columns = useMemo<Column<WithdrawalQueueRow>[]>(
    () => [
      {
        key: "id",
        header: "Withdrawal",
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
        key: "amount",
        header: "Amount",
        cell: (r) => <span>{formatCurrency(r.amount)}</span>,
      },
      {
        key: "fee",
        header: "Fee",
        cell: (r) => <span>{formatCurrency(r.fee)}</span>,
      },
      {
        key: "total",
        header: "Total debit",
        cell: (r) => (
          <span className="font-medium">{formatCurrency(r.total)}</span>
        ),
      },
      {
        key: "destination",
        header: "Destination",
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs">
              {r.destinationProvider} {r.destinationMasked}
            </span>
            {r.destinationPendingChange ? (
              <Badge variant="warning" size="sm">
                Change pending
              </Badge>
            ) : r.destinationVerified ? (
              <span className="text-[10px] uppercase tracking-wide text-success-700 dark:text-success-400">
                Verified
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: "reasons",
        header: "Requires approval because",
        cell: (r) =>
          r.approvalRequiredReasons.length === 0 ? (
            <span className="text-xs text-neutral-400">Auto path</span>
          ) : (
            <ul role="list" className="flex flex-wrap gap-1">
              {r.approvalRequiredReasons.map((reason) => (
                <li key={reason}>
                  <Badge variant="warning" size="sm">
                    {WITHDRAWAL_APPROVAL_REASON_LABELS[reason]}
                  </Badge>
                </li>
              ))}
            </ul>
          ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <div className="flex items-center gap-1">
            <Badge variant={r.statusVariant}>{r.statusLabel}</Badge>
            {r.autoApproved && (
              <Badge variant="brand" size="sm">
                Auto
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "created",
        header: "Requested",
        cell: (r) => (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {nowMs ? formatRelative(r.createdAt, nowMs) : "Loading"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (r) => {
          const canAct = canApprove && r.status === "pending_admin";
          return (
            <div className="flex gap-1">
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
              {canAct && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(r);
                    }}
                    aria-label={"Approve " + r.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(r);
                    }}
                    aria-label={"Reject " + r.id}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [nowMs, canApprove, onView, onApprove, onReject]
  );

  return (
    <AdminDataTable
      columns={columns}
      data={rows}
      isLoading={false}
      rowKey={(r) => r.id}
      onRowClick={(r) => onView(r)}
      emptyMessage="No withdrawals match these filters."
      caption="Merchant withdrawal queue"
      pageSize={pageSize}
      currentPage={currentPage}
      totalRows={totalRows}
      onPageChange={onPageChange}
    />
  );
}