"use client";

import { useMemo } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import {
  evaluateProductLimit,
  resolveActivePlanId,
  type ProductLimitEvaluation,
} from "./limits";

export function useProductLimit(): ProductLimitEvaluation {
  const { storefrontConfig } = useStorefrontConfig();
  const { productsByStore } = useStoreProducts();
  const storeSlug = storefrontConfig.slug || "my-store";

  return useMemo(() => {
    const products = productsByStore[storeSlug] ?? [];
    const planId = resolveActivePlanId(storefrontConfig);
    return evaluateProductLimit(planId, products.length);
  }, [productsByStore, storeSlug, storefrontConfig]);
}