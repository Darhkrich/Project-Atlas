/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";

interface TreasuryTransferToBankModalProps {
  open: boolean;
  availableBalance: number;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    destinationId: string;
    destinationName: string;
    reference: string;
    description: string;
  }) => void;
}

const DESTINATIONS = [
  { id: "gcb-main", name: "GCB Main Account" },
  { id: "ecobank-ops", name: "Ecobank Operations" },
  { id: "fidelity-reserve", name: "Fidelity Reserve" },
];

export function TreasuryTransferToBankModal({
  open,
  availableBalance,
  onClose,
  onSubmit,
}: TreasuryTransferToBankModalProps) {
  const amountId = useId();
  const destinationId = useId();
  const referenceId = useId();
  const descriptionId = useId();

  const [amount, setAmount] = useState<number>(0);
  const [destination, setDestination] = useState(DESTINATIONS[0].id);
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(0);
      setDestination(DESTINATIONS[0].id);
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
    if (amount > availableBalance) {
      setError(
        "Amount exceeds available balance (" + formatCurrency(availableBalance) + ")."
      );
      return;
    }
    if (!reference.trim()) {
      setError("Reference is required.");
      return;
    }
    const dest = DESTINATIONS.find((d) => d.id === destination);
    if (!dest) {
      setError("Destination not found.");
      return;
    }
    onSubmit({
      amount,
      destinationId: dest.id,
      destinationName: dest.name,
      reference: reference.trim(),
      description: description.trim(),
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Transfer to bank"
      description="Sweep funds from the treasury to an Atlas-owned bank account. Always requires a second admin's approval before the cash moves."
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-info-50 p-3 text-sm dark:bg-info-900/20">
          <p className="text-info-800 dark:text-info-200">
            Available balance: {formatCurrency(availableBalance)}
          </p>
          <p className="mt-1 text-xs text-info-800/80 dark:text-info-200/80">
            Dual approval required. You will create the event as pending. A
            different admin must approve it before settlement.
          </p>
        </div>

        <SettingsField label="Amount (GHS)" htmlFor={amountId}>
          <Input
            id={amountId}
            type="number"
            min={0}
            max={availableBalance}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </SettingsField>

        <SettingsField label="Destination" htmlFor={destinationId}>
          <select
            id={destinationId}
            aria-label="Bank destination"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {DESTINATIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Reference"
          hint="Bank reference or transfer code."
          htmlFor={referenceId}
        >
          <Input
            id={referenceId}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="SWEEP-XXX"
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
            Create transfer
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}