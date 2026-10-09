import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export type TemplateStatus = "available" | "coming_soon";

export interface TemplateCatalogEntry {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  attributes: string[];
  recommendedFor: MerchantTemplateCategory[];
  status: TemplateStatus;
}

export const TEMPLATE_CATEGORY_ORDER: MerchantTemplateCategory[] = [
  "general",
  "cosmetics",
  "clothing",
  "accessories",
  "electronics",
  "home",
  "food",
  "garden",
  "sports",
  "health",
];

export const TEMPLATE_CATEGORY_LABELS: Record<
  MerchantTemplateCategory,
  string
> = {
  general: "General",
  cosmetics: "Cosmetics",
  clothing: "Clothing",
  accessories: "Accessories",
  electronics: "Electronics",
  home: "Home",
  food: "Food",
  garden: "Garden",
  sports: "Sports",
  health: "Health",
};

export const DEFAULT_TEMPLATE_ID = "tpl-general-store";

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  // General
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
    status: "available",
  },
  {
    id: "tpl-minimal-one",
    name: "Minimal One",
    description: "Sparse, product-first layout with very little chrome.",
    attributes: ["Big images", "Quiet typography", "Single-column flow"],
    recommendedFor: ["general"],
    status: "coming_soon",
  },

  // Cosmetics
  {
    id: "tpl-cosmetics-luxe",
    name: "Cosmetics Luxe",
    description: "Elegant layout for beauty and skincare brands.",
    thumbnail:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop",
    attributes: ["Hero banner", "Featured products", "Elegant theme"],
    recommendedFor: ["cosmetics"],
    status: "available",
  },
  {
    id: "tpl-skincare-studio",
    name: "Skincare Studio",
    description: "Clinical and calm. Built for ingredient-led skincare.",
    attributes: ["Ingredient list", "Routine builder", "Soft palette"],
    recommendedFor: ["cosmetics", "health"],
    status: "coming_soon",
  },
  {
    id: "tpl-spa-retreat",
    name: "Spa Retreat",
    description: "Warm and editorial. Booking-friendly for spa services.",
    attributes: ["Services grid", "Business hours", "Contact card"],
    recommendedFor: ["cosmetics", "health"],
    status: "coming_soon",
  },

  // Clothing
  {
    id: "tpl-fashion-modern",
    name: "Fashion Modern",
    description: "Clean and modern for fashion and apparel.",
    thumbnail:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=500&fit=crop",
    attributes: ["Lookbook section", "Category spotlight", "Bold hero"],
    recommendedFor: ["clothing"],
    status: "available",
  },
  {
    id: "tpl-streetwear-bold",
    name: "Streetwear Bold",
    description: "Big type, high contrast, urban mood.",
    attributes: ["Full-bleed hero", "Bold typography", "Drop countdown"],
    recommendedFor: ["clothing", "accessories"],
    status: "coming_soon",
  },
  {
    id: "tpl-boutique-soft",
    name: "Boutique Soft",
    description: "Warm, small-shop feel. Suits boutique clothing brands.",
    attributes: ["Soft palette", "Editorial spacing", "Featured collection"],
    recommendedFor: ["clothing"],
    status: "coming_soon",
  },

  // Accessories
  {
    id: "tpl-jewelry-showcase",
    name: "Jewelry Showcase",
    description: "Close-up imagery and quiet detail pages.",
    attributes: ["Zoom gallery", "Material notes", "Gift packaging note"],
    recommendedFor: ["accessories"],
    status: "coming_soon",
  },
  {
    id: "tpl-watch-boutique",
    name: "Watch Boutique",
    description: "Precision-led, with spec sheets and comparison rows.",
    attributes: ["Spec sheet", "Comparison rows", "Editorial hero"],
    recommendedFor: ["accessories"],
    status: "coming_soon",
  },
  {
    id: "tpl-bags-leather",
    name: "Bags & Leather",
    description: "Craft-focused. Suits leather goods and handmade bags.",
    attributes: ["Story section", "Materials list", "Lookbook"],
    recommendedFor: ["accessories"],
    status: "coming_soon",
  },

  // Electronics
  {
    id: "tpl-gadget-store",
    name: "Gadget Store",
    description: "Fast-browse layout for phones, laptops, and accessories.",
    attributes: ["Spec cards", "Compare bar", "Search forward"],
    recommendedFor: ["electronics"],
    status: "coming_soon",
  },
  {
    id: "tpl-phone-shop",
    name: "Phone Shop",
    description: "Phone-first. Suits unlocked phones and phone accessories.",
    attributes: ["Model grid", "Trade-in note", "Carrier info"],
    recommendedFor: ["electronics"],
    status: "coming_soon",
  },
  {
    id: "tpl-computer-parts",
    name: "Computer Parts",
    description: "Dense spec-first layout for PC builders and repair shops.",
    attributes: ["Spec table", "Compatibility note", "Bulk quantity"],
    recommendedFor: ["electronics"],
    status: "coming_soon",
  },

  // Home
  {
    id: "tpl-home-living",
    name: "Home & Living",
    description: "Warm, room-based browsing for home goods.",
    attributes: ["Room categories", "Lookbook", "Big hero"],
    recommendedFor: ["home"],
    status: "coming_soon",
  },
  {
    id: "tpl-furniture-studio",
    name: "Furniture Studio",
    description: "Room-first, editorial layouts. Suits furniture makers.",
    attributes: ["Room scenes", "Dimensions", "Made-to-order note"],
    recommendedFor: ["home"],
    status: "coming_soon",
  },
  {
    id: "tpl-decor-boutique",
    name: "Decor Boutique",
    description: "Curated decor, gift-friendly. Small object focus.",
    attributes: ["Curated grid", "Gift note", "Editorial hero"],
    recommendedFor: ["home", "accessories"],
    status: "coming_soon",
  },

  // Food
  {
    id: "tpl-restaurant-menu",
    name: "Restaurant Menu",
    description: "Menu-first layout for restaurants and cafes.",
    attributes: ["Menu sections", "Opening hours", "Order note"],
    recommendedFor: ["food"],
    status: "coming_soon",
  },
  {
    id: "tpl-grocery-store",
    name: "Grocery Store",
    description: "Category-first browsing for groceries and staples.",
    attributes: ["Category grid", "Bulk quantity", "Delivery zones"],
    recommendedFor: ["food"],
    status: "coming_soon",
  },
  {
    id: "tpl-bakery-sweet",
    name: "Bakery Sweet",
    description: "Warm and inviting. Suits bakeries and pastry shops.",
    attributes: ["Cake gallery", "Order-ahead note", "Custom orders"],
    recommendedFor: ["food"],
    status: "coming_soon",
  },
  {
    id: "tpl-food-truck",
    name: "Food Truck",
    description: "Simple menu with daily location and hours.",
    attributes: ["Today's menu", "Location card", "Hours"],
    recommendedFor: ["food"],
    status: "coming_soon",
  },

  // Garden
  {
    id: "tpl-garden-green",
    name: "Garden Green",
    description: "Outdoor-friendly layout for garden centres and nurseries.",
    attributes: ["Season filter", "Plant care notes", "Delivery zones"],
    recommendedFor: ["garden"],
    status: "coming_soon",
  },
  {
    id: "tpl-plant-shop",
    name: "Plant Shop",
    description: "Small-space indoor plants. Calm, editorial.",
    attributes: ["Plant care", "Size guide", "Soft palette"],
    recommendedFor: ["garden", "home"],
    status: "coming_soon",
  },

  // Sports
  {
    id: "tpl-sports-gear",
    name: "Sports Gear",
    description: "Equipment-forward. Suits sports shops and teams.",
    attributes: ["Category grid", "Size guide", "Team orders"],
    recommendedFor: ["sports"],
    status: "coming_soon",
  },
  {
    id: "tpl-fitness-shop",
    name: "Fitness Shop",
    description: "Bold and energetic. Suits supplements and gym gear.",
    attributes: ["Bold hero", "Bundle offers", "Routine builder"],
    recommendedFor: ["sports", "health"],
    status: "coming_soon",
  },

  // Health
  {
    id: "tpl-pharmacy-store",
    name: "Pharmacy Store",
    description: "Clean, trust-first layout for pharmacies.",
    attributes: ["Category grid", "Prescription note", "Delivery zones"],
    recommendedFor: ["health"],
    status: "coming_soon",
  },
  {
    id: "tpl-wellness-shop",
    name: "Wellness Shop",
    description: "Calm, ingredient-led layout for supplements and wellness.",
    attributes: ["Ingredient notes", "Routine builder", "Soft palette"],
    recommendedFor: ["health"],
    status: "coming_soon",
  },
];

export function getTemplateById(
  id: string
): TemplateCatalogEntry | undefined {
  return TEMPLATE_CATALOG.find((t) => t.id === id);
}

export function templateLabel(id: string): string {
  return getTemplateById(id)?.name ?? id;
}

export function recommendTemplate(
  category: MerchantTemplateCategory
): TemplateCatalogEntry {
  const match = TEMPLATE_CATALOG.find(
    (t) => t.status === "available" && t.recommendedFor.includes(category)
  );
  if (match) return match;
  const fallback = getTemplateById(DEFAULT_TEMPLATE_ID);
  return fallback ?? TEMPLATE_CATALOG[0];
}

export function templatesForCategory(
  category: MerchantTemplateCategory
): TemplateCatalogEntry[] {
  return TEMPLATE_CATALOG.filter((t) => t.recommendedFor.includes(category));
}

export function templatesByCategory(): {
  category: MerchantTemplateCategory;
  label: string;
  templates: TemplateCatalogEntry[];
}[] {
  return TEMPLATE_CATEGORY_ORDER.map((category) => ({
    category,
    label: TEMPLATE_CATEGORY_LABELS[category],
    templates: templatesForCategory(category),
  })).filter((section) => section.templates.length > 0);
}

export function availableTemplateIds(): string[] {
  return TEMPLATE_CATALOG.filter((t) => t.status === "available").map(
    (t) => t.id
  );
}