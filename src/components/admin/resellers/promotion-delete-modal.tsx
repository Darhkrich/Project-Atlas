/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";

interface PromotionDeleteModalProps {
  open: boolean;
  promotion: ResellerPromotion | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function PromotionDeleteModal({
  open,
  promotion,
  onClose,
  onConfirm,
}: PromotionDeleteModalProps) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setError(null);
  }, [open]);

  if (!open || !promotion) return null;

  const matches = typed.trim() === promotion.name;

  const handleSubmit = () => {
    if (!matches) {
      setError(`Type "${promotion.name}" exactly to confirm.`);
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Delete promotion"
      description={`${promotion.name} will be permanently removed.`}
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
            Delete promotion
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Deletion cannot be undone. The promotion record is removed and a
          deletion entry is written to the audit log.
        </p>
        <SettingsField
          label={`Type ${promotion.name} to confirm`}
          htmlFor="promo-delete-confirm"
          required
          error={error ?? undefined}
        >
          <Input
            id="promo-delete-confirm"
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
            placeholder={promotion.name}
            autoFocus
          />
        </SettingsField>
      </div>
    </ModalShell>
  );
}