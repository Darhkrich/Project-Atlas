export const CATALOG_STORAGE_KEY = "atlas-catalog-v1";
export const CATALOG_PERSISTENCE_DEBOUNCE_MS = 100;
export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
export const CATALOG_PLAN_ID_SEPARATOR = ":";
export const CATALOG_INFERRED_PROVIDER_COST_RATE = 0.85;
export const CATALOG_DEFAULT_COMMISSION_RATE_PERCENT = 5;

export const CATALOG_RESERVED_CATEGORY_IDS = [
  "airtime",
  "data",
  "cabletv",
  "electricity",
  "internet",
  "billpayments",
  "exampins",
  "giftcards",
] as const;

export const CATALOG_SORT_KEYS = [
  "name",
  "category",
  "network",
  "atlasPrice",
  "marginPercent",
  "status",
  "displayOrder",
] as const;

export type CatalogSortKey = (typeof CATALOG_SORT_KEYS)[number];

export const CATALOG_FILTER_GROUPS = [
  "all",
  "airtime",
  "data",
  "tv",
  "bills",
  "more",
] as const;