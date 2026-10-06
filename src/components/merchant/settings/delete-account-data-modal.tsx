/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useAuth } from "@/contexts/auth-context";

interface DeleteAccountDataModalProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
}

const EMAIL_KEYED_KEYS = [
  "atlas-store-products",
  "atlas-customer-orders",
];

const SLUG_KEYED_KEYS = [
  "atlas-store-customers",
  "atlas-merchant-categories",
  "atlas-merchant-customer-reports",
  "atlas-merchant-preferences",
  "atlas-merchant-notifications",
  "atlas-merchant-support-tickets",
  "atlas-merchant-customer-threads",
];

const SLUG_SUFFIXED_KEYS = [
  "atlas-merchant-storefront",
  "atlas-merchant-storefront-shipping",
  "atlas-merchant-storefront-publish-log",
  "atlas-merchant-onboarding-draft",
];

function clearEmailEntry(key: string, email: string): void {
  const raw = window.localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      delete obj[email];
      window.localStorage.setItem(key, JSON.stringify(obj));
    }
  } catch {
    window.localStorage.removeItem(key);
  }
}

function clearSlugEntry(key: string, slug: string): void {
  const raw = window.localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      delete obj[slug];
      window.localStorage.setItem(key, JSON.stringify(obj));
    }
  } catch {
    window.localStorage.removeItem(key);
  }
}

function wipeMerchantData(email: string, slug: string): void {
  for (const key of EMAIL_KEYED_KEYS) clearEmailEntry(key, email);
  for (const key of SLUG_KEYED_KEYS) clearSlugEntry(key, slug);
  for (const base of SLUG_SUFFIXED_KEYS) {
    const direct = window.localStorage.getItem(base);
    if (direct) {
      try {
        const parsed: unknown = JSON.parse(direct);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const obj = parsed as Record<string, unknown>;
          delete obj[slug];
          window.localStorage.setItem(base, JSON.stringify(obj));
        }
      } catch {
        window.localStorage.removeItem(base);
      }
    }
    window.localStorage.removeItem(base + "-" + slug);
  }
  window.localStorage.removeItem("atlas-store-users-" + slug);
  window.localStorage.removeItem("atlas-customer-auth-" + slug);
}

export function DeleteAccountDataModal({
  open,
  onClose,
  storeSlug,
}: DeleteAccountDataModalProps) {
  const router = useRouter();
  const { user, deleteAccount } = useAuth();
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);

  const email = user?.email ?? "";

  useEffect(() => {
    if (!open) {
      setPhrase("");
      setError(null);
    }
  }, [open]);

  const canSubmit =
    phrase.trim().toLowerCase() === email.toLowerCase() && email.length > 0;

  const handleConfirm = () => {
    if (!email) {
      setError("No active session.");
      return;
    }
    wipeMerchantData(email, storeSlug);
    const result = deleteAccount();
    if (!result.ok) {
      setError(result.error ?? "Could not complete the deletion.");
      return;
    }
    onClose();
    router.push("/merchant/login");
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Delete account and all data"
      description="This permanently removes your account and everything in your store."
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 dark:border-danger-900 dark:bg-danger-900/20">
          <p className="text-sm font-medium text-danger-900 dark:text-danger-100">
            This cannot be undone.
          </p>
          <p className="mt-1 text-xs text-danger-800 dark:text-danger-200">
            Products, orders, customers, categories, reports, support
            conversations, and every store setting will be permanently deleted.
            You will need to set up your store from scratch if you return.
          </p>
        </div>

        <div>
          <label
            htmlFor="delete-all-confirm"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Type your email to confirm.
          </label>
          <input
            id="delete-all-confirm"
            type="email"
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              if (error) setError(null);
            }}
            placeholder={email || "you@example.com"}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-danger-500 focus:ring-2 focus:ring-danger-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
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
            Delete everything
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}