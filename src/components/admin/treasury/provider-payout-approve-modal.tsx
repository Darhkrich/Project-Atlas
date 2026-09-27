/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";

export type ProviderPayoutAction =
  | "submit"
  | "approve"
  | "settle"
  | "cancel"
  | "fail";

export function ProviderPayoutApproveModal({
  open,
  action,
  amount,
  requireReason,
  onClose,
  onConfirm,
}: {
  open: boolean;
  action: ProviderPayoutAction;
  amount: number;
  requireReason: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open, action]);

  if (!open) return null;

  const titles: Record<ProviderPayoutAction, string> = {
    submit: "Submit batch for approval",
    approve: "Approve payout batch",
    settle: "Settle payout batch",
    cancel: "Cancel payout batch",
    fail: "Mark payout batch failed",
  };

  const descriptions: Record<ProviderPayoutAction, string> = {
    submit:
      "Once submitted, the batch is locked. Only approval and cancel are available.",
    approve:
      "Approving locks the batch and readies it for settlement. You cannot approve your own batch.",
    settle:
      "Settling writes a provider payout debit to the treasury for " +
      formatCurrency(amount) +
      ". This cannot be undone.",
    cancel:
      "Cancelling a batch is terminal. A new batch can be created for the same provider and period.",
    fail:
      "Marking the batch failed is terminal. No treasury event is written.",
  };

  const confirmLabels: Record<ProviderPayoutAction, string> = {
    submit: "Submit",
    approve: "Approve",
    settle: "Settle",
    cancel: "Cancel batch",
    fail: "Mark failed",
  };

  const handleConfirm = () => {
    if (requireReason && reason.trim().length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }
    onConfirm(requireReason ? reason.trim() : undefined);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={titles[action]}
      description={descriptions[action]}
      size="sm"
    >
      <div className="space-y-4">
        {requireReason && (
          <label className="block">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Reason
            </span>
            <Input
              className="mt-1"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="At least 10 characters"
              autoFocus
            />
          </label>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Back
          </Button>
          <Button
            variant={action === "cancel" || action === "fail" ? "destructive" : "primary"}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmLabels[action]}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}