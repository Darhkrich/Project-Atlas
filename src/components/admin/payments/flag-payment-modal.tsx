/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Payment, PaymentFlagReason } from "@/lib/admin/types/payment";
import { PAYMENT_FLAG_REASON_LABEL } from "@/lib/admin/payments/payments-labels";
import { PAYMENTS_FLAG_REASONS } from "@/lib/admin/payments/payments-constants";

interface Props {
  open: boolean;
  payment: Payment | null;
  submitting: boolean;
  onSubmit: (reason: PaymentFlagReason, note: string) => void;
  onClose: () => void;
}

export function FlagPaymentModal({
  open,
  payment,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [reason, setReason] = useState<PaymentFlagReason>("provider_mismatch");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason("provider_mismatch");
    setNote("");
  }, [open]);

  if (!payment) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Flag payment"
      description={payment.id + " - " + formatCurrency(payment.amount)}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="flag-reason"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Reason
          </label>
          <select
            id="flag-reason"
            aria-label="Flag reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as PaymentFlagReason)}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {PAYMENTS_FLAG_REASONS.map((r) => (
              <option key={r} value={r}>
                {PAYMENT_FLAG_REASON_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="flag-note"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Note (optional)
          </label>
          <textarea
            id="flag-note"
            aria-label="Flag note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          The flag appears on the ledger row and in the payment detail
          drawer. Finance and Operations both see flags.
        </p>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSubmit(reason, note)}
            disabled={submitting}
          >
            {submitting ? "Flagging" : "Flag payment"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}