/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/shared/format";
import type { WalletWithdrawalQueueRow } from "@/lib/admin/types/customer-wallet";
import {
  PAYOUT_DIRECTION_LABEL,
  QUEUE_OWNER_TYPE_LABEL,
} from "@/lib/admin/wallets/wallet-labels";
import { MIN_WALLET_REJECT_REASON_LENGTH } from "@/lib/admin/wallets/wallet-constants";

interface Props {
  open: boolean;
  row: WalletWithdrawalQueueRow | null;
  submitting: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

export function WalletWithdrawalRejectModal({
  open,
  row,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  if (!row) return null;

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_WALLET_REJECT_REASON_LENGTH;

  const handleSubmit = () => {
    if (!valid) {
      setError(
        "Enter a reason of at least " +
          MIN_WALLET_REJECT_REASON_LENGTH +
          " characters."
      );
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Reject withdrawal"
      description={row.ownerName + " - " + formatCurrency(row.amount)}
    >
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Owner type
            </span>
            <Badge variant="info" size="sm">
              {QUEUE_OWNER_TYPE_LABEL[row.ownerType]}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              {PAYOUT_DIRECTION_LABEL[row.payoutDirection]}
            </span>
            <span>{row.payoutSummary}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Total debit
            </span>
            <span className="font-semibold">{formatCurrency(row.total)}</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="wallet-reject-reason"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Reason (required)
          </label>
          <textarea
            id="wallet-reject-reason"
            aria-label="Rejection reason"
            aria-required="true"
            aria-invalid={!valid && error !== null}
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="Explain why this withdrawal is being rejected."
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          The request moves to history as rejected. The wallet balance is
          credited back automatically.
        </p>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            {submitting ? "Rejecting" : "Reject withdrawal"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}