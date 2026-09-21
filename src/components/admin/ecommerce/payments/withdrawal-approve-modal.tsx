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
  settlementBalance: number;
  submitting: boolean;
  onSubmit: (note: string) => void;
  onClose: () => void;
}

export function WithdrawalApproveModal({
  open,
  withdrawal,
  merchantName,
  settlementBalance,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [note, setNote] = useState("");

  if (!withdrawal) return null;

  const insufficient = settlementBalance < withdrawal.total;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Approve withdrawal"
    >
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
            <dt className="text-neutral-500 dark:text-neutral-400">Atlas fee</dt>
            <dd>{formatCurrency(withdrawal.fee)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-800">
            <dt className="text-neutral-700 dark:text-neutral-300">
              Total debit
            </dt>
            <dd className="font-semibold">{formatCurrency(withdrawal.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">
              Settlement balance
            </dt>
            <dd>{formatCurrency(settlementBalance)}</dd>
          </div>
        </dl>

        {insufficient && (
          <div
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          >
            Settlement balance no longer covers this withdrawal. Submitting will
            mark it failed with reason insufficient balance.
          </div>
        )}

        <div>
          <label
            htmlFor="approve-note"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Note (optional)
          </label>
          <textarea
            id="approve-note"
            aria-label="Approval note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={submitting}
            onClick={() => onSubmit(note)}
          >
            {submitting ? "Approving" : insufficient ? "Attempt approval" : "Approve"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}