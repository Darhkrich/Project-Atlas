"use client";

import { useMemo } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useCategories } from "@/contexts/categories-context";
import { useEnsuredCategories } from "@/lib/merchant/categories/use-ensured-categories";
import { projectMerchantProducts } from "./projection";
import type {
  MerchantProductsSnapshot,
  ProductFilterState,
} from "./types";

export function useMerchantProducts(
  filters: ProductFilterState
): MerchantProductsSnapshot {
  const { storefrontConfig } = useStorefrontConfig();
  const { getProductsForStore } = useStoreProducts();
  const { getCategoriesForStore } = useCategories();

  const storeSlug = storefrontConfig.slug || "my-store";
  const templateCategory = storefrontConfig.templateCategory;

  const ensuredCategories = useEnsuredCategories(storeSlug, templateCategory);
  const categories =
    ensuredCategories.length > 0
      ? ensuredCategories
      : getCategoriesForStore(storeSlug);

  const products = getProductsForStore(storeSlug);

  return useMemo(
    () =>
      projectMerchantProducts({
        products,
        categories,
        filters,
      }),
    [products, categories, filters]
  );
}