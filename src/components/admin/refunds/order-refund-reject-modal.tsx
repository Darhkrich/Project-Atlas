"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Refund } from "@/lib/admin/types/refund";

interface OrderRefundRejectModalProps {
  refund: Refund | null;
  onClose: () => void;
  onConfirm: (refundId: string, reason: string) => void;
}

export function OrderRefundRejectModal({
  refund,
  onClose,
  onConfirm,
}: OrderRefundRejectModalProps) {
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (refund) {
      setReason("");
      setError(null);
    }
  }, [refund]);

  if (!refund) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }
    onConfirm(refund.id, trimmed);
  };

  return (
    <ModalShell
      open={refund !== null}
      onClose={onClose}
      title="Reject refund"
      description="Rejection is final. The claimant can file a new request through support."
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Refund</span>
            <span className="font-mono text-xs font-medium">{refund.id}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Amount</span>
            <span className="font-semibold">{formatCurrency(refund.amount)}</span>
          </div>
        </div>

        <SettingsField
          label="Rejection reason"
          hint="At least 10 characters. Recorded on the timeline."
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
            placeholder="Why is this refund being rejected?"
            aria-invalid={error ? true : undefined}
          />
        </SettingsField>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            Reject refund
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}