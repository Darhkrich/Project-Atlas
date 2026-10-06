"use client";

import { useEffect } from "react";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";
import { useCategories } from "@/contexts/categories-context";
import { buildSeedCategories } from "./seed";
import type { MerchantCategory } from "./types";

export function useEnsuredCategories(
  storeSlug: string | undefined,
  templateCategory: MerchantTemplateCategory | undefined
): MerchantCategory[] {
  const { getCategoriesForStore, seedCategories } = useCategories();

  const categories = storeSlug ? getCategoriesForStore(storeSlug) : [];

  useEffect(() => {
    if (!storeSlug) return;
    if (!templateCategory) return;
    if (categories.length > 0) return;
    seedCategories(storeSlug, buildSeedCategories(templateCategory));
  }, [storeSlug, templateCategory, categories.length, seedCategories]);

  return categories;
}