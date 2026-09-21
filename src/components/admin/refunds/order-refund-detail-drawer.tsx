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
import type { Refund } from "@/lib/admin/types/refund";
import {
  REFUND_TYPE_LABELS,
  REFUND_TYPE_VARIANTS,
  REFUND_STATUS_VARIANTS,
  REFUND_STATUS_LABELS,
  REFUND_AUDIENCE_LABELS,
  REFUND_AUDIENCE_VARIANTS,
  REFUND_TIMELINE_STATUS_VARIANTS,
  RISK_BAND_LABELS,
  RISK_BAND_VARIANTS,
  reasonLabel,
} from "@/lib/admin/refunds/refunds-labels";
import {
  deriveRiskBand,
  refundedAmount,
  remainingRefundable,
} from "@/lib/admin/refunds/refunds-helpers";
import { ORDER_SERVICE_LABELS } from "@/lib/admin/orders/orders-labels";

interface OrderRefundDetailDrawerProps {
  refund: Refund | null;
  now: number | null;
  onClose: () => void;
  onApprove: (refund: Refund) => void;
  onReject: (refund: Refund) => void;
  onProcess: (refund: Refund) => void;
}

function serviceName(serviceId: string): string {
  return ORDER_SERVICE_LABELS[serviceId] ?? serviceId;
}

export function OrderRefundDetailDrawer({
  refund,
  now,
  onClose,
  onApprove,
  onReject,
  onProcess,
}: OrderRefundDetailDrawerProps) {
  if (!refund) return null;

  const settled = refundedAmount(refund);
  const remaining = remainingRefundable(refund);
  const risk = deriveRiskBand(refund.customerHistory);
  const canAct = refund.status === "pending_admin";
  const canProcess = refund.status === "approved";

  return (
    <ModalShell
      open={refund !== null}
      onClose={onClose}
      title={refund.id}
      description={reasonLabel(refund.reason)}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={REFUND_TYPE_VARIANTS[refund.type]}>
            {REFUND_TYPE_LABELS[refund.type]}
          </Badge>
          <Badge variant={REFUND_STATUS_VARIANTS[refund.status]}>
            {REFUND_STATUS_LABELS[refund.status]}
          </Badge>
          <Badge variant={REFUND_AUDIENCE_VARIANTS[refund.audience]}>
            {REFUND_AUDIENCE_LABELS[refund.audience]}
          </Badge>
          <Badge variant={RISK_BAND_VARIANTS[risk]}>
            {RISK_BAND_LABELS[risk]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Amount</p>
            <p className="font-semibold">{formatCurrency(refund.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Refunded</p>
            <p>{formatCurrency(settled)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Remaining</p>
            <p className="font-semibold">{formatCurrency(remaining)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Requested</p>
            <p title={formatAbsolute(refund.requestedAt)}>
              {now
                ? formatRelative(refund.requestedAt, now)
                : formatAbsolute(refund.requestedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Order
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order</span>
              <Link
                href={routes.orderDetail(refund.order.orderId)}
                className="font-mono text-xs font-medium text-brand-600 hover:underline"
              >
                {refund.order.orderId}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Service</span>
              <span>{serviceName(refund.order.serviceId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment method</span>
              <span className="capitalize">{refund.order.paymentMethodId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Order amount</span>
              <span>{formatCurrency(refund.order.amount)}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Customer
          </p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{refund.customer.name}</p>
              {refund.reseller && (
                <p className="text-xs text-neutral-500">
                  Reseller: {refund.reseller.name}
                </p>
              )}
            </div>
            {refund.audience === "direct" && (
              <Link
                href={routes.customerDetail(refund.customer.id)}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View customer
              </Link>
            )}
            {refund.reseller && (
              <Link
                href={routes.resellerDetail(refund.reseller.id)}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View reseller
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Coverage split
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Atlas share</p>
              <p className="font-semibold">
                {formatCurrency(refund.atlasShareAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Reseller share</p>
              <p className="font-semibold">
                {formatCurrency(refund.resellerShareAmount)}
              </p>
            </div>
          </div>
          {refund.resellerShareAmount > 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              Recovered from future reseller commissions in installments.
            </p>
          )}
        </div>

        {refund.resellerRecovery && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-800 dark:bg-warning-900/20">
            <p className="text-xs font-medium text-warning-800 dark:text-warning-200">
              Reseller recovery
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-warning-800/70 dark:text-warning-200/70">
                  Owed
                </p>
                <p className="font-semibold">
                  {formatCurrency(refund.resellerRecovery.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-warning-800/70 dark:text-warning-200/70">
                  Recovered
                </p>
                <p className="font-semibold">
                  {formatCurrency(refund.resellerRecovery.recoveredAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {(refund.supportTicketId || refund.atlasTreasuryDebitId) && (
          <div className="space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            {refund.supportTicketId && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Support ticket</span>
                <Link
                  href={routes.support}
                  className="font-mono text-xs font-medium text-brand-600 hover:underline"
                >
                  {refund.supportTicketId}
                </Link>
              </div>
            )}
            {refund.atlasTreasuryDebitId && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Treasury debit</span>
                <span className="font-mono text-xs">
                  {refund.atlasTreasuryDebitId}
                </span>
              </div>
            )}
          </div>
        )}

        {refund.reasonNote && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Reason note
            </p>
            <p className="text-sm">{refund.reasonNote}</p>
          </div>
        )}

        {refund.rejectionReason && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
            <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
              Rejection reason
            </p>
            <p className="mt-1 text-sm text-danger-700 dark:text-danger-300">
              {refund.rejectionReason}
            </p>
          </div>
        )}

        {refund.settlements.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Settlements
            </p>
            <ul role="list" className="space-y-2">
              {refund.settlements.map((s) => (
                <li
                  key={s.id}
                  className="rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {formatCurrency(s.amount)}
                    </span>
                    <span className="text-neutral-500">
                      {s.destination === "wallet"
                        ? "Wallet credit"
                        : "Original rail"}
                    </span>
                  </div>
                  <p className="mt-1 text-neutral-500">{s.destinationDetail}</p>
                  {s.railReversalPending && (
                    <p className="mt-1 text-warning-600">
                      Rail reversal pending
                    </p>
                  )}
                  <p className="mt-1 text-neutral-400">
                    {now
                      ? formatRelative(s.settledAt, now)
                      : formatAbsolute(s.settledAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Timeline
          </p>
          <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
            {refund.timeline.map((event, idx) => (
              <li key={idx} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-neutral-900",
                    event.status === "success"
                      ? "bg-success-500"
                      : event.status === "warning"
                      ? "bg-warning-500"
                      : event.status === "danger"
                      ? "bg-danger-500"
                      : "bg-info-500"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{event.label}</p>
                  {event.actor && (
                    <Badge variant={REFUND_TIMELINE_STATUS_VARIANTS[event.status]}>
                      {event.actor.name}
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-xs text-neutral-500">{event.description}</p>
                )}
                <p
                  className="text-xs text-neutral-400"
                  title={formatAbsolute(event.timestamp)}
                >
                  {now
                    ? formatRelative(event.timestamp, now)
                    : formatAbsolute(event.timestamp)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
        {canAct && (
          <>
            <Can permission={PERMISSIONS.REFUNDS_REJECT}>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(refund)}
              >
                Reject
              </Button>
            </Can>
            <Can permission={PERMISSIONS.REFUNDS_APPROVE}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(refund)}
              >
                Approve
              </Button>
            </Can>
          </>
        )}
        {canProcess && (
          <Can permission={PERMISSIONS.REFUNDS_PROCESS}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onProcess(refund)}
            >
              Process refund
            </Button>
          </Can>
        )}
      </div>
    </ModalShell>
  );
}