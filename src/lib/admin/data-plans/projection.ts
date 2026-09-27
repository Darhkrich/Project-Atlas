import type { PlanCategory, ServiceCategory } from "@/lib/domains/catalog";
import { slugify } from "@/lib/domains/catalog";
import type { DataNetwork, DataPlanCategory } from "../types/data-plan";
import { HISTORY_CAP } from "./constants";

const DATA_SERVICE_ID = "data";

function networkIdFor(networkName: string): string {
  return "net-" + slugify(networkName);
}

function categoryIdFor(networkName: string, categoryName: string): string {
  return "cat-" + slugify(networkName) + "-" + slugify(categoryName);
}

function findDataService(
  categories: ServiceCategory[]
): ServiceCategory | undefined {
  return categories.find((c) => c.id === DATA_SERVICE_ID);
}

function getNetworkTree(
  categories: ServiceCategory[]
): Record<string, PlanCategory[]> {
  const data = findDataService(categories);
  return data?.formConfig?.networkPlanCategories ?? {};
}

export function projectNetworksFromCatalog(
  categories: ServiceCategory[]
): DataNetwork[] {
  const tree = getNetworkTree(categories);
  const networks: DataNetwork[] = [];

  for (const [networkName, planCategories] of Object.entries(tree)) {
    const cats: DataPlanCategory[] = planCategories.map((cat) => ({
      id: categoryIdFor(networkName, cat.name),
      name: cat.name,
      plans: cat.plans.map((plan) => ({
        ...plan,
        statusHistory: plan.statusHistory?.slice(-HISTORY_CAP) ?? [],
      })),
    }));

    networks.push({
      id: networkIdFor(networkName),
      name: networkName,
      categories: cats,
    });
  }

  return networks;
}

export function applyNetworkMutation(
  categories: ServiceCategory[],
  networkName: string,
  mutation: (categories: PlanCategory[]) => PlanCategory[]
): ServiceCategory[] {
  return categories.map((service) => {
    if (service.id !== DATA_SERVICE_ID) return service;

    const tree = service.formConfig?.networkPlanCategories ?? {};
    const current = tree[networkName] ?? [];
    const next = mutation(current).map((cat) => ({
      ...cat,
      plans: cat.plans.map((plan) => ({
        ...plan,
        statusHistory: plan.statusHistory?.slice(-HISTORY_CAP) ?? [],
      })),
    }));

    return {
      ...service,
      formConfig: {
        ...(service.formConfig ?? { fields: [] }),
        networkPlanCategories: {
          ...tree,
          [networkName]: next,
        },
      },
    };
  });
}

export function applyNetworkTreeMutation(
  categories: ServiceCategory[],
  mutation: (
    tree: Record<string, PlanCategory[]>
  ) => Record<string, PlanCategory[]>
): ServiceCategory[] {
  return categories.map((service) => {
    if (service.id !== DATA_SERVICE_ID) return service;

    const tree = service.formConfig?.networkPlanCategories ?? {};
    const next = mutation(tree);

    return {
      ...service,
      formConfig: {
        ...(service.formConfig ?? { fields: [] }),
        networkPlanCategories: next,
      },
    };
  });
}

const DAYS_REGEX = /(\d+)\s*(day|days)/i;
const HOURS_REGEX = /(\d+)\s*(hour|hours|hr|hrs)/i;
const MINUTES_REGEX = /(\d+)\s*(minute|minutes|min|mins)/i;

export function extractValidity(description: string): string {
  if (!description) return "";

  const days = description.match(DAYS_REGEX);
  if (days) {
    const n = Number(days[1]);
    return n === 1 ? "1 day" : `${n} days`;
  }

  const hours = description.match(HOURS_REGEX);
  if (hours) {
    const n = Number(hours[1]);
    return n === 1 ? "1 hour" : `${n} hours`;
  }

  const minutes = description.match(MINUTES_REGEX);
  if (minutes) {
    const n = Number(minutes[1]);
    return n === 1 ? "1 minute" : `${n} minutes`;
  }

  const lower = description.toLowerCase();
  if (lower.includes("no expiry") || lower.includes("non-expiry")) {
    return "No expiry";
  }
  if (lower.includes("unlimited")) {
    return "Unlimited";
  }

  return "";
}

export function buildNetworkId(
  networkName: string,
  existing: string[]
): string {
  const base = networkIdFor(networkName);
  if (!existing.includes(base)) return base;

  let suffix = 2;
  while (existing.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function buildCategoryId(
  networkName: string,
  categoryName: string,
  existing: string[]
): string {
  const base = categoryIdFor(networkName, categoryName);
  if (!existing.includes(base)) return base;

  let suffix = 2;
  while (existing.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}