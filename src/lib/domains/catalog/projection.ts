import type {
  ServiceCategory,
  Plan,
  PlanPricingRow,
  CategoryRollupRow,
} from "./types";
import {
  allPlansFor,
  networksFor,
  planStatusOf,
  sortedByDisplayOrder,
} from "./helpers";
import { CATALOG_DEFAULT_COMMISSION_RATE_PERCENT } from "./constants";
import { CATEGORY_LABEL } from "./labels";

export type NetworkView = {
  id: string;
  name: string;
  categories: CategoryView[];
};

export type CategoryView = {
  id: string;
  name: string;
  plans: Plan[];
};

/**
 * Groups network-tree categories into a network-first view. Flat categories
 * render as a single pseudo-network keyed by the category id. This is what
 * the Data Plans page renders.
 */
export function projectNetworks(
  categories: ServiceCategory[]
): NetworkView[] {
  const out: NetworkView[] = [];
  for (const category of categories) {
    const tree = category.formConfig?.networkPlanCategories;
    if (!tree) continue;
    for (const [networkName, planCats] of Object.entries(tree)) {
      out.push({
        id: networkName,
        name: networkName,
        categories: planCats.map((cat, idx) => ({
          id: category.id + ":" + networkName + ":" + idx,
          name: cat.name,
          plans: cat.plans,
        })),
      });
    }
  }
  return out;
}

export function projectPricingRows(
  categories: ServiceCategory[]
): PlanPricingRow[] {
  const rows: PlanPricingRow[] = [];
  for (const category of categories) {
    const tree = category.formConfig?.networkPlanCategories;
    if (tree) {
      for (const [network, cats] of Object.entries(tree)) {
        for (const cat of cats) {
          for (const plan of cat.plans) {
            rows.push(rowFor(category, plan, network));
          }
        }
      }
      continue;
    }
    for (const plan of category.formConfig?.plans ?? []) {
      rows.push(rowFor(category, plan));
    }
  }
  return rows;
}

function rowFor(
  category: ServiceCategory,
  plan: Plan,
  network?: string
): PlanPricingRow {
  const providerCost = plan.providerCost ?? 0;
  const atlasPrice = plan.price;
  const resellerPrice = plan.price;
  const margin = atlasPrice - providerCost;
  const marginPercent = atlasPrice > 0 ? (margin / atlasPrice) * 100 : 0;
  return {
    planId: plan.id,
    categoryId: category.id,
    categoryName: category.name,
    planName: plan.name,
    network,
    validity: plan.validity,
    typeTag: plan.typeTag,
    providerCost,
    providerCostInferred: plan.providerCostInferred === true,
    atlasPrice,
    resellerPrice,
    commissionRatePercent: CATALOG_DEFAULT_COMMISSION_RATE_PERCENT,
    margin,
    marginPercent,
    status: planStatusOf(plan),
    active: plan.active !== false,
  };
}

export function projectCategoryRollup(
  categories: ServiceCategory[]
): CategoryRollupRow[] {
  return categories.map((category) => {
    const plans = allPlansFor(category);
    let totalProviderCost = 0;
    let totalAtlasPrice = 0;
    let marginSum = 0;
    let activePlanCount = 0;
    for (const plan of plans) {
      const providerCost = plan.providerCost ?? 0;
      totalProviderCost += providerCost;
      totalAtlasPrice += plan.price;
      if (plan.price > 0) {
        marginSum += ((plan.price - providerCost) / plan.price) * 100;
      }
      if (plan.active !== false) activePlanCount += 1;
    }
    return {
      categoryId: category.id,
      categoryName: CATEGORY_LABEL[category.id] ?? category.name,
      planCount: plans.length,
      activePlanCount,
      averageMarginPercent:
        plans.length > 0 ? marginSum / plans.length : 0,
      totalProviderCost,
      totalAtlasPrice,
    };
  });
}

export function projectCategories(
  categories: ServiceCategory[]
): ServiceCategory[] {
  return sortedByDisplayOrder(categories);
}

export function projectNetworkNames(
  categories: ServiceCategory[]
): string[] {
  const set = new Set<string>();
  for (const category of categories) {
    for (const network of networksFor(category)) {
      set.add(network);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}