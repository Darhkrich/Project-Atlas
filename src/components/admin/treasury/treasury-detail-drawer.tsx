"use client";

import Link from "next/link";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Can } from "@/lib/admin/rbac/can";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { routes } from "@/lib/admin/routes";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import type { TreasuryEvent } from "@/lib/admin/types/treasury";
import {
  TREASURY_KIND_LABELS,
  TREASURY_KIND_VARIANTS,
  TREASURY_DIRECTION_LABELS,
  TREASURY_DIRECTION_VARIANTS,
  TREASURY_APPROVAL_LABELS,
  TREASURY_APPROVAL_VARIANTS,
  TREASURY_RECONCILIATION_LABELS,
  TREASURY_RECONCILIATION_VARIANTS,
  TREASURY_POOL_LABELS,
} from "@/lib/admin/treasury/treasury-labels";
import { isDualApprovalRequired } from "@/lib/admin/treasury/treasury-helpers";

interface TreasuryDetailDrawerProps {
  event: TreasuryEvent | null;
  now: number | null;
  onClose: () => void;
  onApprove: (event: TreasuryEvent) => void;
  onReject: (event: TreasuryEvent) => void;
  onSettle: (event: TreasuryEvent) => void;
  onReconcile: (event: TreasuryEvent) => void;
}

export function TreasuryDetailDrawer({
  event,
  now,
  onClose,
  onApprove,
  onReject,
  onSettle,
  onReconcile,
}: TreasuryDetailDrawerProps) {
  if (!event) return null;

  const isPending = event.approvalStatus === "pending";
  const isApprovedNotSettled =
    event.approvalStatus === "approved" && event.settledAt === undefined;
  const isUnmatched = event.reconciliationStatus === "unmatched";
  const dualRequired = isDualApprovalRequired(event.kind, event.amount);

  return (
    <ModalShell
      open={event !== null}
      onClose={onClose}
      title={event.id}
      description={TREASURY_KIND_LABELS[event.kind]}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={TREASURY_KIND_VARIANTS[event.kind]}>
            {TREASURY_KIND_LABELS[event.kind]}
          </Badge>
          <Badge variant={TREASURY_DIRECTION_VARIANTS[event.direction]}>
            {TREASURY_DIRECTION_LABELS[event.direction]}
          </Badge>
          <Badge variant={TREASURY_APPROVAL_VARIANTS[event.approvalStatus]}>
            {TREASURY_APPROVAL_LABELS[event.approvalStatus]}
          </Badge>
          <Badge variant={TREASURY_RECONCILIATION_VARIANTS[event.reconciliationStatus]}>
            {TREASURY_RECONCILIATION_LABELS[event.reconciliationStatus]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Amount</p>
            <p
              className={cn(
                "text-lg font-semibold",
                event.direction === "in"
                  ? "text-success-700 dark:text-success-300"
                  : event.direction === "out"
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-neutral-900 dark:text-neutral-100"
              )}
            >
              {event.direction === "out" ? "−" : event.direction === "in" ? "+" : ""}
              {formatCurrency(event.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Currency</p>
            <p>{event.currency}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Created</p>
            <p title={formatAbsolute(event.createdAt)}>
              {now
                ? formatRelative(event.createdAt, now)
                : formatAbsolute(event.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Settled</p>
            <p
              title={event.settledAt ? formatAbsolute(event.settledAt) : undefined}
            >
              {event.settledAt
                ? now
                  ? formatRelative(event.settledAt, now)
                  : formatAbsolute(event.settledAt)
                : "—"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Reference</span>
            <span className="font-mono text-xs">{event.reference}</span>
          </div>
          <div className="mt-1">
            <p className="text-xs text-neutral-500">Description</p>
            <p className="mt-0.5">{event.description}</p>
          </div>
        </div>

        {event.counterparty && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Counterparty
            </p>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{event.counterparty.name}</p>
                <p className="text-xs text-neutral-500 capitalize">
                  {event.counterparty.type.replace("_", " ")}
                </p>
              </div>
              {event.counterparty.type === "customer" && (
                <Link
                  href={routes.customerDetail(event.counterparty.id)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View customer
                </Link>
              )}
              {event.counterparty.type === "reseller" && (
                <Link
                  href={routes.resellerDetail(event.counterparty.id)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View reseller
                </Link>
              )}
              {event.counterparty.type === "merchant" && (
                <Link
                  href={routes.merchantDetail(event.counterparty.id)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View merchant
                </Link>
              )}
              {event.counterparty.type === "provider" && (
                <Link
                  href={routes.providerDetail(event.counterparty.id)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Provider health
                </Link>
              )}
            </div>
          </div>
        )}

        {event.poolType && event.ownerId && (
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Liability pool
            </p>
            <div className="mt-1 flex justify-between text-sm">
              <span>{TREASURY_POOL_LABELS[event.poolType]}</span>
              <span className="font-mono text-xs">{event.ownerId}</span>
            </div>
          </div>
        )}

        {dualRequired && (
          <div className="rounded-lg border border-info-200 bg-info-50 p-3 dark:border-info-800 dark:bg-info-900/20">
            <p className="text-xs font-medium text-info-800 dark:text-info-200">
              Dual approval required
            </p>
            <p className="mt-1 text-xs text-info-800/80 dark:text-info-200/80">
              This event exceeds the {formatCurrency(10000)} threshold or is
              always dual-approved. The creator cannot approve their own
              outbound. A second admin must approve.
            </p>
          </div>
        )}

        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Created by</span>
            <span>{event.createdBy.name}</span>
          </div>
          {event.approvedBy && (
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500">Approved by</span>
              <span>{event.approvedBy.name}</span>
            </div>
          )}
          {event.approvedAt && (
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500">Approved at</span>
              <span
                title={formatAbsolute(event.approvedAt)}
                className="text-xs"
              >
                {now
                  ? formatRelative(event.approvedAt, now)
                  : formatAbsolute(event.approvedAt)}
              </span>
            </div>
          )}
        </div>

        {event.rejectionReason && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
            <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
              Rejection reason
            </p>
            <p className="mt-1 text-sm text-danger-700 dark:text-danger-300">
              {event.rejectionReason}
            </p>
          </div>
        )}

        {event.relatedEventId && (
          <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
            <div className="flex justify-between">
              <span className="text-neutral-500">Related event</span>
              <span className="font-mono text-xs">{event.relatedEventId}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>

        {isUnmatched && (
          <Can permission={PERMISSIONS.TREASURY_MANAGE}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReconcile(event)}
            >
              Reconcile
            </Button>
          </Can>
        )}

        {isPending && (
          <>
            <Can permission={PERMISSIONS.TREASURY_APPROVE}>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(event)}
              >
                Reject
              </Button>
            </Can>
            <Can permission={PERMISSIONS.TREASURY_APPROVE}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(event)}
              >
                Approve
              </Button>
            </Can>
          </>
        )}

        {isApprovedNotSettled && (
          <Can permission={PERMISSIONS.TREASURY_MANAGE}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSettle(event)}
            >
              Mark as settled
            </Button>
          </Can>
        )}
      </div>
    </ModalShell>
  );
}