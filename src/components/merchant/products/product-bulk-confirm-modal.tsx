"use client";

import { AtlasModalShell } from "@/components/atlas/modal-shell";
import type { MerchantProductRow } from "@/lib/merchant/products/types";

interface ProductBulkConfirmModalProps {
  open: boolean;
  onClose: () => void;
  products: MerchantProductRow[];
  onConfirm: () => void;
}

const PREVIEW_LIMIT = 3;

export function ProductBulkConfirmModal({
  open,
  onClose,
  products,
  onConfirm,
}: ProductBulkConfirmModalProps) {
  const count = products.length;
  const preview = products.slice(0, PREVIEW_LIMIT);
  const remaining = Math.max(0, count - preview.length);

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={
        count === 1 ? "Delete 1 product" : "Delete " + count + " products"
      }
      description="This cannot be undone."
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-danger-200 bg-danger-50/60 p-3 dark:border-danger-900 dark:bg-danger-900/20">
          <ul role="list" className="space-y-1 text-xs">
            {preview.map((p) => (
              <li
                key={p.id}
                className="truncate font-medium text-danger-800 dark:text-danger-200"
              >
                {p.name}
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-danger-700 dark:text-danger-300">
                and {remaining} more.
              </li>
            )}
          </ul>
        </div>

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
            {count === 1 ? "Delete product" : "Delete " + count + " products"}
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}