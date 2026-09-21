/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import type { Reseller } from "@/lib/admin/types/reseller";

const MIN_REASON_LENGTH = 10;

interface VerificationRejectModalProps {
  open: boolean;
  reseller: Reseller | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function VerificationRejectModal({
  open,
  reseller,
  onClose,
  onConfirm,
}: VerificationRejectModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  if (!open || !reseller) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REASON_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError(
        "Enter a reason of at least " +
          MIN_REASON_LENGTH +
          " characters. It is stored on the reseller's record."
      );
      return;
    }
    onConfirm(trimmed);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Reject verification for " + reseller.businessName}
      description="The reseller is notified by email and can resubmit documents."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Reject verification
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
          <p className="font-medium text-warning-900 dark:text-warning-100">
            What happens next
          </p>
          <p className="mt-1 text-warning-800 dark:text-warning-200">
            The reseller keeps their account but cannot sell until their
            verification is approved. They will see the reason below when
            they sign in.
          </p>
        </div>

        <SettingsField
          label="Reason"
          htmlFor="verification-reject-reason"
          required
          hint="Written to the reseller's record and visible to the reseller."
          error={error ?? undefined}
        >
          <textarea
            id="verification-reject-reason"
            className={cn(
              "min-h-[100px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Business registration certificate has expired. Please upload a current one."
            autoFocus
          />
        </SettingsField>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {trimmed.length} / {MIN_REASON_LENGTH} minimum characters
        </p>
      </div>
    </ModalShell>
  );
}