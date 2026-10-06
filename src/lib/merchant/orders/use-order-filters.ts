"use client";

import { useCallback, useMemo, useState } from "react";
import type { OrderFilterState } from "./types";

const DEFAULT_FILTERS: OrderFilterState = {
  search: "",
  status: "All",
  paymentStatus: "All",
  dateRange: "All",
  sort: "action_first",
};

export interface UseOrderFiltersResult {
  filters: OrderFilterState;
  setSearch: (term: string) => void;
  setStatus: (status: OrderFilterState["status"]) => void;
  setPaymentStatus: (status: OrderFilterState["paymentStatus"]) => void;
  setDateRange: (range: OrderFilterState["dateRange"]) => void;
  setSort: (key: OrderFilterState["sort"]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useOrderFilters(
  initial?: Partial<OrderFilterState>
): UseOrderFiltersResult {
  const [filters, setFilters] = useState<OrderFilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const setSearch = useCallback(
    (term: string) => setFilters((prev) => ({ ...prev, search: term })),
    []
  );
  const setStatus = useCallback(
    (status: OrderFilterState["status"]) =>
      setFilters((prev) => ({ ...prev, status })),
    []
  );
  const setPaymentStatus = useCallback(
    (paymentStatus: OrderFilterState["paymentStatus"]) =>
      setFilters((prev) => ({ ...prev, paymentStatus })),
    []
  );
  const setDateRange = useCallback(
    (dateRange: OrderFilterState["dateRange"]) =>
      setFilters((prev) => ({ ...prev, dateRange })),
    []
  );
  const setSort = useCallback(
    (sort: OrderFilterState["sort"]) =>
      setFilters((prev) => ({ ...prev, sort })),
    []
  );
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim().length > 0 ||
      filters.status !== "All" ||
      filters.paymentStatus !== "All" ||
      filters.dateRange !== "All",
    [filters]
  );

  return {
    filters,
    setSearch,
    setStatus,
    setPaymentStatus,
    setDateRange,
    setSort,
    clearFilters,
    hasActiveFilters,
  };
}