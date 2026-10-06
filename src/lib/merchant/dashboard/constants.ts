import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export const LOW_STOCK_THRESHOLD = 5;
export const RECENT_ORDERS_LIMIT = 5;
export const ACTION_QUEUE_LIMIT = 6;

export const CATEGORY_LABELS: Record<MerchantTemplateCategory, string> = {
  cosmetics: "Cosmetics",
  clothing: "Clothing",
  garden: "Garden",
  accessories: "Accessories",
  electronics: "Electronics",
  home: "Home",
  food: "Food",
  sports: "Sports",
  health: "Health",
  general: "General",
};