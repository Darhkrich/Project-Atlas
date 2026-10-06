"use client";

import { useMemo } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useCategories } from "@/contexts/categories-context";
import { useEnsuredCategories } from "@/lib/merchant/categories/use-ensured-categories";
import { projectProductDetail } from "./projection";
import type { MerchantProductDetail } from "./types";

export function useMerchantProduct(
  productId: string | null | undefined
): MerchantProductDetail | null {
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

  return useMemo(() => {
    if (!productId) return null;
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    return projectProductDetail(product, categories);
  }, [products, categories, productId]);
}