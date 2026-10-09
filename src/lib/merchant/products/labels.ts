import type { ProductStatus, ProductSortKey } from "./types";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  Active: "Active",
  Draft: "Draft",
  Archived: "Archived",
};

export const PRODUCT_SORT_LABELS: Record<ProductSortKey, string> = {
  recent: "Newest first",
  name_asc: "Name (A to Z)",
  name_desc: "Name (Z to A)",
  price_asc: "Price (low to high)",
  price_desc: "Price (high to low)",
  stock_asc: "Stock (low to high)",
  stock_desc: "Stock (high to low)",
};

export const STOCK_LABEL_LOW = "Low";
export const STOCK_LABEL_OUT = "Out";
export const STOCK_LABEL_UNTRACKED = "\u2014";
export const UNCATEGORISED_LABEL = "Uncategorised";

export const PRODUCT_NAME_REQUIRED = "Product name is required.";
export const PRODUCT_NAME_TOO_LONG = "Product name is too long.";
export const PRODUCT_PRICE_REQUIRED = "Price is required.";
export const PRODUCT_PRICE_INVALID = "Price must be a number greater than 0.";
export const PRODUCT_SALE_PRICE_INVALID =
  "Sale price must be lower than the regular price.";
export const PRODUCT_STOCK_INVALID = "Stock must be zero or greater.";
export const PRODUCT_CATEGORY_REQUIRED = "Choose a category.";
export const PRODUCT_IMAGE_LIMIT_REACHED =
  "You can add up to 5 images per product.";
export const PRODUCT_IMAGE_TOO_LARGE =
  "Image is too large. Maximum size is 10MB.";
export const PRODUCT_IMAGE_INVALID_TYPE =
  "Only image files are supported.";
export const PRODUCT_SKU_DUPLICATE =
  "Another product already uses this SKU.";

export const PRODUCT_LIMIT_NEAR_TITLE = "Approaching your plan limit";
export const PRODUCT_LIMIT_AT_TITLE = "Plan limit reached";
export const PRODUCT_LIMIT_UNRESOLVED_TITLE =
  "Plan limit could not be checked";
export const PRODUCT_LIMIT_UNRESOLVED_BODY =
  "Your plan could not be loaded. Products can still be added, but the limit is not enforced until the plan resolves.";

export const PRODUCT_LIMIT_UPGRADE_CTA = "Upgrade plan";
export const PRODUCT_LIMIT_MANAGE_CTA = "Manage billing";
export const PRODUCT_LIMIT_ADD_BLOCKED_LABEL = "Upgrade to add";
export const PRODUCT_LIMIT_ADD_BLOCKED_TITLE =
  "Plan limit reached. Upgrade to add more products.";
export const PRODUCT_LIMIT_REDIRECT_NOTICE =
  "You have reached your plan limit.";
export const PRODUCT_LIMIT_NO_PLAN = "your current";