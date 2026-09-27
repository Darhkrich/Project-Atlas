import type { ServiceCategory, Plan, CatalogActor } from "./types";
import { getCatalog, internalReplaceCategories } from "./store";
import { appendAuditEntry } from "@/lib/domains/audit";
import { CATALOG_ACTIONS, CATALOG_RESOURCE_TYPES } from "./audit-actions";
import { reorder } from "./helpers";

export function createCategory(input: {
  category: ServiceCategory;
  actor: CatalogActor;
}): ServiceCategory {
  const categories = getCatalog();
  if (categories.some((c) => c.id === input.category.id)) {
    throw new Error(
      "Catalog category id already exists: " + input.category.id
    );
  }
  const next = [...categories, input.category];
  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.CATEGORY_CREATE,
    resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
    resourceId: input.category.id,
    actor: input.actor,
    metadata: {
      name: input.category.name,
      filterGroup: input.category.filterGroup,
    },
  });
  return input.category;
}

export function updateCategory(input: {
  category: ServiceCategory;
  actor: CatalogActor;
  previous?: ServiceCategory;
}): ServiceCategory {
  const categories = getCatalog();
  const next = categories.map((c) => {
    if (c.id === input.category.id) return input.category;
    return c;
  });
  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.CATEGORY_UPDATE,
    resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
    resourceId: input.category.id,
    actor: input.actor,
    metadata: {
      name: input.category.name,
      renamed:
        input.previous !== undefined &&
        input.previous.name !== input.category.name,
      previousName: input.previous?.name,
    },
  });
  return input.category;
}

export function deleteCategory(input: {
  categoryId: string;
  actor: CatalogActor;
}): void {
  const categories = getCatalog();
  const target = categories.find((c) => c.id === input.categoryId);
  if (!target) return;
  const next = categories.filter((c) => c.id !== input.categoryId);
  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.CATEGORY_DELETE,
    resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
    resourceId: input.categoryId,
    actor: input.actor,
    metadata: { name: target.name },
  });
}

export function reorderCategory(input: {
  categoryId: string;
  direction: "up" | "down";
  actor: CatalogActor;
}): void {
  const categories = getCatalog();
  const next = reorder(categories, input.categoryId, input.direction);
  if (next === categories) return;
  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.CATEGORY_REORDER,
    resourceType: CATALOG_RESOURCE_TYPES.CATEGORY,
    resourceId: input.categoryId,
    actor: input.actor,
    metadata: { direction: input.direction },
  });
}

export function createPlan(input: {
  categoryId: string;
  network?: string;
  categoryName?: string;
  plan: Plan;
  actor: CatalogActor;
}): Plan {
  const categories = getCatalog();
  const category = categories.find((c) => c.id === input.categoryId);
  if (!category || !category.formConfig) {
    throw new Error(
      "Cannot create plan: category not found or has no form config"
    );
  }

  const next = categories.map((c) => {
    if (c.id !== input.categoryId) return c;
    const cfg = c.formConfig;
    if (!cfg) return c;

    if (
      input.network &&
      cfg.networkPlanCategories &&
      cfg.networkPlanCategories[input.network]
    ) {
      const targetName = input.categoryName;
      const netCats = cfg.networkPlanCategories[input.network].map((cat) => {
        if (targetName && cat.name !== targetName) return cat;
        return { ...cat, plans: [...cat.plans, input.plan] };
      });
      return {
        ...c,
        formConfig: {
          ...cfg,
          networkPlanCategories: {
            ...cfg.networkPlanCategories,
            [input.network]: netCats,
          },
        },
      };
    }

    return {
      ...c,
      formConfig: {
        ...cfg,
        plans: [...(cfg.plans ?? []), input.plan],
      },
    };
  });

  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.PLAN_CREATE,
    resourceType: CATALOG_RESOURCE_TYPES.PLAN,
    resourceId: input.plan.id,
    actor: input.actor,
    metadata: {
      categoryId: input.categoryId,
      network: input.network,
      name: input.plan.name,
      price: input.plan.price,
    },
  });
  return input.plan;
}

export function updatePlan(input: {
  plan: Plan;
  categoryId: string;
  network?: string;
  actor: CatalogActor;
}): Plan {
  const categories = getCatalog();

  const next = categories.map((c) => {
    if (c.id !== input.categoryId) return c;
    const cfg = c.formConfig;
    if (!cfg) return c;

    if (
      input.network &&
      cfg.networkPlanCategories?.[input.network]
    ) {
      const netCats = cfg.networkPlanCategories[input.network].map((cat) => ({
        ...cat,
        plans: cat.plans.map((p) =>
          p.id === input.plan.id ? input.plan : p
        ),
      }));
      return {
        ...c,
        formConfig: {
          ...cfg,
          networkPlanCategories: {
            ...cfg.networkPlanCategories,
            [input.network]: netCats,
          },
        },
      };
    }

    return {
      ...c,
      formConfig: {
        ...cfg,
        plans: (cfg.plans ?? []).map((p) =>
          p.id === input.plan.id ? input.plan : p
        ),
      },
    };
  });

  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.PLAN_UPDATE,
    resourceType: CATALOG_RESOURCE_TYPES.PLAN,
    resourceId: input.plan.id,
    actor: input.actor,
    metadata: {
      categoryId: input.categoryId,
      network: input.network,
      name: input.plan.name,
    },
  });
  return input.plan;
}

export function updatePlanPricing(input: {
  planId: string;
  categoryId: string;
  network?: string;
  changes: {
    providerCost: number;
    atlasPrice: number;
    resellerPrice: number;
    commissionRatePercent: number;
  };
  reason: string;
  actor: CatalogActor;
}): void {
  const categories = getCatalog();

  let previousProviderCost: number | undefined;
  let previousAtlasPrice: number | undefined;

  const next = categories.map((c) => {
    if (c.id !== input.categoryId) return c;
    const cfg = c.formConfig;
    if (!cfg) return c;

    if (
      input.network &&
      cfg.networkPlanCategories &&
      cfg.networkPlanCategories[input.network]
    ) {
      const netCats = cfg.networkPlanCategories[input.network].map((cat) => ({
        ...cat,
        plans: cat.plans.map((p) => {
          if (p.id !== input.planId) return p;
          previousProviderCost = p.providerCost;
          previousAtlasPrice = p.price;
          return {
            ...p,
            price: input.changes.atlasPrice,
            providerCost: input.changes.providerCost,
            providerCostInferred: false,
          };
        }),
      }));
      return {
        ...c,
        formConfig: {
          ...cfg,
          networkPlanCategories: {
            ...cfg.networkPlanCategories,
            [input.network]: netCats,
          },
        },
      };
    }

    return {
      ...c,
      formConfig: {
        ...cfg,
        plans: (cfg.plans ?? []).map((p) => {
          if (p.id !== input.planId) return p;
          previousProviderCost = p.providerCost;
          previousAtlasPrice = p.price;
          return {
            ...p,
            price: input.changes.atlasPrice,
            providerCost: input.changes.providerCost,
            providerCostInferred: false,
          };
        }),
      },
    };
  });

  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.PRICING_UPDATE,
    resourceType: CATALOG_RESOURCE_TYPES.PLAN,
    resourceId: input.planId,
    actor: input.actor,
    metadata: {
      categoryId: input.categoryId,
      network: input.network,
      providerCost: input.changes.providerCost,
      atlasPrice: input.changes.atlasPrice,
      resellerPrice: input.changes.resellerPrice,
      commissionRatePercent: input.changes.commissionRatePercent,
      previousProviderCost,
      previousAtlasPrice,
      reason: input.reason,
    },
  });
}

export function deletePlan(input: {
  planId: string;
  categoryId: string;
  network?: string;
  actor: CatalogActor;
  planName: string;
}): void {
  const categories = getCatalog();

  const next = categories.map((c) => {
    if (c.id !== input.categoryId) return c;
    const cfg = c.formConfig;
    if (!cfg) return c;

    if (
      input.network &&
      cfg.networkPlanCategories &&
      cfg.networkPlanCategories[input.network]
    ) {
      const netCats = cfg.networkPlanCategories[input.network].map((cat) => ({
        ...cat,
        plans: cat.plans.filter((p) => p.id !== input.planId),
      }));
      return {
        ...c,
        formConfig: {
          ...cfg,
          networkPlanCategories: {
            ...cfg.networkPlanCategories,
            [input.network]: netCats,
          },
        },
      };
    }

    return {
      ...c,
      formConfig: {
        ...cfg,
        plans: (cfg.plans ?? []).filter((p) => p.id !== input.planId),
      },
    };
  });

  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.PLAN_DELETE,
    resourceType: CATALOG_RESOURCE_TYPES.PLAN,
    resourceId: input.planId,
    actor: input.actor,
    metadata: {
      categoryId: input.categoryId,
      network: input.network,
      name: input.planName,
    },
  });
}

export function togglePlanActive(input: {
  planId: string;
  categoryId: string;
  network?: string;
  nextActive: boolean;
  actor: CatalogActor;
  planName: string;
}): void {
  const categories = getCatalog();

  const next = categories.map((c) => {
    if (c.id !== input.categoryId) return c;
    const cfg = c.formConfig;
    if (!cfg) return c;

    if (
      input.network &&
      cfg.networkPlanCategories &&
      cfg.networkPlanCategories[input.network]
    ) {
      const netCats = cfg.networkPlanCategories[input.network].map((cat) => ({
        ...cat,
        plans: cat.plans.map((p) =>
          p.id === input.planId ? { ...p, active: input.nextActive } : p
        ),
      }));
      return {
        ...c,
        formConfig: {
          ...cfg,
          networkPlanCategories: {
            ...cfg.networkPlanCategories,
            [input.network]: netCats,
          },
        },
      };
    }

    return {
      ...c,
      formConfig: {
        ...cfg,
        plans: (cfg.plans ?? []).map((p) =>
          p.id === input.planId ? { ...p, active: input.nextActive } : p
        ),
      },
    };
  });

  internalReplaceCategories(next);
  appendAuditEntry({
    action: CATALOG_ACTIONS.PLAN_TOGGLE,
    resourceType: CATALOG_RESOURCE_TYPES.PLAN,
    resourceId: input.planId,
    actor: input.actor,
    metadata: {
      categoryId: input.categoryId,
      network: input.network,
      name: input.planName,
      active: input.nextActive,
    },
  });
}