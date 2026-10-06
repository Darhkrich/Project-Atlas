"use client";

import { useCallback, useMemo, useState } from "react";
import type { CustomerFilterState } from "./types";

const DEFAULT_FILTERS: CustomerFilterState = {
  search: "",
  segment: "All",
  sort: "recent_activity",
};

export interface UseCustomerFiltersResult {
  filters: CustomerFilterState;
  setSearch: (term: string) => void;
  setSegment: (segment: CustomerFilterState["segment"]) => void;
  setSort: (key: CustomerFilterState["sort"]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useCustomerFilters(
  initial?: Partial<CustomerFilterState>
): UseCustomerFiltersResult {
  const [filters, setFilters] = useState<CustomerFilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const setSearch = useCallback(
    (term: string) => setFilters((prev) => ({ ...prev, search: term })),
    []
  );
  const setSegment = useCallback(
    (segment: CustomerFilterState["segment"]) =>
      setFilters((prev) => ({ ...prev, segment })),
    []
  );
  const setSort = useCallback(
    (sort: CustomerFilterState["sort"]) =>
      setFilters((prev) => ({ ...prev, sort })),
    []
  );
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim().length > 0 || filters.segment !== "All",
    [filters]
  );

  return {
    filters,
    setSearch,
    setSegment,
    setSort,
    clearFilters,
    hasActiveFilters,
  };
}