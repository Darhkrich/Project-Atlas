// lib/admin/ecommerce/support/support-constants.ts

export const ECOMMERCE_SUPPORT_PAGE_SIZE = 8;

export const ECOMMERCE_SUPPORT_WINDOW_DAYS = 1;

export const ECOMMERCE_SUPPORT_FILTER_DEFAULTS = {
  q: "",
  status: "",
  priority: "",
  category: "",
  assignee: "",
  view: "all",
  page: "1",
} as const;

export type EcommerceSupportFilterKey =
  keyof typeof ECOMMERCE_SUPPORT_FILTER_DEFAULTS;

export const ECOMMERCE_SUPPORT_DEFAULT_SORT = {
  key: "updatedAt",
  direction: "desc",
} as const;

export type EcommerceSupportSortKey =
  | "updatedAt"
  | "createdAt"
  | "priority"
  | "slaDueAt";

export type EcommerceSupportSortDirection = "asc" | "desc";

export function merchantPath(merchantId: string): string {
  return "/admin/ecommerce/merchants/" + merchantId;
}

export function orderPath(orderId: string): string {
  return "/admin/orders/" + orderId;
}

export function subscriptionPath(subscriptionId: string): string {
  return "/admin/ecommerce/subscriptions/" + subscriptionId;
}

export function templatePath(templateId: string): string {
  return "/admin/ecommerce/templates/" + templateId;
}

export function storefrontPath(storefrontId: string): string {
  return "/admin/ecommerce/storefronts/" + storefrontId;
}