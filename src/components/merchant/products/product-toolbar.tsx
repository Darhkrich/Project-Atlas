"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import type {
  ProductSortKey,
  ProductStatusFilter,
} from "@/lib/merchant/products/types";
import { PRODUCT_SORT_LABELS } from "@/lib/merchant/products/labels";

interface ProductToolbarProps {
  search: string;
  onSearchChange: (term: string) => void;
  status: ProductStatusFilter;
  onStatusChange: (status: ProductStatusFilter) => void;
  categoryId: string | "All";
  onCategoryChange: (id: string) => void;
  sort: ProductSortKey;
  onSortChange: (key: ProductSortKey) => void;
  categories: MerchantCategory[];
}

export function ProductToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="product-status-filter" className="sr-only">
            Status filter
          </label>
          <select
            id="product-status-filter"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ProductStatusFilter)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <label htmlFor="product-category-filter" className="sr-only">
            Category filter
          </label>
          <select
            id="product-category-filter"
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label htmlFor="product-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProductSortKey)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            {Object.entries(PRODUCT_SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Link
        href="/merchant/products/new"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        )}
      >
        <AtlasIcon name="add" className="h-4 w-4" aria-hidden="true" />
        Add product
      </Link>
    </div>
  );
}