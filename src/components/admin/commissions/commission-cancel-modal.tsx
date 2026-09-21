/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";

interface Props {
  open: boolean;
  commissionIds: string[];
  submitting: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

const MIN_REASON_LENGTH = 10;

export function CommissionCancelModal({
  open,
  commissionIds,
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

  if (!open) return null;

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_REASON_LENGTH;
  const isBulk = commissionIds.length > 1;

  const handleSubmit = () => {
    if (!valid) {
      setError(
        "Reason must be at least " + MIN_REASON_LENGTH + " characters."
      );
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isBulk ? "Cancel commissions" : "Cancel commission"}
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {isBulk
            ? "Cancelling " +
              commissionIds.length +
              " commissions. This cannot be undone."
            : "Cancelling commission " +
              commissionIds[0] +
              ". This cannot be undone."}
        </p>

        <div>
          <label
            htmlFor="commission-cancel-reason"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Reason (required)
          </label>
          <textarea
            id="commission-cancel-reason"
            aria-label="Cancellation reason"
            aria-required="true"
            aria-invalid={!valid && error !== null}
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="Explain why these commissions are being cancelled."
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Stored on the audit trail for each commission.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Keep commissions
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            {submitting
              ? "Cancelling"
              : isBulk
              ? "Cancel " + commissionIds.length + " commissions"
              : "Cancel commission"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}