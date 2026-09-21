"use client";

import { AtlasIcon } from "@/components/atlas/icons";

type Filter = {
  id: string;
  label: string;
};

const filters: Filter[] = [
  { id: "all", label: "All" },
  { id: "purchases", label: "Purchases" },
  { id: "commissions", label: "Commissions" },
  { id: "funding", label: "Funding" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "adjustments", label: "Adjustments" },
];

type TransactionFiltersProps = {
  activeFilter: string;
  searchQuery: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
};

export function TransactionFilters({
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Transaction filters"
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const active = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(filter.id)}
              className={
                "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-brand-800 text-white dark:bg-brand-700"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700")
              }
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:max-w-sm">
        <AtlasIcon
          name="search"
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search transactions..."
          aria-label="Search transactions"
          className="h-10 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-brand-500 dark:focus:ring-brand-900"
        />
      </div>
    </div>
  );
}