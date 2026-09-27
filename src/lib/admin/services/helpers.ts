import type {
  Plan,
  PlanCategory,
  ServiceCategory,
  ServiceSection,
} from "@/lib/domains/catalog";
import {
  statusOf,
  sectionsFor as catalogSectionsFor,
  isAvailableToResellers as catalogIsAvailableToResellers,
  flatPlanCount,
  networkPlanCount,
  planCountFor,
  slugify,
  sortedByDisplayOrder,
  nextDisplayOrder,
  reorder,
  groupFromString,
  isUniqueCategoryId,
  examPinPriceFor,
} from "@/lib/domains/catalog";
import type { FilterGroup, ServiceStatus } from "./constants";

/* ------------------------------ Status ---------------------------------- */

export function serviceStatus(category: ServiceCategory): ServiceStatus {
  return statusOf(category);
}

export function isAvailable(category: ServiceCategory): boolean {
  return statusOf(category) === "available";
}

export function isComingSoon(category: ServiceCategory): boolean {
  return statusOf(category) === "coming_soon";
}

export function isInactive(category: ServiceCategory): boolean {
  return statusOf(category) === "inactive";
}

export function sectionsFor(category: ServiceCategory): ServiceSection[] {
  return catalogSectionsFor(category);
}

export function isAvailableToResellers(category: ServiceCategory): boolean {
  return catalogIsAvailableToResellers(category);
}

/* ------------------------------ Plan counts ---------------------------- */

export { flatPlanCount, networkPlanCount, planCountFor };

export function networkCount(category: ServiceCategory): number {
  return category.networkOptions?.length ?? 0;
}

export function showsNetworkTree(category: ServiceCategory): boolean {
  return networkPlanCount(category) > 0;
}

/* ------------------------------ Display order -------------------------- */

export function effectiveOrder(
  category: ServiceCategory,
  index: number
): number {
  return category.displayOrder ?? index;
}

export { sortedByDisplayOrder, nextDisplayOrder, reorder };

/* ------------------------------ IDs / slugs ---------------------------- */

export { slugify };

export function isUniqueId(
  categories: ServiceCategory[],
  candidateId: string,
  excludingId?: string
): boolean {
  return isUniqueCategoryId(categories, candidateId, excludingId);
}

/**
 * Namespaced plan id built from a name and optional network. Matches the
 * dataPlanIdFor shape in lib/admin/data-plans/helpers so plan ids resolve
 * through the catalog's parsePlanId regardless of which page created them.
 * Consumers that stored un-namespaced ids need migrating to this shape.
 */
export function buildPlanId(name: string, network?: string): string {
  const base = slugify(name) || "plan";
  if (network) return "data:" + slugify(network) + "-" + base;
  return base;
}

/* ------------------------------ Filtering ------------------------------ */

export { groupFromString };
export type { FilterGroup };

/* ------------------------------ Exam pin price ------------------------- */

/**
 * Reads the unit price for an exam type from the exam-pins category. The
 * former singleton returned a single price regardless of exam type, which
 * undercharged JAMB by 5. Callers must now pass the exam type.
 */
export function examPinUnitPriceFrom(
  categories: ServiceCategory[],
  examType: string
): number | null {
  return examPinPriceFor(categories, examType);
}

/* ------------------------------ Preview helpers ------------------------ */

export interface PreviewPlanSummary {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export function previewPlans(
  category: ServiceCategory
): PreviewPlanSummary[] {
  const tree = category.formConfig?.networkPlanCategories;
  if (tree) {
    const firstNetwork = Object.keys(tree)[0];
    if (firstNetwork) {
      const firstCategory: PlanCategory | undefined = tree[firstNetwork]?.[0];
      if (firstCategory) {
        return firstCategory.plans.map((p: Plan) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
        }));
      }
    }
  }
  return category.formConfig?.plans ?? [];
}