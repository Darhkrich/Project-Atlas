import type { MerchantCategory } from "@/lib/merchant/categories/types";

// Resolves whatever is stored on a product's categoryId to a display label.
// Older products stored a category name. Newer products store the category
// UUID. Both resolve to the same label so chips and filters work on either.
export function resolveCategoryLabel(
  rawCategoryId: string,
  categories: MerchantCategory[]
): string {
  if (!rawCategoryId) return rawCategoryId;

  const byId = categories.find((c) => c.id === rawCategoryId);
  if (byId) return byId.name;

  const lower = rawCategoryId.toLowerCase();
  const byName = categories.find((c) => c.name.toLowerCase() === lower);
  if (byName) return byName.name;

  return rawCategoryId;
}