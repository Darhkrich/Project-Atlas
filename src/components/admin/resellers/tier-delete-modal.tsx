/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { ResellerTier } from "@/lib/admin/types/commission";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";

interface TierDeleteModalProps {
  open: boolean;
  tier: ResellerTier | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function TierDeleteModal({
  open,
  tier,
  onClose,
  onConfirm,
}: TierDeleteModalProps) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setError(null);
  }, [open]);

  if (!open || !tier) return null;

  const matches = typed.trim() === tier.name;

  const handleSubmit = () => {
    if (!matches) {
      setError(`Type "${tier.name}" exactly to confirm.`);
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Delete tier"
      description={`${tier.name} will be permanently removed from the tier catalog.`}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!matches}
          >
            Delete tier
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Deletion cannot be undone. A record of the deletion is written to the
          tier audit log.
        </p>
        <SettingsField
          label={`Type ${tier.name} to confirm`}
          htmlFor="tier-delete-confirm"
          required
          error={error ?? undefined}
        >
          <Input
            id="tier-delete-confirm"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={tier.name}
            autoFocus
          />
        </SettingsField>
      </div>
    </ModalShell>
  );
}