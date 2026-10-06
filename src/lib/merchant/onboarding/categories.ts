import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export interface OnboardingCategory {
  value: MerchantTemplateCategory;
  label: string;
  description: string;
  abbreviation: string;
  image: string;
}

export const ONBOARDING_CATEGORIES: OnboardingCategory[] = [
  {
    value: "cosmetics",
    label: "Cosmetics",
    description: "Beauty and skincare",
    abbreviation: "CO",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop",
  },
  {
    value: "clothing",
    label: "Clothing",
    description: "Fashion and apparel",
    abbreviation: "CL",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
  },
  {
    value: "garden",
    label: "Garden",
    description: "Plants and outdoor living",
    abbreviation: "GA",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
  },
  {
    value: "accessories",
    label: "Accessories",
    description: "Jewelry and add-ons",
    abbreviation: "AC",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop",
  },
  {
    value: "electronics",
    label: "Electronics",
    description: "Devices and gadgets",
    abbreviation: "EL",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
  },
  {
    value: "home",
    label: "Home and Living",
    description: "Furniture and decor",
    abbreviation: "HO",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  },
  {
    value: "food",
    label: "Food and Beverage",
    description: "Groceries and drinks",
    abbreviation: "FO",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  },
  {
    value: "sports",
    label: "Sports and Fitness",
    description: "Gear and equipment",
    abbreviation: "SP",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
  },
  {
    value: "health",
    label: "Health and Wellness",
    description: "Care and supplements",
    abbreviation: "HE",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
  },
  {
    value: "general",
    label: "General",
    description: "A bit of everything",
    abbreviation: "GE",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
  },
];

export function getCategoryLabel(value: MerchantTemplateCategory): string {
  return ONBOARDING_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}