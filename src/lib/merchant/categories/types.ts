export interface MerchantCategory {
  id: string;
  name: string;
  order: number;
  system: boolean;
  createdAt: number;
}

export const OTHER_CATEGORY_ID = "cat-system-other";

export function isSystemCategory(category: MerchantCategory): boolean {
  return category.system === true;
}