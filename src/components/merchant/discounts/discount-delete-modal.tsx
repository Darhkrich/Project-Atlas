"use client";

import { AtlasModalShell } from "@/components/atlas/modal-shell";

interface DiscountDeleteModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
  onConfirm: () => void;
}

export function DiscountDeleteModal({
  open,
  onClose,
  code,
  onConfirm,
}: DiscountDeleteModalProps) {
  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Delete discount"
      description={code}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Removing this discount code cannot be undone. Customers with the code
          will no longer be able to apply it.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700"
          >
            Delete permanently
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}