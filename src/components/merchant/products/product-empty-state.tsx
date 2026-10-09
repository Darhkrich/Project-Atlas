"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  PRODUCT_LIMIT_ADD_BLOCKED_LABEL,
  PRODUCT_LIMIT_AT_TITLE,
} from "@/lib/merchant/products/labels";

interface ProductEmptyStateProps {
  variant: "no-products" | "no-matches";
  onSeedSamples?: () => void;
  onClearFilters?: () => void;
  seeding?: boolean;
  atProductLimit?: boolean;
}

export function ProductEmptyState({
  variant,
  onSeedSamples,
  onClearFilters,
  seeding,
  atProductLimit,
}: ProductEmptyStateProps) {
  if (variant === "no-matches") {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name="search"
            className="h-5 w-5 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
        </div>
        <h2 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          No products match your filters
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Try adjusting your search or filter criteria.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
        <AtlasIcon
          name="package"
          className="h-6 w-6 text-brand-600 dark:text-brand-300"
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {atProductLimit ? PRODUCT_LIMIT_AT_TITLE : "Your shelves are empty"}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {atProductLimit
          ? "You have reached your plan limit. Upgrade to add more products."
          : "Add your first product to open the shop."}
      </p>

      {atProductLimit ? (
        <div className="mt-6 flex justify-center">
          <Link
            href="/merchant/billing"
            className="inline-flex items-center gap-2 rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700"
          >
            <AtlasIcon
              name="trending-up"
              className="h-4 w-4"
              aria-hidden="true"
            />
            {PRODUCT_LIMIT_ADD_BLOCKED_LABEL}
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/merchant/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <AtlasIcon name="add" className="h-4 w-4" aria-hidden="true" />
            Add your first product
          </Link>
          {onSeedSamples && (
            <button
              type="button"
              onClick={onSeedSamples}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <AtlasIcon
                name={seeding ? "refresh" : "store"}
                className={seeding ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                aria-hidden="true"
              />
              {seeding ? "Adding samples" : "Start with sample products"}
            </button>
          )}
        </div>
      )}

      {!atProductLimit && (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
          Sample products are examples. You can edit or delete them any time.
        </p>
      )}
    </div>
  );
}