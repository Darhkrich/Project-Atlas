/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";

const MIN_REASON_LENGTH = 10;

interface StorefrontBulkDisableModalProps {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function StorefrontBulkDisableModal({
  open,
  count,
  onClose,
  onConfirm,
}: StorefrontBulkDisableModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REASON_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError(
        "Reason must be at least " +
          MIN_REASON_LENGTH +
          " characters. It is stored on each storefront and in the audit log."
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
      title={
        "Disable " +
        count +
        " storefront" +
        (count === 1 ? "" : "s") +
        "?"
      }
      description="The selected storefronts will go offline immediately. Customers will not be able to place new orders."
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
            Disable {count} storefront{count === 1 ? "" : "s"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100">
          <p className="font-medium">Downstream impact</p>
          <p className="mt-1">
            Every customer shopping on these storefronts will see the
            storefront go offline. Existing orders and storefront users are
            unaffected.
          </p>
        </div>

        <SettingsField
          label="Reason"
          htmlFor="bulk-disable-reason"
          required
          hint="Stored on every selected storefront and in the audit log."
          error={error ?? undefined}
        >
          <textarea
            id="bulk-disable-reason"
            className={cn(
              "min-h-[88px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Compliance review of Q4 storefront pricing."
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