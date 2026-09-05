import type { MerchantStorefrontProduct, MerchantTemplateCategory } from "@/types/merchant-storefront";

export const storefrontTemplateCategories: {
  value: MerchantTemplateCategory;
  label: string;
  emoji: string;
}[] = [
  { value: "cosmetics", label: "Cosmetics", emoji: "💄" },
  { value: "clothing", label: "Clothing", emoji: "👕" },
  { value: "garden", label: "Garden", emoji: "🌱" },
  { value: "accessories", label: "Accessories", emoji: "👜" },
  { value: "electronics", label: "Electronics", emoji: "📱" },
  { value: "home", label: "Home & Living", emoji: "🏠" },
  { value: "food", label: "Food & Beverage", emoji: "🍔" },
  { value: "sports", label: "Sports & Fitness", emoji: "⚽" },
  { value: "health", label: "Health & Wellness", emoji: "💪" },
  { value: "general", label: "General", emoji: "🛍️" },
];

export const mockStorefrontProducts: MerchantStorefrontProduct[] = [
  {
    id: "prod1",
    name: "Vitamin C Face Serum",
    description: "Brightening serum with vitamin C.",
    price: 120,
    salePrice: 99,
    images: ["🧴"],
    categoryId: "cat1",
    inStock: true,
    featured: true,
  },
  {
    id: "prod2",
    name: "Shea Butter Body Cream",
    description: "Moisturizing body cream.",
    price: 85,
    images: ["🧴"],
    categoryId: "cat1",
    inStock: true,
    featured: true,
  },
  {
    id: "prod3",
    name: "Aloe Vera Gel",
    description: "Soothing aloe vera gel.",
    price: 65,
    images: ["🌿"],
    categoryId: "cat1",
    inStock: true,
    featured: true,
  },
  {
    id: "prod4",
    name: "Lip Glow Kit",
    description: "Complete lip care set.",
    price: 150,
    images: ["💄"],
    categoryId: "cat2",
    inStock: true,
    featured: true,
  },
  {
    id: "prod5",
    name: "Charcoal Face Mask",
    description: "Deep cleansing face mask.",
    price: 95,
    images: ["🖤"],
    categoryId: "cat1",
    inStock: false,
    featured: false,
  },
  {
    id: "prod6",
    name: "Coconut Oil Hair Food",
    description: "Nourishing hair food.",
    price: 70,
    images: ["🥥"],
    categoryId: "cat3",
    inStock: true,
    featured: false,
  },
];