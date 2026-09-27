/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCatalog,
  subscribeToCatalog,
  projectPricingRows,
  type ServiceCategory,
  type PlanPricingRow,
} from "@/lib/domains/catalog";

export interface UseCatalogResult {
  categories: ServiceCategory[];
  pricingRows: PlanPricingRow[];
  loading: boolean;
  error: Error | null;
}

export function useCatalog(): UseCatalogResult {
  const [categories, setCategories] = useState<ServiceCategory[] | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setCategories(getCatalog());
      const unsubscribe = subscribeToCatalog(() => {
        setCategories(getCatalog());
      });
      return unsubscribe;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      return undefined;
    }
  }, []);

  const pricingRows = useMemo(
    () => (categories ? projectPricingRows(categories) : []),
    [categories]
  );

  return {
    categories: categories ?? [],
    pricingRows,
    loading: categories === null,
    error,
  };
}