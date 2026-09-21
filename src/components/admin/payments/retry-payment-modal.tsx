"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Payment } from "@/lib/admin/types/payment";

interface Props {
  open: boolean;
  payment: Payment | null;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function RetryPaymentModal({
  open,
  payment,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  if (!payment) return null;

  return (
    <ModalShell open={open} onClose={onClose} title="Retry payment">
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div className="flex justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Payment
            </span>
            <span className="font-mono text-xs">{payment.id}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Amount
            </span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Previous failure
            </span>
            <span>{payment.failureReason ?? "Unknown"}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          The payment moves back to pending and re-enters the rail. If the
          provider declines again, it fails with the new reason recorded.
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
            {submitting ? "Retrying" : "Retry payment"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}