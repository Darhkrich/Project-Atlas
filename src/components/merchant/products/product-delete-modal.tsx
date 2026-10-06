/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { cn } from "@/lib/utils";

interface ProductDeleteModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  onArchive: () => void;
  onDeletePermanently: () => void;
}

export function ProductDeleteModal({
  open,
  onClose,
  productName,
  onArchive,
  onDeletePermanently,
}: ProductDeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  const canDelete = confirmText.trim().toLowerCase() === productName.trim().toLowerCase();

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Remove product"
      description={productName}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Archive
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Hides the product from your storefront. You can restore it later by
            changing the status back to Active.
          </p>
          <button
            type="button"
            onClick={onArchive}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Archive product
          </button>
        </div>

        <div className="rounded-lg border border-danger-200 bg-danger-50/50 p-4 dark:border-danger-900 dark:bg-danger-900/20">
          <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
            Delete permanently
          </p>
          <p className="mt-1 text-xs text-danger-700 dark:text-danger-300">
            Removes the product entirely. This cannot be undone.
          </p>
          <label
            htmlFor="delete-confirm"
            className="mt-3 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Type the product name to confirm:
          </label>
          <input
            id="delete-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={productName}
            className="mt-1.5 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-danger-500 focus:ring-2 focus:ring-danger-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <button
            type="button"
            onClick={onDeletePermanently}
            disabled={!canDelete}
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
              canDelete
                ? "bg-danger-600 text-white hover:bg-danger-700"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500"
            )}
          >
            Delete permanently
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}