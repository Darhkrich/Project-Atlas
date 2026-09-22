// lib/admin/hooks/use-url-filters.ts
"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface UseUrlFiltersResult<T extends object> {
  filters: T;
  setFilter: (key: keyof T, value: string) => void;
  setFilters: (patch: Partial<T>) => void;
  clearFilters: () => void;
  hasActive: boolean;
}

export function useUrlFilters<T extends object>(
  defaults: T
): UseUrlFiltersResult<T> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const result = { ...defaults };
    const record = result as Record<string, unknown>;
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key);
      if (value !== null) {
        record[key] = value;
      }
    }
    return result;
  }, [searchParams, defaults]);

  const hasActive = useMemo(
    () => Object.keys(defaults).some((key) => filters[key] !== defaults[key]),
    [filters, defaults]
  );

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const next = new URLSearchParams(searchParams.toString());
      const defaultsRecord = defaults as Record<string, unknown>;
      for (const [key, value] of Object.entries(patch)) {
        if (
          value === undefined ||
          value === null ||
          value === defaultsRecord[key]
        ) {
          next.delete(key);
        } else if (value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, pathname, router, defaults]
  );

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      setFilters({ [key]: value } as unknown as Partial<T>);
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, setFilters, clearFilters, hasActive };
}