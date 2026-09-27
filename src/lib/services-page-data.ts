/**
 * Compatibility shim. The catalog lives at lib/domains/catalog. Everything
 * that used to be exported from this file is re-exported here so the 34
 * consumers keep working while they migrate to the catalog domain.
 *
 * New code imports from @/lib/domains/catalog directly.
 */

export type {
  FormFieldConfig,
  Plan,
  PlanCategory,
  ServiceSection,
  FilterGroup,
  CategoryStatus,
  PlanStatus,
  FormConfig,
  ServiceCategory,
} from "@/lib/domains/catalog";

export {
  seedCatalog,
  CATEGORY_LABEL,
  FILTER_GROUP_LABEL,
  CATEGORY_ALIASES,
  CATEGORY_ALIASES_TO_CATALOG,
  categoryLabel,
  resolveAlias,
  aliasFor,
} from "@/lib/domains/catalog";

import { seedCatalog } from "@/lib/domains/catalog";

/**
 * @deprecated Snapshot of the initial seed. Does not reflect store mutations.
 * New code should read from use-catalog or getCatalog() from
 * @/lib/domains/catalog. Kept for backward compatibility with consumers
 * that read this at module scope.
 */
export const servicesCategories = seedCatalog();

/**
 * @deprecated Prefer examPinPriceFor(categories, examType) from
 * @/lib/domains/catalog. This constant returns 20 regardless of exam type,
 * which undercharges JAMB purchases (correct price 25).
 */
export const examPinUnitPrice = 20;