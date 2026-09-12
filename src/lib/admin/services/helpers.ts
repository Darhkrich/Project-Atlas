// lib/admin/services/helpers.ts

import type {
  Plan,
  PlanCategory,
  ServiceCategory,
  ServiceSection,
} from "@/lib/services-page-data";
import type {
  FilterGroup,
  ServiceStatus,
} from "./constants";

/* ------------------------------ Status ---------------------------------- */

/**
 * A service can never be both available and coming soon at the same time.
 * The editor enforces this on save; this helper defends against legacy data
 * where both flags are set by preferring available.
 */
export function serviceStatus(category: ServiceCategory): ServiceStatus {
  if (category.available) return "available";
  if (category.comingSoon) return "coming_soon";
  return "inactive";
}

export function isAvailable(category: ServiceCategory): boolean {
  return serviceStatus(category) === "available";
}

export function isComingSoon(category: ServiceCategory): boolean {
  return serviceStatus(category) === "coming_soon";
}

export function isInactive(category: ServiceCategory): boolean {
  return serviceStatus(category) === "inactive";
}

export function sectionsFor(category: ServiceCategory): ServiceSection[] {
  return category.sections ?? ["digital_services"];
}

export function isAvailableToResellers(category: ServiceCategory): boolean {
  if (category.availableToResellers !== undefined) {
    return category.availableToResellers;
  }
  return sectionsFor(category).includes("resellers");
}

/* ------------------------------ Plan counts ---------------------------- */

export function flatPlanCount(category: ServiceCategory): number {
  return category.formConfig?.plans?.length ?? 0;
}

export function networkPlanCount(category: ServiceCategory): number {
  const tree = category.formConfig?.networkPlanCategories;
  if (!tree) return 0;
  let total = 0;
  for (const categories of Object.values(tree)) {
    for (const category of categories) {
      total += category.plans.length;
    }
  }
  return total;
}

export function planCountFor(category: ServiceCategory): number {
  const network = networkPlanCount(category);
  if (network > 0) return network;
  return flatPlanCount(category);
}

export function networkCount(category: ServiceCategory): number {
  return category.networkOptions?.length ?? 0;
}

export function showsNetworkTree(category: ServiceCategory): boolean {
  return networkPlanCount(category) > 0;
}

/* ------------------------------ Cloning -------------------------------- */

/**
 * Deep clone so admin edits never touch the source catalog. Uses
 * structuredClone, which the catalog is compatible with (pure data, no
 * functions, no class instances).
 */
export function deepCloneCatalog(
  categories: ServiceCategory[]
): ServiceCategory[] {
  return structuredClone(categories);
}

/* ------------------------------ Display order -------------------------- */

export function effectiveOrder(category: ServiceCategory, index: number): number {
  return category.displayOrder ?? index;
}

export function sortedByDisplayOrder(
  categories: ServiceCategory[]
): ServiceCategory[] {
  return [...categories].sort((a, b) => {
    const ai = categories.indexOf(a);
    const bi = categories.indexOf(b);
    const ao = effectiveOrder(a, ai);
    const bo = effectiveOrder(b, bi);
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}

export function nextDisplayOrder(categories: ServiceCategory[]): number {
  let max = -1;
  categories.forEach((c, index) => {
    const order = effectiveOrder(c, index);
    if (order > max) max = order;
  });
  return max + 1;
}

export type ReorderDirection = "up" | "down";

/**
 * Returns a new array with the item at `id` swapped one position in the
 * given direction. Also renumbers every `displayOrder` so the change is
 * persistent once saved.
 */
export function reorder(
  categories: ServiceCategory[],
  id: string,
  direction: ReorderDirection
): ServiceCategory[] {
  const sorted = sortedByDisplayOrder(categories);
  const index = sorted.findIndex((c) => c.id === id);
  if (index === -1) return categories;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return categories;

  const next = [...sorted];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);

  return next.map((category, i) => ({ ...category, displayOrder: i }));
}

/* ------------------------------ IDs / slugs ---------------------------- */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isUniqueId(
  categories: ServiceCategory[],
  candidateId: string,
  excludingId?: string
): boolean {
  return !categories.some(
    (c) => c.id === candidateId && c.id !== excludingId
  );
}

export function buildPlanId(
  name: string,
  network?: string
): string {
  const base = slugify(name) || "plan";
  if (network) return `${slugify(network)}-${base}`;
  return base;
}

/* ------------------------------ Filtering ------------------------------ */

export function groupFromString(value: string): FilterGroup | null {
  const allowed: FilterGroup[] = ["all", "airtime", "data", "tv", "bills", "more"];
  if ((allowed as string[]).includes(value)) {
    return value as FilterGroup;
  }
  return null;
}

/* ------------------------------ Exam pin price ------------------------- */

/**
 * Reads the current exam-pin unit price from the exam-pins category's plans
 * instead of relying on the legacy `examPinUnitPrice` constant.
 * Falls back to null if the plan list is empty.
 */
export function examPinUnitPriceFrom(
  categories: ServiceCategory[]
): number | null {
  const exam = categories.find((c) => c.id === "exampins");
  if (!exam) return null;
  const firstPlan = exam.formConfig?.plans?.[0];
  if (!firstPlan) return null;
  return firstPlan.price;
}

/* ------------------------------ Preview helpers ------------------------ */

export interface PreviewPlanSummary {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export function previewPlans(category: ServiceCategory): PreviewPlanSummary[] {
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