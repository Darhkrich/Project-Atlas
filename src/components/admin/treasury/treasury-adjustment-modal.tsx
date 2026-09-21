/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";

interface TreasuryAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    direction: "credit" | "debit";
    amount: number;
    reason: string;
  }) => void;
}

export function TreasuryAdjustmentModal({
  open,
  onClose,
  onSubmit,
}: TreasuryAdjustmentModalProps) {
  const amountId = useId();
  const reasonId = useId();

  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDirection("credit");
      setAmount(0);
      setReason("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    if (amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }
    onSubmit({ direction, amount, reason: reason.trim() });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Create adjustment"
      description="Correction entry for the treasury. Adjustments over the dual-approval threshold require a second admin."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Direction
          </p>
          <div role="group" aria-label="Adjustment direction" className="flex gap-2">
            <button
              type="button"
              aria-pressed={direction === "credit"}
              onClick={() => setDirection("credit")}
              className={cn(
                "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                direction === "credit"
                  ? "border-success-500 bg-success-50 text-success-700 dark:border-success-600 dark:bg-success-900/30 dark:text-success-300"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
              )}
            >
              Credit (in)
            </button>
            <button
              type="button"
              aria-pressed={direction === "debit"}
              onClick={() => setDirection("debit")}
              className={cn(
                "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                direction === "debit"
                  ? "border-danger-500 bg-danger-50 text-danger-700 dark:border-danger-600 dark:bg-danger-900/30 dark:text-danger-300"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
              )}
            >
              Debit (out)
            </button>
          </div>
        </div>

        <SettingsField label="Amount (GHS)" htmlFor={amountId}>
          <Input
            id={amountId}
            type="number"
            min={0}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </SettingsField>

        <SettingsField
          label="Reason"
          hint="At least 10 characters. Recorded on the audit trail."
          error={error ?? undefined}
          htmlFor={reasonId}
        >
          <textarea
            id={reasonId}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="What is being corrected?"
          />
        </SettingsField>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Create adjustment
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}