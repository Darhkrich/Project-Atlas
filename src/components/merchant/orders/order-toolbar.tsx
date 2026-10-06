"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import {
  DATE_RANGE_LABELS,
  ORDER_SORT_LABELS,
} from "@/lib/merchant/orders/labels";
import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
  OrderFilterState,
  OrderSortKey,
} from "@/lib/merchant/orders/types";
import type { UseOrderFiltersResult } from "@/lib/merchant/orders/use-order-filters";

interface OrderToolbarProps {
  filtersApi: UseOrderFiltersResult;
}

const STATUS_OPTIONS: ("All" | CustomerOrderStatus)[] = [
  "All",
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_OPTIONS: ("All" | CustomerOrderPaymentStatus)[] = [
  "All",
  "pending",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
];

const DATE_OPTIONS: OrderFilterState["dateRange"][] = [
  "All",
  "Today",
  "Last7",
  "Last30",
];

const SORT_OPTIONS: OrderSortKey[] = [
  "action_first",
  "recent",
  "oldest",
  "value_desc",
  "value_asc",
  "customer_asc",
];

export function OrderToolbar({ filtersApi }: OrderToolbarProps) {
  const { filters } = filtersApi;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="orders-search" className="sr-only">
            Search orders
          </label>
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            id="orders-search"
            type="search"
            value={filters.search}
            onChange={(e) => filtersApi.setSearch(e.target.value)}
            placeholder="Order number, customer, product..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-1 lg:justify-end">
          <div>
            <label htmlFor="orders-status-filter" className="sr-only">
              Status filter
            </label>
            <select
              id="orders-status-filter"
              value={filters.status}
              onChange={(e) =>
                filtersApi.setStatus(
                  e.target.value as OrderFilterState["status"]
                )
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 lg:w-auto"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All statuses" : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="orders-payment-filter" className="sr-only">
              Payment filter
            </label>
            <select
              id="orders-payment-filter"
              value={filters.paymentStatus}
              onChange={(e) =>
                filtersApi.setPaymentStatus(
                  e.target.value as OrderFilterState["paymentStatus"]
                )
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 lg:w-auto"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All payments" : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="orders-date-filter" className="sr-only">
              Date range
            </label>
            <select
              id="orders-date-filter"
              value={filters.dateRange}
              onChange={(e) =>
                filtersApi.setDateRange(
                  e.target.value as OrderFilterState["dateRange"]
                )
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 lg:w-auto"
            >
              {DATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {DATE_RANGE_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="orders-sort" className="sr-only">
              Sort
            </label>
            <select
              id="orders-sort"
              value={filters.sort}
              onChange={(e) =>
                filtersApi.setSort(e.target.value as OrderSortKey)
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 lg:w-auto"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {ORDER_SORT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtersApi.hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={filtersApi.clearFilters}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}