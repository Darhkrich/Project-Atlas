/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import type { TreasuryEvent } from "@/lib/admin/types/treasury";
import { TREASURY_KIND_LABELS } from "@/lib/admin/treasury/treasury-labels";

interface TreasuryRejectOutboundModalProps {
  event: TreasuryEvent | null;
  onClose: () => void;
  onConfirm: (eventId: string, reason: string) => void;
}

export function TreasuryRejectOutboundModal({
  event,
  onClose,
  onConfirm,
}: TreasuryRejectOutboundModalProps) {
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setReason("");
      setError(null);
    }
  }, [event]);

  if (!event) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }
    onConfirm(event.id, trimmed);
  };

  return (
    <ModalShell
      open={event !== null}
      onClose={onClose}
      title="Reject outbound"
      description="Rejection is final. A new event must be created if the transfer is still needed."
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
            <span className="text-neutral-500">Amount</span>
            <span className="font-semibold">{formatCurrency(event.amount)}</span>
          </div>
        </div>

        <SettingsField
          label="Rejection reason"
          hint="At least 10 characters."
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
            placeholder="Why is this outbound being rejected?"
          />
        </SettingsField>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            Reject outbound
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}