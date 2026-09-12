// lib/admin/hooks/use-debounced-value.ts
"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}