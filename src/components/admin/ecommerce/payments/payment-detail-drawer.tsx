"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/admin/support/format";
import type { Merchant } from "@/lib/admin/types/merchant";
import type {
  MerchantMoneyEvent,
  MerchantWallet,
  WithdrawalRequest,
} from "@/lib/admin/types/merchant-money";
import {
  CHECKOUT_METHOD_LABELS,
  CHECKOUT_STATUS_LABELS,
  PLAN_CHARGE_SOURCE_LABELS,
  PLAN_CHARGE_STATUS_LABELS,
  REFUND_RAIL_LABELS,
  WITHDRAWAL_APPROVAL_REASON_LABELS,
  WITHDRAWAL_FAILURE_LABELS,
  WITHDRAWAL_STATUS_LABELS,
  cardBrandLabel,
} from "@/lib/admin/ecommerce/payments/payments-labels";

interface Props {
  open: boolean;
  onClose: () => void;
  event: MerchantMoneyEvent | null;
  merchant: Merchant | null;
  billingWallet: MerchantWallet | undefined;
  mainWallet: MerchantWallet | undefined;
  cardLast4: string | undefined;
  cardBrand: string | undefined;
  autoPayEnabled: boolean;
  nowMs: number | null;
  canApprove: boolean;
  onApprove?: (w: WithdrawalRequest) => void;
  onReject?: (w: WithdrawalRequest) => void;
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

function fmtRelative(iso: string | undefined, nowMs: number | null) {
  if (!iso) return "Not yet";
  if (!nowMs) return "Loading";
  return formatRelative(iso, nowMs);
}

export function PaymentDetailDrawer({
  open,
  onClose,
  event,
  merchant,
  billingWallet,
  mainWallet,
  cardLast4,
  cardBrand,
  autoPayEnabled,
  nowMs,
  canApprove,
  onApprove,
  onReject,
}: Props) {
  if (!event) return null;

  return (
    <ModalShell open={open} onClose={onClose} title="Merchant payment detail">
      <div className="space-y-5">
        <section aria-label="Merchant">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Merchant
          </h3>
          <Row
            label="Business"
            value={merchant?.businessName ?? event.merchantId}
          />
          <Row label="Merchant ID" value={event.merchantId} />
          <Row
            label="Plan"
            value={merchant?.subscription.planId ?? "unknown"}
          />
          <Row
            label="Billing wallet"
            value={formatCurrency(billingWallet?.balance ?? 0)}
          />
          <Row
            label="Main wallet"
            value={formatCurrency(mainWallet?.balance ?? 0)}
          />
          <Row
            label="Auto-pay"
            value={
              autoPayEnabled && cardLast4
                ? cardBrandLabel(cardBrand ?? "") + " ending " + cardLast4
                : "Off"
            }
          />
        </section>

        <section aria-label="Event">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Event
          </h3>
          <Row
            label="Event ID"
            value={<span className="font-mono text-xs">{event.id}</span>}
          />

          {event.kind === "plan_charge" && (
            <>
              <Row label="Plan" value={event.planCode} />
              <Row label="Cycle" value={event.billingCycle} />
              <Row label="Amount" value={formatCurrency(event.amount)} />
              <Row
                label="Source"
                value={PLAN_CHARGE_SOURCE_LABELS[event.source]}
              />
              <Row
                label="Status"
                value={
                  <Badge
                    variant={
                      event.status === "successful"
                        ? "success"
                        : event.status === "failed"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {PLAN_CHARGE_STATUS_LABELS[event.status]}
                  </Badge>
                }
              />
              {event.failureReason && (
                <Row label="Failure" value={event.failureReason} />
              )}
              <Row label="Created" value={fmtRelative(event.createdAt, nowMs)} />
            </>
          )}

          {event.kind === "checkout" && (
            <>
              <Row label="Order" value={event.orderId} />
              <Row label="Amount" value={formatCurrency(event.amount)} />
              <Row
                label="Method"
                value={CHECKOUT_METHOD_LABELS[event.method] ?? event.method}
              />
              {event.providerFee !== undefined && (
                <Row
                  label="Provider fee"
                  value={formatCurrency(event.providerFee)}
                />
              )}
              <Row
                label="Status"
                value={
                  <Badge
                    variant={
                      event.status === "successful"
                        ? "success"
                        : event.status === "failed"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {CHECKOUT_STATUS_LABELS[event.status]}
                  </Badge>
                }
              />
              <Row label="Settled" value={fmtRelative(event.settledAt, nowMs)} />
            </>
          )}

          {event.kind === "withdrawal" && (
            <>
              <Row label="Amount" value={formatCurrency(event.amount)} />
              <Row label="Fee (Atlas)" value={formatCurrency(event.fee)} />
              <Row label="Total debit" value={formatCurrency(event.total)} />
              <Row
                label="Destination"
                value={
                  event.destinationProvider +
                  " " +
                  event.destinationMaskedLabel
                }
              />
              <Row
                label="Status"
                value={
                  <Badge
                    variant={
                      event.status === "completed"
                        ? "success"
                        : event.status === "failed"
                        ? "danger"
                        : event.status === "pending_admin"
                        ? "warning"
                        : "info"
                    }
                  >
                    {WITHDRAWAL_STATUS_LABELS[event.status]}
                  </Badge>
                }
              />
              {event.autoApproved && <Row label="Path" value="Auto-approved" />}
              {event.approvalRequiredReasons.length > 0 && (
                <Row
                  label="Approval reasons"
                  value={
                    <ul
                      role="list"
                      className="flex flex-wrap justify-end gap-1"
                    >
                      {event.approvalRequiredReasons.map((r) => (
                        <li key={r}>
                          <Badge variant="warning" size="sm">
                            {WITHDRAWAL_APPROVAL_REASON_LABELS[r]}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  }
                />
              )}
              {event.failureReason && (
                <Row
                  label="Failure"
                  value={
                    WITHDRAWAL_FAILURE_LABELS[event.failureReason] ??
                    event.failureReason
                  }
                />
              )}
              {event.rejectionReason && (
                <Row label="Rejection reason" value={event.rejectionReason} />
              )}
              <Row
                label="Requested"
                value={fmtRelative(event.requestedAt, nowMs)}
              />
              {event.approvedAt && (
                <Row label="Approved" value={formatAbsolute(event.approvedAt)} />
              )}
              {event.completedAt && (
                <Row
                  label="Completed"
                  value={formatAbsolute(event.completedAt)}
                />
              )}
            </>
          )}

          {event.kind === "refund" && (
            <>
              <Row label="Order" value={event.orderId} />
              <Row label="Original event" value={event.originalPaymentId} />
              <Row label="Amount" value={formatCurrency(event.amount)} />
              <Row
                label="Customer rail"
                value={REFUND_RAIL_LABELS[event.customerRail]}
              />
              <Row label="Reason" value={event.reason} />
              <Row
                label="Status"
                value={
                  <Badge variant={event.settledAt ? "success" : "warning"}>
                    {event.settledAt ? "Settled" : "Processing"}
                  </Badge>
                }
              />
              <Row label="Created" value={fmtRelative(event.createdAt, nowMs)} />
            </>
          )}
        </section>

        {event.kind === "withdrawal" &&
          canApprove &&
          event.status === "pending_admin" && (
            <section
              aria-label="Actions"
              className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
            >
              <button
                type="button"
                onClick={() => onReject && onReject(event)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onApprove && onApprove(event)}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                Approve
              </button>
            </section>
          )}
      </div>
    </ModalShell>
  );
}