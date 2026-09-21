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
import type { Order } from "@/lib/admin/types/orders";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  ORDER_AUDIENCE_LABELS,
  ORDER_AUDIENCE_VARIANTS,
  ORDER_FAILURE_CLASS_LABELS,
  ORDER_FAILURE_CLASS_VARIANTS,
  ORDER_FAILURE_REASON_LABELS,
  ORDER_TIMELINE_STATUS_VARIANTS,
  serviceLabel,
  networkLabel,
  providerLabel,
} from "@/lib/admin/orders/orders-labels";
import {
  walletOwnerLabel,
  isCancellable,
} from "@/lib/admin/orders/orders-helpers";

interface OrderDetailDrawerProps {
  order: Order | null;
  now: number | null;
  onClose: () => void;
  onCancel: (order: Order) => void;
}

function walletStatusLabel(status: "held" | "captured" | "released"): string {
  if (status === "held") return "Held";
  if (status === "captured") return "Captured";
  return "Released";
}

export function OrderDetailDrawer({
  order,
  now,
  onClose,
  onCancel,
}: OrderDetailDrawerProps) {
  if (!order) return null;

  const showFailure =
    order.failure !== undefined &&
    (order.status === "failed" || order.status === "retrying");

  const showRetry =
    order.status === "retrying" && order.nextRetryAt !== undefined;

  return (
    <ModalShell
      open={order !== null}
      onClose={onClose}
      title={order.id}
      description={serviceLabel(order.serviceId)}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <Badge variant={ORDER_AUDIENCE_VARIANTS[order.audience]}>
            {ORDER_AUDIENCE_LABELS[order.audience]}
          </Badge>
          {order.failure && (
            <Badge variant={ORDER_FAILURE_CLASS_VARIANTS[order.failure.class]}>
              {ORDER_FAILURE_CLASS_LABELS[order.failure.class]} failure
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Amount</p>
            <p className="font-semibold">{formatCurrency(order.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Commission</p>
            <p>{formatCurrency(order.commission)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Payment method</p>
            <p className="capitalize">{order.paymentMethodId}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Network</p>
            <p>{networkLabel(order.networkId)}</p>
          </div>
        </div>

        {order.walletDebit && (
          <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Wallet
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Owner</p>
                <p>{walletOwnerLabel(order.walletDebit.walletOwner)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Wallet</p>
                <p className="font-mono text-xs">{order.walletDebit.walletId}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Amount held</p>
                <p>{formatCurrency(order.walletDebit.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Status</p>
                <p>{walletStatusLabel(order.walletDebit.status)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Held at</p>
                <p title={formatAbsolute(order.walletDebit.heldAt)}>
                  {now
                    ? formatRelative(order.walletDebit.heldAt, now)
                    : formatAbsolute(order.walletDebit.heldAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!order.walletDebit && (
          <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-500 dark:bg-neutral-900">
            No wallet movement. This order was funded by{" "}
            <span className="capitalize text-neutral-700 dark:text-neutral-300">
              {order.paymentMethodId}
            </span>
            .
          </div>
        )}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Customer
          </p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{order.customer.name}</p>
              <p className="text-xs text-neutral-500">{order.customer.phone}</p>
            </div>
            {order.customerId && (
              <Link
                href={routes.customerDetail(order.customerId)}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View customer
              </Link>
            )}
          </div>
        </div>

        {order.reseller && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Reseller
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm">{order.reseller.name}</p>
              {order.resellerId && (
                <Link
                  href={routes.resellerDetail(order.resellerId)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View reseller
                </Link>
              )}
            </div>
          </div>
        )}

        {order.storefrontId && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Storefront
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-mono text-xs">{order.storefrontId}</p>
              <Link
                href={routes.resellerStorefrontDetail(order.storefrontId)}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View storefront
              </Link>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Provider
          </p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm">{providerLabel(order.providerId)}</p>
            <Link
              href={routes.providerDetail(order.providerId)}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Provider health
            </Link>
          </div>
        </div>

        {showFailure && order.failure && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
            <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
              {ORDER_FAILURE_REASON_LABELS[order.failure.reason]}
            </p>
            {order.failure.providerMessage && (
              <p className="mt-1 text-xs text-danger-700/80 dark:text-danger-300/80">
                {order.failure.providerMessage}
              </p>
            )}
            <p className="mt-2 text-[11px] text-danger-700/70 dark:text-danger-300/70">
              {now
                ? formatRelative(order.failure.occurredAt, now)
                : formatAbsolute(order.failure.occurredAt)}
            </p>
          </div>
        )}

        {showRetry && order.nextRetryAt && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-800 dark:bg-warning-900/20">
            <p className="text-xs font-medium text-warning-800 dark:text-warning-200">
              Automatic retry scheduled
            </p>
            <p className="mt-1 text-xs text-warning-800/80 dark:text-warning-200/80">
              Attempt {order.retryAttempts} of {order.maxRetryAttempts} complete.
              Next attempt{" "}
              {now
                ? formatRelative(order.nextRetryAt, now)
                : formatAbsolute(order.nextRetryAt)}
              .
            </p>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Timeline
          </p>
          <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
            {order.timeline.map((event, idx) => (
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
                  {event.attempt !== undefined && (
                    <Badge variant={ORDER_TIMELINE_STATUS_VARIANTS[event.status]}>
                      Attempt {event.attempt}
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
        {isCancellable(order) && (
          <Can permission={PERMISSIONS.ORDERS_MANAGE}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(order)}
            >
              Cancel order
            </Button>
          </Can>
        )}
      </div>
    </ModalShell>
  );
}