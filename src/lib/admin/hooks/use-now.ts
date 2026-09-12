/* eslint-disable react-hooks/set-state-in-effect */
// lib/admin/hooks/use-now.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current wall-clock time, updated on an interval.
 *
 * Returning `null` on first render keeps SSR and hydration in sync:
 * calling `Date.now()` during render produces a different value at
 * server-render time than at hydration time, triggering a React
 * hydration mismatch. Consumers treat `null` as "not ready yet" and
 * fall back to absolute formatting.
 *
 * Also keeps render pure. Calling `Date.now()` directly inside a
 * component (which the previous drawer did) violates React's purity
 * rule and causes inconsistent output across re-renders within the
 * same commit.
 */
export function useNow(intervalMs: number = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}