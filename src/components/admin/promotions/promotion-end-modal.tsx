/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { Promotion } from "@/lib/admin/types/promotion";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/admin/formatters";

const MIN_REASON_LENGTH = 8;

interface PromotionEndModalProps {
  open: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function PromotionEndModal({
  open,
  promotion,
  onClose,
  onConfirm,
}: PromotionEndModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError(null);
  }, [open]);

  if (!open || !promotion) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REASON_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError(
        "Reason must be at least " + MIN_REASON_LENGTH + " characters."
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
      title="End promotion early"
      description={promotion.name + " stops applying to new orders immediately."}
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
            End promotion
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Audience
            </span>
            <span className="font-medium capitalize">
              {promotion.audience}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Scheduled end
            </span>
            <span className="font-medium">
              {formatDate(promotion.endDate)}
            </span>
          </div>
        </div>

        <SettingsField
          label="Reason"
          htmlFor="promo-end-reason"
          required
          hint="Stored in the audit log. Orders already placed are not affected."
          error={error ?? undefined}
        >
          <textarea
            id="promo-end-reason"
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
            placeholder="e.g. Budget reallocation for Q1."
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