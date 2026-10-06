/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useAuth } from "@/contexts/auth-context";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const CONFIRM_PHRASE = "DELETE";

export function DeleteAccountModal({
  open,
  onClose,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPhrase("");
      setError(null);
    }
  }, [open]);

  const canSubmit = phrase.trim() === CONFIRM_PHRASE;

  const handleConfirm = () => {
    const result = deleteAccount();
    if (!result.ok) {
      setError(result.error ?? "Could not delete the account.");
      return;
    }
    onClose();
    router.push("/merchant/login");
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Delete account"
      description="Your account will be removed. Your business data stays."
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Your products, orders, customers, and storefront settings are
            preserved. If you sign up again with the same email, your store
            will be exactly as you left it.
          </p>
        </div>

        <div>
          <label
            htmlFor="delete-account-confirm"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Type <span className="font-semibold">{CONFIRM_PHRASE}</span> to
            confirm.
          </label>
          <input
            id="delete-account-confirm"
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-danger-500 focus:ring-2 focus:ring-danger-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            placeholder={CONFIRM_PHRASE}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete account
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}