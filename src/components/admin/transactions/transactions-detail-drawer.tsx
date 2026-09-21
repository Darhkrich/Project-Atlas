"use client";

import Link from "next/link";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { routes } from "@/lib/admin/routes";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import type { TransactionLedgerRow } from "@/lib/admin/types/transaction";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_KIND_VARIANTS,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_STATUS_VARIANTS,
  TRANSACTION_AUDIENCE_LABELS,
  TRANSACTION_AUDIENCE_VARIANTS,
  TRANSACTION_SETTLEMENT_LABELS,
  TRANSACTION_SETTLEMENT_VARIANTS,
  TRANSACTION_FAILURE_CLASS_LABELS,
  TRANSACTION_FAILURE_CLASS_VARIANTS,
  TRANSACTION_FAILURE_REASON_LABELS,
  TRANSACTION_OWNER_TYPE_LABELS,
  TRANSACTION_WALLET_LABELS,
} from "@/lib/admin/transactions/transactions-labels";

interface TransactionDetailDrawerProps {
  transaction: TransactionLedgerRow | null;
  now: number | null;
  onClose: () => void;
}

interface TimelineStep {
  label: string;
  timestamp: string;
  tone: "info" | "success" | "warning" | "danger";
}

function buildTimeline(row: TransactionLedgerRow): TimelineStep[] {
  const steps: TimelineStep[] = [];
  steps.push({ label: "Created", timestamp: row.createdAt, tone: "info" });
  if (row.heldAt && row.heldAt !== row.createdAt) {
    steps.push({ label: "Held", timestamp: row.heldAt, tone: "info" });
  }
  if (row.capturedAt) {
    steps.push({ label: "Captured", timestamp: row.capturedAt, tone: "success" });
  }
  if (row.releasedAt) {
    steps.push({ label: "Released", timestamp: row.releasedAt, tone: "warning" });
  }
  if (row.failure) {
    steps.push({
      label: TRANSACTION_FAILURE_REASON_LABELS[row.failure.reason],
      timestamp: row.failure.occurredAt,
      tone: row.failure.class === "system" ? "danger" : "warning",
    });
  }
  return steps;
}

export function TransactionDetailDrawer({
  transaction,
  now,
  onClose,
}: TransactionDetailDrawerProps) {
  if (!transaction) return null;

  const timeline = buildTimeline(transaction);

  return (
    <ModalShell
      open={transaction !== null}
      onClose={onClose}
      title={transaction.id}
      description={TRANSACTION_KIND_LABELS[transaction.kind]}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={TRANSACTION_KIND_VARIANTS[transaction.kind]}>
            {TRANSACTION_KIND_LABELS[transaction.kind]}
          </Badge>
          <Badge variant={TRANSACTION_STATUS_VARIANTS[transaction.status]}>
            {TRANSACTION_STATUS_LABELS[transaction.status]}
          </Badge>
          <Badge variant={TRANSACTION_SETTLEMENT_VARIANTS[transaction.settlementStatus]}>
            {TRANSACTION_SETTLEMENT_LABELS[transaction.settlementStatus]}
          </Badge>
          <Badge variant={TRANSACTION_AUDIENCE_VARIANTS[transaction.audience]}>
            {TRANSACTION_AUDIENCE_LABELS[transaction.audience]}
          </Badge>
          {transaction.failure && (
            <Badge
              variant={TRANSACTION_FAILURE_CLASS_VARIANTS[transaction.failure.class]}
            >
              {TRANSACTION_FAILURE_CLASS_LABELS[transaction.failure.class]} failure
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Amount</p>
            <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Net</p>
            <p>{formatCurrency(transaction.netAmount)}</p>
          </div>
          {transaction.fee > 0 && (
            <div>
              <p className="text-xs text-neutral-500">Fee</p>
              <p>{formatCurrency(transaction.fee)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-neutral-500">Currency</p>
            <p>{transaction.currency}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Payment method</p>
            <p className="capitalize">{transaction.paymentMethodId}</p>
          </div>
          {transaction.providerId && (
            <div>
              <p className="text-xs text-neutral-500">Provider</p>
              <Link
                href={routes.providerDetail(transaction.providerId)}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                {transaction.providerId}
              </Link>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Owner
          </p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{transaction.ownerName}</p>
              <p className="text-xs text-neutral-500">
                {TRANSACTION_OWNER_TYPE_LABELS[transaction.ownerType]}
              </p>
            </div>
            <div className="flex gap-3">
              {transaction.customerId && (
                <Link
                  href={routes.customerDetail(transaction.customerId)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View customer
                </Link>
              )}
              {transaction.resellerId && (
                <Link
                  href={routes.resellerDetail(transaction.resellerId)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View reseller
                </Link>
              )}
              {transaction.storefrontId && (
                <Link
                  href={routes.resellerStorefrontDetail(transaction.storefrontId)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  View storefront
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Wallet
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Owner</p>
              <p>{TRANSACTION_WALLET_LABELS[transaction.walletOwnerType]}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Wallet</p>
              <Link
                href={routes.walletDetail(transaction.walletId)}
                className="font-mono text-xs font-medium text-brand-600 hover:underline"
              >
                {transaction.walletId}
              </Link>
            </div>
          </div>
        </div>

        {transaction.relatedOrderId && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Related order
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-mono text-xs font-medium">
                {transaction.relatedOrderId}
              </p>
              <Link
                href={routes.orderDetail(transaction.relatedOrderId)}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                View order
              </Link>
            </div>
          </div>
        )}

        {transaction.failure && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
            <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
              {TRANSACTION_FAILURE_REASON_LABELS[transaction.failure.reason]}
            </p>
            {transaction.failure.providerMessage && (
              <p className="mt-1 text-xs text-danger-700/80 dark:text-danger-300/80">
                {transaction.failure.providerMessage}
              </p>
            )}
            <p className="mt-2 text-[11px] text-danger-700/70 dark:text-danger-300/70">
              {now
                ? formatRelative(transaction.failure.occurredAt, now)
                : formatAbsolute(transaction.failure.occurredAt)}
            </p>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Timeline
          </p>
          <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
            {timeline.map((step, idx) => (
              <li key={idx} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-neutral-900",
                    step.tone === "success"
                      ? "bg-success-500"
                      : step.tone === "warning"
                      ? "bg-warning-500"
                      : step.tone === "danger"
                      ? "bg-danger-500"
                      : "bg-info-500"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <p className="text-sm font-medium">{step.label}</p>
                <p
                  className="text-xs text-neutral-400"
                  title={formatAbsolute(step.timestamp)}
                >
                  {now
                    ? formatRelative(step.timestamp, now)
                    : formatAbsolute(step.timestamp)}
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
      </div>
    </ModalShell>
  );
}