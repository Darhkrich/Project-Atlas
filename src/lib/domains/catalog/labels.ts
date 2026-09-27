import type { FilterGroup, CategoryStatus, PlanStatus } from "./types";

export const CATEGORY_LABEL: Record<string, string> = {
  airtime: "Airtime",
  data: "Data",
  cabletv: "Cable TV",
  electricity: "Electricity",
  internet: "Internet",
  billpayments: "Bill Payments",
  exampins: "Exam Pins",
  giftcards: "Gift Cards",
};

export const FILTER_GROUP_LABEL: Record<FilterGroup, string> = {
  all: "All",
  airtime: "Airtime",
  data: "Data",
  tv: "TV",
  bills: "Bills",
  more: "More",
};

export const CATEGORY_STATUS_LABEL: Record<CategoryStatus, string> = {
  available: "Available",
  coming_soon: "Coming soon",
  inactive: "Inactive",
};

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

/**
 * Maps canonical catalog category id to the alias used by the consuming
 * domain. `cabletv` is `tv` to pricing and promotions. `exampins` is
 * `exam_pins` to pricing and `results` to support. `electricity` and
 * `billpayments` both collapse to `bills`.
 */
export const CATEGORY_ALIASES: Record<string, string> = {
  cabletv: "tv",
  exampins: "exam_pins",
  electricity: "bills",
  billpayments: "bills",
  internet: "other",
  giftcards: "other",
};

/**
 * Reverse map. Resolves a consuming domain alias back to the canonical
 * catalog category id. Ambiguous aliases resolve to the first canonical
 * category in the reserved list. `bills` resolves to `electricity` because
 * it appears first.
 */
export const CATEGORY_ALIASES_TO_CATALOG: Record<string, string> = {
  tv: "cabletv",
  exam_pins: "exampins",
  results: "exampins",
  bills: "electricity",
  other: "internet",
};

export function categoryLabel(id: string): string {
  return CATEGORY_LABEL[id] ?? id;
}

export function resolveAlias(alias: string): string | undefined {
  return CATEGORY_ALIASES_TO_CATALOG[alias];
}

export function aliasFor(categoryId: string): string | undefined {
  return CATEGORY_ALIASES[categoryId];
}