/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";

const MIN_REASON_LENGTH = 8;

interface TemplateDeleteModalProps {
  open: boolean;
  template: EcommerceTemplate | null;
  usageCount: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function TemplateDeleteModal({
  open,
  template,
  usageCount,
  onClose,
  onConfirm,
}: TemplateDeleteModalProps) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setReason("");
    setError(null);
  }, [open]);

  if (!open || !template) return null;

  const matches = typed.trim() === template.name;
  const trimmedReason = reason.trim();
  const reasonValid = trimmedReason.length >= MIN_REASON_LENGTH;
  const canSubmit = matches && reasonValid;

  const handleSubmit = () => {
    if (!matches) {
      setError("Type " + template.name + " exactly to confirm.");
      return;
    }
    if (!reasonValid) {
      setError(
        "Reason must be at least " + MIN_REASON_LENGTH + " characters."
      );
      return;
    }
    onConfirm(trimmedReason);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Delete " + template.name}
      description="Permanent. A deletion entry is written to the audit log."
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
            Delete template
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {usageCount > 0 && (
          <div
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          >
            <p className="font-medium">
              {usageCount} merchant{usageCount === 1 ? "" : "s"} currently use
              this template.
            </p>
            <p className="mt-1">
              Their storefronts will break unless migrated to another
              template first. Migrate merchants before deleting, or accept
              that their storefronts render with the fallback.
            </p>
          </div>
        )}
        {usageCount === 0 && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No merchants use this template. Deleting removes it from the
            catalog permanently.
          </p>
        )}

        <SettingsField
          label={"Type " + template.name + " to confirm"}
          htmlFor="template-delete-confirm"
          required
          error={error && !matches ? error : undefined}
        >
          <Input
            id="template-delete-confirm"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            placeholder={template.name}
            autoComplete="off"
          />
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="template-delete-reason"
          required
          hint="Stored in the audit log. Visible to other admins."
          error={error && matches && !reasonValid ? error : undefined}
        >
          <textarea
            id="template-delete-reason"
            className={cn(
              "min-h-[80px] w-full rounded-md border p-2 text-sm",
              "border-neutral-300 bg-white",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            )}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Superseded by Cosmetics Luxe after redesign."
          />
        </SettingsField>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {trimmedReason.length} / {MIN_REASON_LENGTH} minimum characters
        </p>
      </div>
    </ModalShell>
  );
}