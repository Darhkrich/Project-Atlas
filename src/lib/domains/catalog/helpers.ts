import type {
  ServiceCategory,
  Plan,
  ServiceSection,
  CategoryStatus,
  PlanStatus,
  FilterGroup,
  FormConfig,
} from "./types";
import {
  CATALOG_PLAN_ID_SEPARATOR,
  CATALOG_INFERRED_PROVIDER_COST_RATE,
  CATALOG_FILTER_GROUPS,
} from "./constants";

export function statusOf(category: ServiceCategory): CategoryStatus {
  if (category.available) return "available";
  if (category.comingSoon) return "coming_soon";
  return "inactive";
}

export function planStatusOf(plan: Plan): PlanStatus {
  return plan.active === false ? "inactive" : "active";
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

export function flatPlanCount(category: ServiceCategory): number {
  return category.formConfig?.plans?.length ?? 0;
}

export function networkPlanCount(category: ServiceCategory): number {
  const tree = category.formConfig?.networkPlanCategories;
  if (!tree) return 0;
  let total = 0;
  for (const cats of Object.values(tree)) {
    for (const cat of cats) {
      total += cat.plans.length;
    }
  }
  return total;
}

export function planCountFor(category: ServiceCategory): number {
  const net = networkPlanCount(category);
  return net > 0 ? net : flatPlanCount(category);
}

export function allPlansFor(category: ServiceCategory): Plan[] {
  const tree = category.formConfig?.networkPlanCategories;
  if (tree) {
    const out: Plan[] = [];
    for (const cats of Object.values(tree)) {
      for (const cat of cats) {
        out.push(...cat.plans);
      }
    }
    return out;
  }
  return category.formConfig?.plans ?? [];
}

export function networksFor(category: ServiceCategory): string[] {
  const tree = category.formConfig?.networkPlanCategories;
  if (!tree) return category.networkOptions ?? [];
  return Object.keys(tree);
}

export function buildPlanId(categoryId: string, localId: string): string {
  return categoryId + CATALOG_PLAN_ID_SEPARATOR + localId;
}

export function parsePlanId(
  planId: string
): { categoryId: string; localId: string } | null {
  const idx = planId.indexOf(CATALOG_PLAN_ID_SEPARATOR);
  if (idx === -1) return null;
  return {
    categoryId: planId.slice(0, idx),
    localId: planId.slice(idx + 1),
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function sortedByDisplayOrder(
  categories: ServiceCategory[]
): ServiceCategory[] {
  return [...categories].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });
}

export function nextDisplayOrder(categories: ServiceCategory[]): number {
  let max = -1;
  for (const c of categories) {
    if (c.displayOrder > max) max = c.displayOrder;
  }
  return max + 1;
}

export function reorder(
  categories: ServiceCategory[],
  id: string,
  direction: "up" | "down"
): ServiceCategory[] {
  const sorted = sortedByDisplayOrder(categories);
  const idx = sorted.findIndex((c) => c.id === id);
  if (idx === -1) return categories;
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= sorted.length) return categories;
  const next = [...sorted];
  const [moved] = next.splice(idx, 1);
  next.splice(target, 0, moved);
  return next.map((c, i) => ({ ...c, displayOrder: i }));
}

export function groupFromString(value: string): FilterGroup | null {
  if ((CATALOG_FILTER_GROUPS as readonly string[]).includes(value)) {
    return value as FilterGroup;
  }
  return null;
}

export function isUniqueCategoryId(
  categories: ServiceCategory[],
  candidateId: string,
  excludingId?: string
): boolean {
  return !categories.some(
    (c) => c.id === candidateId && c.id !== excludingId
  );
}

export function inferProviderCost(price: number): number {
  return (
    Math.round(price * CATALOG_INFERRED_PROVIDER_COST_RATE * 100) / 100
  );
}

/**
 * Reads the unit price for a specific exam type from the exam pins category.
 * Returns null when the category is missing or the exam type has no plan.
 * Never falls back to the first plan, because the first plan is WAEC and
 * silently returning WAEC pricing for a JAMB purchase is the bug this
 * function exists to prevent.
 */
export function examPinPriceFor(
  categories: ServiceCategory[],
  examType: string
): number | null {
  const exam = categories.find((c) => c.id === "exampins");
  if (!exam) return null;
  const plans = exam.formConfig?.plans ?? [];
  const target = plans.find(
    (p) =>
      p.name.toLowerCase().includes(examType.toLowerCase()) ||
      p.id.toLowerCase().includes(examType.toLowerCase())
  );
  return target ? target.price : null;
}

export function findCategoryById(
  categories: ServiceCategory[],
  id: string
): ServiceCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function findPlanById(
  categories: ServiceCategory[],
  planId: string
): { category: ServiceCategory; plan: Plan; network?: string } | null {
  const parsed = parsePlanId(planId);
  if (!parsed) return null;
  const category = findCategoryById(categories, parsed.categoryId);
  if (!category) return null;

  const tree = category.formConfig?.networkPlanCategories;
  if (tree) {
    for (const [network, cats] of Object.entries(tree)) {
      for (const cat of cats) {
        const found = cat.plans.find((p) => p.id === planId);
        if (found) return { category, plan: found, network };
      }
    }
  }

  const flat = category.formConfig?.plans ?? [];
  const flatFound = flat.find((p) => p.id === planId);
  if (flatFound) return { category, plan: flatFound };

  return null;
}

export function emptyFormConfig(): FormConfig {
  return {
    selectionType: "amounts",
    fields: [],
    plans: [],
  };
}