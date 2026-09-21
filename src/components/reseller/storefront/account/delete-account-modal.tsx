/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";

interface Props {
  open: boolean;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const CONFIRM_PHRASE = "DELETE";

export function DeleteAccountModal({
  open,
  submitting,
  onConfirm,
  onClose,
}: Props) {
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    if (!open) return;
    setPhrase("");
  }, [open]);

  const valid = phrase.trim() === CONFIRM_PHRASE;

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Delete account"
      description="This cannot be undone."
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-700">
          Deleting your account removes:
        </p>
        <ul role="list" className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
          <li>Your wallet balance and ledger</li>
          <li>Your order history</li>
          <li>Your saved payment methods</li>
          <li>Your saved details and profile</li>
        </ul>

        <div>
          <label
            htmlFor="delete-account-confirm"
            className="mb-1 block text-xs font-medium text-neutral-600"
          >
            Type {CONFIRM_PHRASE} to confirm
          </label>
          <AtlasInput
            id="delete-account-confirm"
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!valid || submitting}
          >
            {submitting ? "Deleting" : "Delete account"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}