import type { MerchantTemplateCategory } from "@/types/merchant-storefront";
import { productCategoriesByTemplate } from "@/config/product-categories";
import { OTHER_CATEGORY_NAME } from "./constants";
import { OTHER_CATEGORY_ID, type MerchantCategory } from "./types";

export function buildSeedCategories(
  templateCategory: MerchantTemplateCategory
): MerchantCategory[] {
  const source =
    productCategoriesByTemplate[templateCategory] ??
    productCategoriesByTemplate.general;
  const now = Date.now();
  const used = new Set<string>();
  const list: MerchantCategory[] = [];

  for (let i = 0; i < source.length; i++) {
    const name = source[i];
    const key = name.trim().toLowerCase();
    if (key.length === 0) continue;
    if (key === OTHER_CATEGORY_NAME.toLowerCase()) continue;
    if (used.has(key)) continue;
    used.add(key);
    list.push({
      id: crypto.randomUUID(),
      name,
      order: list.length,
      system: false,
      createdAt: now,
    });
  }

  list.push({
    id: OTHER_CATEGORY_ID,
    name: OTHER_CATEGORY_NAME,
    order: list.length,
    system: true,
    createdAt: now,
  });

  return list;
}