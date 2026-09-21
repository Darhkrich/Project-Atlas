/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import type { ResellerSavedPaymentMethod } from "@/lib/reseller/types/wallet";
import {
  MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH,
  MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH,
} from "@/lib/reseller/wallet/wallet-constants";

interface Props {
  open: boolean;
  method: ResellerSavedPaymentMethod | null;
  submitting: boolean;
  onSubmit: (patch: { label: string }) => void;
  onClose: () => void;
}

export function EditSavedMethodModal({
  open,
  method,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !method) return;
    setLabel(method.label);
    setError(null);
  }, [open, method]);

  if (!method) return null;

  const trimmed = label.trim();
  const valid =
    trimmed.length >= MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH &&
    trimmed.length <= MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH;

  const handleSubmit = () => {
    if (!valid) {
      setError(
        "Label must be between " +
          MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH +
          " and " +
          MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH +
          " characters."
      );
      return;
    }
    onSubmit({ label: trimmed });
  };

  const isCard = method.methodId === "card";

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Edit saved method"
      description={method.provider + " " + method.maskedLabel}
    >
      <div className="space-y-4">
        <AtlasInput
          label="Label"
          type="text"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            setError(null);
          }}
          error={error ?? undefined}
        />

        {isCard && (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            Card details cannot be edited here. Delete this card and add a new
            one through a funding flow to update the number or expiry.
          </p>
        )}

        <div className="flex gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            {submitting ? "Saving" : "Save changes"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}