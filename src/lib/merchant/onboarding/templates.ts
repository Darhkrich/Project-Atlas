import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  attributes: string[];
  recommendedFor: MerchantTemplateCategory[];
}

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    id: "tpl-general-store",
    name: "General Store",
    description: "Versatile layout for any type of online store.",
    thumbnail:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
    attributes: ["Product grid", "Cart and checkout", "Responsive design"],
    recommendedFor: [
      "general",
      "home",
      "food",
      "sports",
      "health",
      "garden",
      "accessories",
      "electronics",
    ],
  },
  {
    id: "tpl-cosmetics-luxe",
    name: "Cosmetics Luxe",
    description: "Elegant layout for beauty and skincare brands.",
    thumbnail:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop",
    attributes: ["Hero banner", "Featured products", "Elegant theme"],
    recommendedFor: ["cosmetics"],
  },
  {
    id: "tpl-fashion-modern",
    name: "Fashion Modern",
    description: "Clean and modern for fashion and apparel.",
    thumbnail:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=500&fit=crop",
    attributes: ["Lookbook section", "Category spotlight", "Bold hero"],
    recommendedFor: ["clothing"],
  },
];

export const DEFAULT_TEMPLATE_ID = "tpl-general-store";

export function getTemplateById(id: string): OnboardingTemplate | undefined {
  return ONBOARDING_TEMPLATES.find((t) => t.id === id);
}

export function recommendTemplate(
  category: MerchantTemplateCategory
): OnboardingTemplate {
  const match = ONBOARDING_TEMPLATES.find((t) =>
    t.recommendedFor.includes(category)
  );
  return match ?? ONBOARDING_TEMPLATES[0];
}

export function templateLabel(id: string): string {
  return getTemplateById(id)?.name ?? id;
}