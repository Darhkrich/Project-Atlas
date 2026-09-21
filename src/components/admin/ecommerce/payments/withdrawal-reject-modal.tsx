"use client";

import { useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import type { WithdrawalRequest } from "@/lib/admin/types/merchant-money";

interface Props {
  open: boolean;
  withdrawal: WithdrawalRequest | null;
  merchantName: string;
  submitting: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

export function WithdrawalRejectModal({
  open,
  withdrawal,
  merchantName,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const invalid = trimmed.length === 0;

  if (!withdrawal) return null;

  return (
    <ModalShell open={open} onClose={onClose} title="Reject withdrawal">
      <div className="space-y-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">Merchant</dt>
            <dd className="font-medium">{merchantName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">Amount</dt>
            <dd>{formatCurrency(withdrawal.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">
              Total debit
            </dt>
            <dd>{formatCurrency(withdrawal.total)}</dd>
          </div>
        </dl>

        <div>
          <label
            htmlFor="reject-reason"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Reason (required)
          </label>
          <textarea
            id="reject-reason"
            aria-label="Rejection reason"
            aria-required="true"
            aria-invalid={invalid}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            The merchant sees this reason.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={invalid || submitting}
            onClick={() => onSubmit(trimmed)}
          >
            {submitting ? "Rejecting" : "Reject withdrawal"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}