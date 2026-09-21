/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";

interface TreasuryFundModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    source: string;
    reference: string;
    description: string;
  }) => void;
}

export function TreasuryFundModal({
  open,
  onClose,
  onSubmit,
}: TreasuryFundModalProps) {
  const amountId = useId();
  const sourceId = useId();
  const referenceId = useId();
  const descriptionId = useId();

  const [amount, setAmount] = useState<number>(0);
  const [source, setSource] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(0);
      setSource("");
      setReference("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    if (amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (!source.trim()) {
      setError("Source is required.");
      return;
    }
    if (!reference.trim()) {
      setError("Reference is required.");
      return;
    }
    onSubmit({
      amount,
      source: source.trim(),
      reference: reference.trim(),
      description: description.trim(),
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Fund treasury"
      description="Record an inbound transfer from an external source into the platform cash account."
      size="md"
    >
      <div className="space-y-4">
        <SettingsField
          label="Amount (GHS)"
          hint="Recorded as a cash-in event."
          htmlFor={amountId}
        >
          <Input
            id={amountId}
            type="number"
            min={0}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </SettingsField>

        <SettingsField
          label="Source"
          hint="Where the funds came from. Bank name, external account, or reason."
          htmlFor={sourceId}
        >
          <Input
            id={sourceId}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="GCB Main Account"
          />
        </SettingsField>

        <SettingsField
          label="Reference"
          hint="Bank reference or transaction code."
          htmlFor={referenceId}
        >
          <Input
            id={referenceId}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="BANK-TOPUP-XXX"
          />
        </SettingsField>

        <SettingsField
          label="Description"
          hint="Optional context."
          htmlFor={descriptionId}
        >
          <textarea
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Why is this funding happening?"
          />
        </SettingsField>

        {error && (
          <p className="text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Fund treasury
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}