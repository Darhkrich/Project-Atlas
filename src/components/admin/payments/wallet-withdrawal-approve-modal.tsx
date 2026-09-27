"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/shared/format";
import type { WalletWithdrawalQueueRow } from "@/lib/admin/types/customer-wallet";
import {
  APPROVAL_REASON_LABEL,
  APPROVAL_REASON_VARIANT,
  PAYOUT_DIRECTION_LABEL,
  QUEUE_OWNER_TYPE_LABEL,
} from "@/lib/admin/wallets/wallet-labels";

interface Props {
  open: boolean;
  row: WalletWithdrawalQueueRow | null;
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
  submitting,
  onSubmit,
  onClose,
}: Props) {
  if (!row) return null;

  return (
    <ModalShell open={open} onClose={onClose} title="Approve withdrawal">
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <Row label="Owner" value={row.ownerName} />
          <Row
            label="Owner type"
            value={
              <Badge variant="info" size="sm">
                {QUEUE_OWNER_TYPE_LABEL[row.ownerType]}
              </Badge>
            }
          />
          {row.ownerEmail && <Row label="Email" value={row.ownerEmail} />}
          {row.ownerPhone && <Row label="Phone" value={row.ownerPhone} />}
          {row.storefrontName && (
            <Row label="Storefront" value={row.storefrontName} />
          )}
          <Row
            label={PAYOUT_DIRECTION_LABEL[row.payoutDirection]}
            value={row.payoutSummary}
          />
          <Row label="Amount" value={formatCurrency(row.amount)} />
          <Row label="Atlas fee" value={formatCurrency(row.fee)} />
          <Row
            label="Total debit"
            value={
              <span className="font-semibold">{formatCurrency(row.total)}</span>
            }
          />
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

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Approval marks the request completed and fires the treasury event
          for this pool. If the source wallet is short, the mutation marks
          the request failed automatically.
        </p>

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
            {submitting ? "Approving" : "Approve withdrawal"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}