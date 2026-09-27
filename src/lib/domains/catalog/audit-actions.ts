export const CATALOG_ACTIONS = {
  CATEGORY_CREATE: "catalog.category.create",
  CATEGORY_UPDATE: "catalog.category.update",
  CATEGORY_DELETE: "catalog.category.delete",
  CATEGORY_REORDER: "catalog.category.reorder",
  PLAN_CREATE: "catalog.plan.create",
  PLAN_UPDATE: "catalog.plan.update",
  PLAN_DELETE: "catalog.plan.delete",
  PLAN_REORDER: "catalog.plan.reorder",
  PLAN_TOGGLE: "catalog.plan.toggle",
  PRICING_UPDATE: "catalog.pricing.update",
} as const;

export type CatalogAction =
  (typeof CATALOG_ACTIONS)[keyof typeof CATALOG_ACTIONS];

export const CATALOG_RESOURCE_TYPES = {
  CATEGORY: "catalog_category",
  PLAN: "catalog_plan",
  NETWORK: "catalog_network",
} as const;

export type CatalogResourceType =
  (typeof CATALOG_RESOURCE_TYPES)[keyof typeof CATALOG_RESOURCE_TYPES];