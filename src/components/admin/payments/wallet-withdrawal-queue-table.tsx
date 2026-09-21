"use client";

import { useMemo } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type { WalletWithdrawalQueueRow } from "@/lib/admin/types/customer-wallet";
import {
  APPROVAL_REASON_LABEL,
  APPROVAL_REASON_VARIANT,
  QUEUE_OWNER_TYPE_LABEL,
  QUEUE_OWNER_TYPE_VARIANT,
} from "@/lib/admin/wallets/wallet-labels";

interface Props {
  rows: WalletWithdrawalQueueRow[];
  pageSize: number;
  currentPage: number;
  totalRows: number;
  nowMs: number | null;
  canApprove: boolean;
  onView: (row: WalletWithdrawalQueueRow) => void;
  onApprove: (row: WalletWithdrawalQueueRow) => void;
  onReject: (row: WalletWithdrawalQueueRow) => void;
  onPageChange: (page: number) => void;
}

export function WalletWithdrawalQueueTable({
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
  const columns = useMemo<Column<WalletWithdrawalQueueRow>[]>(
    () => [
      {
        key: "id",
        header: "Withdrawal",
        cell: (r) => (
          <div className="min-w-0">
            <div className="truncate font-mono text-xs">{r.id}</div>
            <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {r.ownerName}
            </div>
          </div>
        ),
      },
      {
        key: "owner",
        header: "Owner",
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <Badge variant={QUEUE_OWNER_TYPE_VARIANT[r.ownerType]}>
              {QUEUE_OWNER_TYPE_LABEL[r.ownerType]}
            </Badge>
            {r.storefrontName && (
              <span className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                {r.storefrontName}
              </span>
            )}
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
        header: "Total",
        cell: (r) => (
          <span className="font-medium">{formatCurrency(r.total)}</span>
        ),
      },
      {
        key: "source",
        header: "Source",
        cell: (r) => (
          <span className="text-xs">
            {r.sourceProvider} {r.sourceMaskedLabel}
          </span>
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
                  <Badge
                    variant={APPROVAL_REASON_VARIANT[reason]}
                    size="sm"
                  >
                    {APPROVAL_REASON_LABEL[reason]}
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
        key: "requested",
        header: "Requested",
        cell: (r) => (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {nowMs ? formatRelative(r.requestedAt, nowMs) : "Loading"}
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
      rowAriaLabel={(r) => "Open withdrawal " + r.id + " for " + r.ownerName}
      emptyMessage="No wallet withdrawals match these filters."
      caption="Wallet withdrawal queue"
      pageSize={pageSize}
      currentPage={currentPage}
      totalCount={totalRows}
      onPageChange={onPageChange}
    />
  );
}