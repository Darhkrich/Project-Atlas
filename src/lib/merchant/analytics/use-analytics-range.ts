"use client";

import { useCallback, useState } from "react";
import type { AnalyticsRange } from "./types";

const DEFAULT_RANGE: AnalyticsRange = "30d";

export interface UseAnalyticsRangeResult {
  range: AnalyticsRange;
  setRange: (range: AnalyticsRange) => void;
}

export function useAnalyticsRange(
  initial?: AnalyticsRange
): UseAnalyticsRangeResult {
  const [range, setRangeState] = useState<AnalyticsRange>(
    initial ?? DEFAULT_RANGE
  );

  const setRange = useCallback((next: AnalyticsRange) => {
    setRangeState(next);
  }, []);

  return { range, setRange };
}