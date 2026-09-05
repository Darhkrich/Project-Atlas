import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export const productCategoriesByTemplate: Record<MerchantTemplateCategory, string[]> = {
  cosmetics: ["Skincare", "Body Care", "Makeup", "Hair Care", "Fragrance", "Other"],
  clothing: ["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories", "Other"],
  garden: ["Plants", "Tools", "Outdoor", "Decor", "Other"],
  accessories: ["Jewelry", "Bags", "Sunglasses", "Watches", "Other"],
  electronics: ["Phones", "Laptops", "Accessories", "Audio", "Other"],
  home: ["Furniture", "Kitchen", "Decor", "Bedding", "Other"],
  food: ["Snacks", "Beverages", "Ingredients", "Other"],
  sports: ["Fitness", "Outdoor", "Team Sports", "Other"],
  health: ["Supplements", "Personal Care", "Fitness", "Other"],
  general: ["Electronics", "Home", "Fashion", "Beauty", "Other"],
};

export function getCategoriesForTemplate(
  templateCategory: MerchantTemplateCategory
): string[] {
  return productCategoriesByTemplate[templateCategory] || productCategoriesByTemplate.general;
}