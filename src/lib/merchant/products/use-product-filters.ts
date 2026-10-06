"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ProductFilterState,
  ProductSortKey,
  ProductStatusFilter,
} from "./types";

const DEFAULT_FILTERS: ProductFilterState = {
  search: "",
  status: "All",
  categoryId: "All",
  sort: "recent",
};

export interface UseProductFiltersResult {
  filters: ProductFilterState;
  setSearch: (term: string) => void;
  setStatus: (status: ProductStatusFilter) => void;
  setCategoryId: (id: string) => void;
  setSort: (key: ProductSortKey) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useProductFilters(
  initial?: Partial<ProductFilterState>
): UseProductFiltersResult {
  const [filters, setFilters] = useState<ProductFilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const setSearch = useCallback(
    (term: string) => setFilters((prev) => ({ ...prev, search: term })),
    []
  );
  const setStatus = useCallback(
    (status: ProductStatusFilter) =>
      setFilters((prev) => ({ ...prev, status })),
    []
  );
  const setCategoryId = useCallback(
    (id: string) => setFilters((prev) => ({ ...prev, categoryId: id })),
    []
  );
  const setSort = useCallback(
    (sort: ProductSortKey) => setFilters((prev) => ({ ...prev, sort })),
    []
  );
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters = useMemo(
    () =>
      filters.search.length > 0 ||
      filters.status !== "All" ||
      filters.categoryId !== "All",
    [filters]
  );

  return {
    filters,
    setSearch,
    setStatus,
    setCategoryId,
    setSort,
    clearFilters,
    hasActiveFilters,
  };
}