/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import type {
  TreasuryEvent,
  TreasuryReconciliationStatus,
} from "@/lib/domains/treasury/types";
import { TREASURY_KIND_LABELS } from "@/lib/domains/treasury/labels";

interface TreasuryReconcileModalProps {
  event: TreasuryEvent | null;
  onClose: () => void;
  onConfirm: (
    eventId: string,
    status: TreasuryReconciliationStatus,
    reference: string
  ) => void;
}

export function TreasuryReconcileModal({
  event,
  onClose,
  onConfirm,
}: TreasuryReconcileModalProps) {
  const referenceId = useId();
  const [status, setStatus] = useState<TreasuryReconciliationStatus>("matched");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setStatus("matched");
      setReference("");
      setError(null);
    }
  }, [event]);

  if (!event) return null;

  const handleConfirm = () => {
    if (status === "matched" && !reference.trim()) {
      setError("Bank reference is required when marking matched.");
      return;
    }
    onConfirm(event.id, status, reference.trim());
  };

  return (
    <ModalShell
      open={event !== null}
      onClose={onClose}
      title="Reconcile event"
      description="Match this event against a bank line, or mark it disputed."
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Event</span>
            <span className="font-mono text-xs">{event.id}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Kind</span>
            <span>{TREASURY_KIND_LABELS[event.kind]}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Reference</span>
            <span className="font-mono text-xs">{event.reference}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Status
          </p>
          <div role="group" aria-label="Reconciliation status" className="flex gap-2">
            <button
              type="button"
              aria-pressed={status === "matched"}
              onClick={() => setStatus("matched")}
              className={cn(
                "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                status === "matched"
                  ? "border-success-500 bg-success-50 text-success-700 dark:border-success-600 dark:bg-success-900/30 dark:text-success-300"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
              )}
            >
              Matched
            </button>
            <button
              type="button"
              aria-pressed={status === "disputed"}
              onClick={() => setStatus("disputed")}
              className={cn(
                "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                status === "disputed"
                  ? "border-danger-500 bg-danger-50 text-danger-700 dark:border-danger-600 dark:bg-danger-900/30 dark:text-danger-300"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
              )}
            >
              Disputed
            </button>
          </div>
        </div>

        <SettingsField
          label="Bank reference"
          hint="The bank line this event corresponds to."
          error={error ?? undefined}
          htmlFor={referenceId}
        >
          <Input
            id={referenceId}
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              if (error) setError(null);
            }}
            placeholder="BANK-LINE-XXXX"
          />
        </SettingsField>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}