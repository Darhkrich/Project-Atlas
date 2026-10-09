"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import type { ProductStatus } from "@/lib/merchant/products/types";

interface ProductBulkBarProps {
  count: number;
  categories: MerchantCategory[];
  onClear: () => void;
  onSetStatus: (status: ProductStatus) => void;
  onSetCategory: (categoryId: string) => void;
  onSetFeatured: (featured: boolean) => void;
  onArchive: () => void;
  onDelete: () => void;
}

const selectClass =
  "rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200";

export function ProductBulkBar({
  count,
  categories,
  onClear,
  onSetStatus,
  onSetCategory,
  onSetFeatured,
  onArchive,
  onDelete,
}: ProductBulkBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
            {count}
          </span>
          selected
        </span>

        <select
          value=""
          onChange={(e) => onSetStatus(e.target.value as ProductStatus)}
          aria-label="Set status for selected products"
          className={selectClass}
        >
          <option value="" disabled>
            Set status
          </option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value=""
          onChange={(e) => onSetCategory(e.target.value)}
          aria-label="Set category for selected products"
          className={selectClass}
        >
          <option value="" disabled>
            Set category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onSetFeatured(true)}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="star" className="h-3.5 w-3.5" aria-hidden="true" />
          Feature
        </button>

        <button
          type="button"
          onClick={() => onSetFeatured(false)}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Unfeature
        </button>

        <button
          type="button"
          onClick={onArchive}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Archive
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-md border border-danger-200 bg-white px-2.5 py-1.5 text-xs font-medium text-danger-700 hover:bg-danger-50 dark:border-danger-900 dark:bg-neutral-950 dark:text-danger-300 dark:hover:bg-danger-900/30"
        >
          <AtlasIcon name="trash" className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>

        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <AtlasIcon name="x-circle" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}