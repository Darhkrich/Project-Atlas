/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { TransactionsRangeSwitcher } from "./transactions-range-switcher";
import type { TransactionRange } from "@/lib/merchant/transactions/types";

interface Props {
  search: string;
  range: TransactionRange;
  onSearch: (value: string) => void;
  onRange: (range: TransactionRange) => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export function TransactionsToolbar({
  search,
  range,
  onSearch,
  onRange,
}: Props) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      onSearch(value);
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <label htmlFor="transactions-search" className="sr-only">
          Search transactions
        </label>
        <AtlasIcon
          name="search"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
        <input
          id="transactions-search"
          type="search"
          value={localSearch}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by order, invoice, or description"
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
      </div>

      <div className="lg:ml-auto">
        <TransactionsRangeSwitcher value={range} onChange={onRange} />
      </div>
    </div>
  );
}