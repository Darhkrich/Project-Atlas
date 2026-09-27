"use client";

import { useUrlFilters } from "./use-url-filters";
import {
  DEFAULT_REVENUE_RANGE,
  REVENUE_RANGES,
  type RevenueRange,
} from "@/lib/admin/revenue/revenue-constants";

interface RevenueFilterValues {
  range: string;
}

const DEFAULTS: RevenueFilterValues = {
  range: DEFAULT_REVENUE_RANGE,
};

export function useRevenueRange(): {
  range: RevenueRange;
  setRange: (r: RevenueRange) => void;
} {
  const { filters, setFilters } = useUrlFilters<RevenueFilterValues>(
    DEFAULTS
  );

  const isValid = REVENUE_RANGES.some((r) => r.key === filters.range);
  const range = (
    isValid ? filters.range : DEFAULT_REVENUE_RANGE
  ) as RevenueRange;

  const setRange = (r: RevenueRange) => {
    setFilters({ range: r });
  };

  return { range, setRange };
}