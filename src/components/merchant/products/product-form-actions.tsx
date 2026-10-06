"use client";

import type { ProductFormMode } from "@/lib/merchant/products/forms/types";

interface ProductFormActionsProps {
  isSubmitting: boolean;
  isDirty: boolean;
  onCancel: () => void;
  mode: ProductFormMode;
}

export function ProductFormActions({
  isSubmitting,
  isDirty,
  onCancel,
  mode,
}: ProductFormActionsProps) {
  const submitLabel = mode === "create" ? "Save product" : "Save changes";
  const pendingLabel = mode === "create" ? "Saving" : "Updating";

  return (
    <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-md backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? pendingLabel : submitLabel}
      </button>
      {isDirty && !isSubmitting && (
        <span className="sr-only">Unsaved changes</span>
      )}
    </div>
  );
}