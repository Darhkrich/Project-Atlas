"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import Link from "next/link";
import type {
  Payment,
  PaymentFlag,
  PaymentReconciliation,
} from "@/lib/admin/types/payment";
import {
  PAYMENT_FLAG_REASON_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_SOURCE_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
  WALLET_CREDIT_STATUS_LABEL,
  WALLET_CREDIT_STATUS_VARIANT,
  isPaymentRetryable,
  retryBlockedReason,
} from "@/lib/admin/payments/payments-labels";

interface Props {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  flags: PaymentFlag[];
  reconciliations: PaymentReconciliation[];
  nowMs: number | null;
  canRetry: boolean;
  canReconcile: boolean;
  canFlag: boolean;
  onRetry: (payment: Payment) => void;
  onReconcile: (payment: Payment) => void;
  onFlag: (payment: Payment) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-right text-sm text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}

export function PaymentDetailDrawer({
  open,
  onClose,
  payment,
  flags,
  reconciliations,
  nowMs,
  canRetry,
  canReconcile,
  canFlag,
  onRetry,
  onReconcile,
  onFlag,
}: Props) {
  if (!payment) return null;

  const activeFlags = flags.filter((f) => !f.resolvedAt);
  const resolvedFlags = flags.filter((f) => f.resolvedAt);
  const retryable = isPaymentRetryable(payment);
  const retryBlocked = retryBlockedReason(payment);

  return (
    <ModalShell open={open} onClose={onClose} title="Payment detail">
      <div className="space-y-5">
        <section aria-label="Payment">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={PAYMENT_STATUS_VARIANT[payment.status]}>
              {PAYMENT_STATUS_LABEL[payment.status]}
            </Badge>
            <Badge variant="neutral">
              {PAYMENT_SOURCE_LABEL[payment.source]}
            </Badge>
            {payment.walletCreditStatus && (
              <Badge
                variant={
                  WALLET_CREDIT_STATUS_VARIANT[payment.walletCreditStatus]
                }
              >
                {WALLET_CREDIT_STATUS_LABEL[payment.walletCreditStatus]}
              </Badge>
            )}
            {activeFlags.length > 0 && (
              <Badge variant="warning">
                {activeFlags.length} open flag
                {activeFlags.length === 1 ? "" : "s"}
              </Badge>
            )}
          </div>

          <div className="mt-3">
            <Row
              label="Payment ID"
              value={<span className="font-mono text-xs">{payment.id}</span>}
            />
            <Row
              label="Reference"
              value={
                <span className="font-mono text-xs">{payment.reference}</span>
              }
            />
            <Row label="User" value={payment.user.name} />
            <Row label="User type" value={payment.user.type} />
            <Row label="Amount" value={formatCurrency(payment.amount)} />
            <Row label="Fee" value={formatCurrency(payment.fee)} />
            <Row label="Net" value={formatCurrency(payment.netAmount)} />
            <Row
              label="Method"
              value={PAYMENT_METHOD_LABEL[payment.methodId]}
            />
            {payment.provider && (
              <Row label="Provider" value={payment.provider} />
            )}
            <Row
              label="Created"
              value={
                nowMs
                  ? formatRelative(payment.createdAt, nowMs)
                  : formatAbsolute(payment.createdAt)
              }
            />
            <Row
              label="Updated"
              value={
                nowMs
                  ? formatRelative(payment.updatedAt, nowMs)
                  : formatAbsolute(payment.updatedAt)
              }
            />
            {payment.failureReason && (
              <Row label="Failure reason" value={payment.failureReason} />
            )}
          </div>
        </section>

        {(payment.relatedOrderId ||
          payment.relatedTransactionId ||
          payment.relatedMerchantId ||
          payment.relatedResellerId ||
          payment.walletId) && (
          <section aria-label="Related">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Related
            </h3>
            {payment.relatedOrderId && (
              <Row label="Order" value={payment.relatedOrderId} />
            )}
            {payment.relatedTransactionId && (
              <Row label="Transaction" value={payment.relatedTransactionId} />
            )}
            {payment.relatedMerchantId && (
              <Row label="Merchant" value={payment.relatedMerchantId} />
            )}
            {payment.relatedResellerId && (
              <Row label="Reseller" value={payment.relatedResellerId} />
            )}
            {payment.walletId && (
              <Row
                label="Wallet"
                value={
                  <span className="font-mono text-xs">
                    {payment.walletId}
                    {payment.walletStore ? " (" + payment.walletStore + ")" : ""}
                  </span>
                }
              />
            )}
          </section>
        )}

        {(payment.refundStatus && payment.refundStatus !== "none") ||
        (payment.refundHistory && payment.refundHistory.length > 0) ? (
          <section aria-label="Refund record">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Refund record
            </h3>
            <Row
              label="Refund status"
              value={payment.refundStatus ?? "none"}
            />
            {payment.refundHistory?.map((r) => (
              <div
                key={r.timestamp + "-" + String(r.amount)}
                className="rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-800"
              >
                <div className="flex justify-between">
                  <span>{formatCurrency(r.amount)}</span>
                  <span>{formatAbsolute(r.timestamp)}</span>
                </div>
                <div className="mt-1 text-neutral-500 dark:text-neutral-400">
                  {r.admin.name} - {r.status}
                </div>
              </div>
            ))}
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Refunds are managed on{" "}
              <Link
                href="/admin/refunds"
                className="text-brand-600 hover:underline dark:text-brand-400"
              >
                the refunds page
              </Link>
              .
            </p>
          </section>
        ) : null}

        <section aria-label="Timeline">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Timeline
          </h3>
          <ol className="relative space-y-3 border-l border-neutral-200 pl-5 dark:border-neutral-700">
            {payment.timeline.map((event, idx) => (
              <li key={idx} className="relative">
                <span
                  aria-hidden="true"
                  className={
                    "absolute -left-[27px] mt-1 flex h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900 " +
                    (event.status === "success"
                      ? "bg-success-500"
                      : event.status === "warning"
                      ? "bg-warning-500"
                      : event.status === "danger"
                      ? "bg-danger-500"
                      : "bg-info-500")
                  }
                />
                <p className="text-sm font-medium">{event.label}</p>
                {event.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {event.description}
                  </p>
                )}
                <p className="text-xs text-neutral-400">
                  {formatAbsolute(event.timestamp)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {reconciliations.length > 0 && (
          <section aria-label="Reconciliations">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Reconciliations
            </h3>
            <ul role="list" className="space-y-2">
              {reconciliations.map((rec) => (
                <li
                  key={rec.id}
                  className="rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-800"
                >
                  <div className="flex justify-between">
                    <span className="font-mono">{rec.providerReference}</span>
                    <span>{formatAbsolute(rec.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-neutral-500 dark:text-neutral-400">
                    {rec.admin.name}
                  </div>
                  {rec.note && <p className="mt-1">{rec.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(activeFlags.length > 0 || resolvedFlags.length > 0) && (
          <section aria-label="Flags">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Flags
            </h3>
            <ul role="list" className="space-y-2">
              {activeFlags.map((f) => (
                <li
                  key={f.id}
                  className="rounded-md border border-warning-200 bg-warning-50 p-2 text-xs dark:border-warning-900/60 dark:bg-warning-900/20"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {PAYMENT_FLAG_REASON_LABEL[f.reason]}
                    </span>
                    <span>{formatAbsolute(f.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-neutral-600 dark:text-neutral-400">
                    {f.admin.name}
                  </div>
                  {f.note && <p className="mt-1">{f.note}</p>}
                </li>
              ))}
              {resolvedFlags.map((f) => (
                <li
                  key={f.id}
                  className="rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-800"
                >
                  <div className="flex justify-between">
                    <span>
                      {PAYMENT_FLAG_REASON_LABEL[f.reason]} - resolved
                    </span>
                    <span>{formatAbsolute(f.resolvedAt ?? f.createdAt)}</span>
                  </div>
                  {f.resolutionNote && (
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                      {f.resolutionNote}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {payment.auditTrail && payment.auditTrail.length > 0 && (
          <section aria-label="Audit trail">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Audit trail
            </h3>
            <ul role="list" className="space-y-2">
              {payment.auditTrail.map((entry, idx) => (
                <li
                  key={idx}
                  className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{entry.admin}</span>
                    <span>{formatAbsolute(entry.timestamp)}</span>
                  </div>
                  <p>{entry.action}</p>
                  {entry.previousState && entry.newState && (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {entry.previousState} to {entry.newState}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          aria-label="Actions"
          className="flex flex-col gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
        >
          {payment.status === "failed" && retryBlocked && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {retryBlocked}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {canRetry && retryable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(payment)}
              >
                Retry
              </Button>
            )}
            {canReconcile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReconcile(payment)}
              >
                Reconcile
              </Button>
            )}
            {canFlag && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFlag(payment)}
              >
                Flag
              </Button>
            )}
          </div>
        </section>
      </div>
    </ModalShell>
  );
}