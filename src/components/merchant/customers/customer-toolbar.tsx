/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { SORT_LABELS } from "@/lib/merchant/customers/labels";
import type {
  CustomerFilterState,
  CustomerSortKey,
} from "@/lib/merchant/customers/types";
import type { UseCustomerFiltersResult } from "@/lib/merchant/customers/use-customer-filters";

interface CustomerToolbarProps {
  filtersApi: UseCustomerFiltersResult;
}

const SORT_OPTIONS: CustomerSortKey[] = [
  "recent_activity",
  "spend_desc",
  "orders_desc",
  "name_asc",
  "oldest_customer",
];

export function CustomerToolbar({ filtersApi }: CustomerToolbarProps) {
  const { filters } = filtersApi;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <label htmlFor="customer-search" className="sr-only">
          Search customers
        </label>
        <AtlasIcon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          id="customer-search"
          type="search"
          value={filters.search}
          onChange={(e) => filtersApi.setSearch(e.target.value)}
          placeholder="Name, email, phone, or order number"
          className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500"
        />
      </div>

      <div className="sm:ml-auto">
        <label htmlFor="customer-sort" className="sr-only">
          Sort
        </label>
        <select
          id="customer-sort"
          value={filters.sort}
          onChange={(e) =>
            filtersApi.setSort(e.target.value as CustomerSortKey)
          }
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}