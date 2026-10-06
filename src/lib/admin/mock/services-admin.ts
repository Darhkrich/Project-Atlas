// lib/admin/mock/services-admin.ts

import { getCatalog, type ServiceCategory } from "@/lib/domains/catalog";

/**
 * Deep clone of the live service catalog, isolated from the source array.
 * Admin edits mutate the clone only; the catalog store is never touched by
 * this helper. Same shape as getCatalog(), with displayOrder defaulted.
 *
 * Not a mock. Despite the folder name, the source is the live catalog.
 */
export function getFreshServiceCategories(): ServiceCategory[] {
  const cloned = structuredClone(getCatalog());
  return cloned.map((category, index) => ({
    ...category,
    displayOrder: category.displayOrder ?? index,
  }));
}