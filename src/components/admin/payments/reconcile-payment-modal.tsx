/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Payment } from "@/lib/admin/types/payment";

interface Props {
  open: boolean;
  payment: Payment | null;
  submitting: boolean;
  onSubmit: (providerReference: string, note: string) => void;
  onClose: () => void;
}

export function ReconcilePaymentModal({
  open,
  payment,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [providerReference, setProviderReference] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setProviderReference("");
    setNote("");
    setError(null);
  }, [open]);

  if (!payment) return null;

  const trimmedRef = providerReference.trim();
  const valid = trimmedRef.length > 0;

  const handleSubmit = () => {
    if (!valid) {
      setError("Provider reference is required.");
      return;
    }
    onSubmit(trimmedRef, note);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Reconcile payment"
      description={payment.id + " - " + formatCurrency(payment.amount)}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="reconcile-ref"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Provider reference
          </label>
          <Input
            id="reconcile-ref"
            aria-label="Provider reference"
            value={providerReference}
            onChange={(e) => {
              setProviderReference(e.target.value);
              setError(null);
            }}
          />
        </div>

        <div>
          <label
            htmlFor="reconcile-note"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Note (optional)
          </label>
          <textarea
            id="reconcile-note"
            aria-label="Reconciliation note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          A reconciliation record is created. If the payment was failed and
          the provider confirms success, the payment is marked successful.
        </p>

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
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            {submitting ? "Saving" : "Save reconciliation"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}