// lib/shared/charts/format.ts
//
// Wrapper for Recharts Tooltip formatter props. Recharts types the
// formatter value as ValueType | undefined, which forces every caller
// to guard or coerce before using it as a number. This wrapper does the
// coercion once, so call sites keep the shape (value: number) => ...
// they already use.
//
// Shared by admin and merchant chart consumers. Admin's previous
// location re-exports from here.

import type { ReactNode } from "react";

export interface ChartTooltipEntry {
  payload?: unknown;
  dataKey?: string | number;
  name?: string | number;
}

export type ChartTooltipFormatter = (
  value: number,
  name: string,
  entry: ChartTooltipEntry
) => ReactNode | [ReactNode, ReactNode];

export function chartFormatter(
  fn: ChartTooltipFormatter
): (
  value: unknown,
  name: unknown,
  entry: unknown,
  index?: number,
  payload?: unknown
) => ReactNode | [ReactNode, ReactNode] {
  return (value, name, entry) => {
    const numeric = typeof value === "number" ? value : Number(value);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    const label =
      typeof name === "string" || typeof name === "number"
        ? String(name)
        : "";
    return fn(safe, label, (entry ?? {}) as ChartTooltipEntry);
  };
}