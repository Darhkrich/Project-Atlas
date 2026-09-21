"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/shared/format";
import type {
  CustomerWallet,
  WalletWithdrawalQueueRow,
} from "@/lib/admin/types/customer-wallet";
import {
  APPROVAL_REASON_LABEL,
  APPROVAL_REASON_VARIANT,
  QUEUE_OWNER_TYPE_LABEL,
  maskSourceLabel,
} from "@/lib/admin/wallets/wallet-labels";

interface Props {
  open: boolean;
  row: WalletWithdrawalQueueRow | null;
  wallet: CustomerWallet | null;
  submitting: boolean;
  onSubmit: () => void;
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

export function WalletWithdrawalApproveModal({
  open,
  row,
  wallet,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  if (!row) return null;

  const isStorefront = row.ownerType === "storefront_user";
  const insufficient = wallet ? wallet.balance < row.total : false;
  const remainingAfter = wallet ? wallet.balance - row.total : 0;

  return (
    <ModalShell open={open} onClose={onClose} title="Approve withdrawal">
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <Row label="Owner" value={row.ownerName} />
          <Row
            label="Owner type"
            value={
              <Badge variant={isStorefront ? "info" : "brand"} size="sm">
                {QUEUE_OWNER_TYPE_LABEL[row.ownerType]}
              </Badge>
            }
          />
          {isStorefront && row.ownerEmail && (
            <Row label="Email" value={row.ownerEmail} />
          )}
          {isStorefront && row.ownerPhone && (
            <Row label="Phone" value={row.ownerPhone} />
          )}
          {isStorefront && row.storefrontName && (
            <Row label="Storefront" value={row.storefrontName} />
          )}
          <Row
            label="Refund rail"
            value={maskSourceLabel(row.sourceProvider, row.sourceMaskedLabel)}
          />
          <Row label="Amount" value={formatCurrency(row.amount)} />
          <Row label="Atlas fee" value={formatCurrency(row.fee)} />
          <Row
            label="Total debit"
            value={
              <span className="font-semibold">{formatCurrency(row.total)}</span>
            }
          />
          {wallet && (
            <Row
              label="Wallet balance"
              value={formatCurrency(wallet.balance)}
            />
          )}
        </div>

        {row.approvalRequiredReasons.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Requires approval because
            </p>
            <ul role="list" className="flex flex-wrap gap-1">
              {row.approvalRequiredReasons.map((reason) => (
                <li key={reason}>
                  <Badge variant={APPROVAL_REASON_VARIANT[reason]} size="sm">
                    {APPROVAL_REASON_LABEL[reason]}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {wallet && !insufficient && (
          <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
            <Row
              label="Remaining after approval"
              value={
                <span className="font-semibold">
                  {formatCurrency(remainingAfter)}
                </span>
              }
            />
          </div>
        )}

        {insufficient && (
          <div
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          >
            Wallet balance no longer covers this withdrawal. Submitting will
            mark it failed with insufficient balance.
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Approving"
              : insufficient
              ? "Attempt approval"
              : "Approve withdrawal"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}