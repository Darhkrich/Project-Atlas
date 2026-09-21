"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/shared/format";
import { formatAbsolute, formatRelative } from "@/lib/shared/format";
import {
  isCustomerQueueRow,
  isStorefrontQueueRow,
  type WalletWithdrawalQueueRow,
} from "@/lib/admin/types/customer-wallet";
import type {
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type { StorefrontRefundRequest } from "@/lib/domains/wallet/storefront-user-types";
import {
  APPROVAL_REASON_LABEL,
  APPROVAL_REASON_VARIANT,
  QUEUE_OWNER_TYPE_LABEL,
  QUEUE_OWNER_TYPE_VARIANT,
  WITHDRAWAL_FAILURE_LABEL,
  maskSourceLabel,
} from "@/lib/admin/wallets/wallet-labels";

interface Props {
  open: boolean;
  row: WalletWithdrawalQueueRow | null;
  nowMs: number | null;
  canApprove: boolean;
  onApprove: (row: WalletWithdrawalQueueRow) => void;
  onReject: (row: WalletWithdrawalQueueRow) => void;
  onClose: () => void;
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

function CustomerSourceBlock({
  raw,
}: {
  raw: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry;
}) {
  return (
    <>
      <Row
        label="Source payment"
        value={<span className="font-mono text-xs">{raw.sourcePaymentId}</span>}
      />
      <Row label="Original amount" value={formatCurrency(raw.sourceAmount)} />
    </>
  );
}

function StorefrontSourceBlock({
  raw,
  nowMs,
}: {
  raw: StorefrontRefundRequest;
  nowMs: number | null;
}) {
  const fundedLabel = nowMs
    ? formatRelative(raw.sourceCreatedAt, nowMs)
    : formatAbsolute(raw.sourceCreatedAt);
  return (
    <>
      <Row
        label="Source payment"
        value={<span className="font-mono text-xs">{raw.sourcePaymentId}</span>}
      />
      <Row label="Original amount" value={formatCurrency(raw.sourceAmount)} />
      <Row label="Funded" value={fundedLabel} />
      <Row
        label="Transaction ref"
        value={<span className="font-mono text-xs">{raw.transactionRef}</span>}
      />
    </>
  );
}

function RejectionBlock({ reason }: { reason: string }) {
  return (
    <section aria-label="Rejection">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Rejection
      </h3>
      <p className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
        {reason}
      </p>
    </section>
  );
}

function FailureBlock({ reason }: { reason: string }) {
  return (
    <section aria-label="Failure">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Failure
      </h3>
      <p className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200">
        {WITHDRAWAL_FAILURE_LABEL[reason] ?? reason}
      </p>
    </section>
  );
}

function ApprovalReasonsBlock({
  reasons,
}: {
  reasons: WalletWithdrawalQueueRow["approvalRequiredReasons"];
}) {
  return (
    <section aria-label="Approval reasons">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Requires approval because
      </h3>
      <ul role="list" className="flex flex-wrap gap-1">
        {reasons.map((reason) => (
          <li key={reason}>
            <Badge variant={APPROVAL_REASON_VARIANT[reason]} size="sm">
              {APPROVAL_REASON_LABEL[reason]}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WalletWithdrawalDetailModal({
  open,
  row,
  nowMs,
  canApprove,
  onApprove,
  onReject,
  onClose,
}: Props) {
  if (!row) return null;

  const pendingAdmin = row.status === "pending_admin";
  const canAct = canApprove && pendingAdmin;

  const requestedLabel = nowMs
    ? formatRelative(row.requestedAt, nowMs)
    : formatAbsolute(row.requestedAt);

  const rejectionReason =
    "rejectionReason" in row.raw ? row.raw.rejectionReason : undefined;
  const failureReason =
    "failureReason" in row.raw ? row.raw.failureReason : undefined;

  return (
    <ModalShell open={open} onClose={onClose} title="Withdrawal detail">
      <div className="space-y-5">
        <section aria-label="Withdrawal">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
            <Badge variant={QUEUE_OWNER_TYPE_VARIANT[row.ownerType]}>
              {QUEUE_OWNER_TYPE_LABEL[row.ownerType]}
            </Badge>
            {row.autoApproved && (
              <Badge variant="brand" size="sm">
                Auto approved
              </Badge>
            )}
          </div>

          <div className="mt-3">
            <Row
              label="Withdrawal ID"
              value={<span className="font-mono text-xs">{row.id}</span>}
            />
            <Row label="Owner" value={row.ownerName} />
            {row.ownerEmail && <Row label="Email" value={row.ownerEmail} />}
            {row.ownerPhone && <Row label="Phone" value={row.ownerPhone} />}
            {row.storefrontName && (
              <Row label="Storefront" value={row.storefrontName} />
            )}
            <Row label="Amount" value={formatCurrency(row.amount)} />
            <Row label="Fee" value={formatCurrency(row.fee)} />
            <Row
              label="Total debit"
              value={
                <span className="font-semibold">
                  {formatCurrency(row.total)}
                </span>
              }
            />
            <Row label="Requested" value={requestedLabel} />
          </div>
        </section>

        <section aria-label="Refund source">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Refund source
          </h3>
          <Row
            label="Rail"
            value={maskSourceLabel(row.sourceProvider, row.sourceMaskedLabel)}
          />
          {isStorefrontQueueRow(row) && (
            <StorefrontSourceBlock raw={row.raw} nowMs={nowMs} />
          )}
          {isCustomerQueueRow(row) && <CustomerSourceBlock raw={row.raw} />}
        </section>

        {row.approvalRequiredReasons.length > 0 && (
          <ApprovalReasonsBlock reasons={row.approvalRequiredReasons} />
        )}

        {rejectionReason && <RejectionBlock reason={rejectionReason} />}

        {failureReason && <FailureBlock reason={failureReason} />}

        {canAct && (
          <section
            aria-label="Actions"
            className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
          >
            <Button variant="ghost" size="sm" onClick={() => onReject(row)}>
              Reject
            </Button>
            <Button variant="primary" size="sm" onClick={() => onApprove(row)}>
              Approve withdrawal
            </Button>
          </section>
        )}

        {!canAct && pendingAdmin && !canApprove && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            You do not have permission to approve or reject wallet
            withdrawals.
          </p>
        )}

        <div className="flex justify-end border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}