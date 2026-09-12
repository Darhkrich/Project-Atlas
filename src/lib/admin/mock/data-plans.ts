import {
  servicesCategories,
  type ServiceCategory,
} from "@/lib/services-page-data";

/**
 * Returns a fresh, deep-cloned copy of the production service catalog. The
 * Data Plans admin holds this array as its only state and derives the
 * network/category/plan view from it via projectNetworksFromCatalog. Every
 * mutation goes through applyNetworkMutation, which returns a new array.
 *
 * The source catalog in `servicesCategories` is never touched.
 */
export function getFreshCatalog(): ServiceCategory[] {
  return structuredClone(servicesCategories);
}