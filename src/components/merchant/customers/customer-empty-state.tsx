"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  CUSTOMER_EMPTY_NO_CUSTOMERS_BODY,
  CUSTOMER_EMPTY_NO_CUSTOMERS_CTA,
  CUSTOMER_EMPTY_NO_CUSTOMERS_TITLE,
  CUSTOMER_EMPTY_NO_MATCHES_BODY,
  CUSTOMER_EMPTY_NO_MATCHES_CTA,
  CUSTOMER_EMPTY_NO_MATCHES_TITLE,
} from "@/lib/merchant/customers/labels";

interface CustomerEmptyStateProps {
  variant: "no-customers" | "no-matches";
  storeSlug: string;
  hasProducts: boolean;
  onClearFilters?: () => void;
}

export function CustomerEmptyState({
  variant,
  storeSlug,
  hasProducts,
  onClearFilters,
}: CustomerEmptyStateProps) {
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
          {CUSTOMER_EMPTY_NO_MATCHES_TITLE}
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {CUSTOMER_EMPTY_NO_MATCHES_BODY}
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {CUSTOMER_EMPTY_NO_MATCHES_CTA}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
        <AtlasIcon
          name="users"
          className="h-6 w-6 text-brand-600 dark:text-brand-300"
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {CUSTOMER_EMPTY_NO_CUSTOMERS_TITLE}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {CUSTOMER_EMPTY_NO_CUSTOMERS_BODY}
      </p>
      {hasProducts && (
        <div className="mt-6">
          <Link
            href={"/ecommerce-stores/" + storeSlug}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <AtlasIcon
              name="external-link"
              className="h-4 w-4"
              aria-hidden="true"
            />
            {CUSTOMER_EMPTY_NO_CUSTOMERS_CTA}
          </Link>
        </div>
      )}
      {!hasProducts && (
        <div className="mt-6">
          <Link
            href="/merchant/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <AtlasIcon name="add" className="h-4 w-4" aria-hidden="true" />
            Add your first product
          </Link>
        </div>
      )}
    </div>
  );
}