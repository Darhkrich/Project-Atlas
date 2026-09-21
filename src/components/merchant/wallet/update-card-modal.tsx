/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";

interface Props {
  open: boolean;
  submitting: boolean;
  onSubmit: (input: {
    cardRef: string;
    cardBrand: string;
    cardLast4: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  onClose: () => void;
}

function detectBrand(number: string): string {
  const digits = number.replace(/\D+/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^506(0|1|2|3|4|5|6|7|8|9)/.test(digits)) return "Verve";
  return "Card";
}

export function UpdateCardModal({
  open,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNumber("");
    setExpiry("");
    setCvv("");
    setName("");
    setError(null);
  }, [open]);

  const digits = number.replace(/\D+/g, "");
  const valid =
    digits.length >= 12 &&
    expiry.trim().length >= 4 &&
    cvv.trim().length >= 3 &&
    name.trim().length >= 2;

  const handleSubmit = async () => {
    if (!valid) {
      setError("Fill in every field.");
      return;
    }
    const brand = detectBrand(digits);
    const last4 = digits.slice(-4);
    const cardRef = "tok_" + crypto.randomUUID().slice(0, 12);
    const result = await onSubmit({ cardRef, cardBrand: brand, cardLast4: last4 });
    if (!result.ok) {
      setError(result.error ?? "Could not save the card.");
    }
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Update card"
      description="Card details are tokenized on save and never shown again."
    >
      <div className="space-y-4">
        <AtlasInput
          label="Card number"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            setError(null);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <AtlasInput
            label="Expiry"
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => {
              setExpiry(e.target.value);
              setError(null);
            }}
          />
          <AtlasInput
            label="CVV"
            type="text"
            placeholder="123"
            value={cvv}
            onChange={(e) => {
              setCvv(e.target.value);
              setError(null);
            }}
          />
        </div>

        <AtlasInput
          label="Name on card"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
        />

        <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          Once saved, only the card brand and last four digits remain visible.
          To change the card later, use Update card again.
        </p>

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
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
            {submitting ? "Saving" : "Save card"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}