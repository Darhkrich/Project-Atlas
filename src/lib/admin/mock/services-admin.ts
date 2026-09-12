// lib/admin/mock/services-admin.ts

import {
  servicesCategories,
  type ServiceCategory,
} from "@/lib/services-page-data";

/**
 * Deep clone of the production catalog, isolated from the customer-facing
 * array. Admin edits mutate the clone only; the source of truth in
 * `servicesCategories` is never touched. Same shape, but the admin page
 * owns the lifecycle from here.
 */
export function getFreshServiceCategories(): ServiceCategory[] {
  const cloned = structuredClone(servicesCategories);
  return cloned.map((category, index) => ({
    ...category,
    displayOrder: category.displayOrder ?? index,
  }));
}

/**
 * Kept as a static export for any consumer that doesn't need a fresh clone
 * per mount. Prefer `getFreshServiceCategories()` for editable views.
 */
export const mockServiceCategories: ServiceCategory[] = getFreshServiceCategories();