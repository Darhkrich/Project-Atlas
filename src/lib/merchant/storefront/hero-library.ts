import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export interface HeroLibraryImage {
  id: string;
  url: string;
  alt: string;
  categories: MerchantTemplateCategory[];
}

function u(id: string): string {
  return (
    "https://images.unsplash.com/" +
    id +
    "?w=1600&h=900&fit=crop&q=80"
  );
}

export const HERO_LIBRARY: HeroLibraryImage[] = [
  {
    id: "hero-cosmetics-1",
    url: u("photo-1596462502278-27bfdc403348"),
    alt: "Cosmetics flat lay on a neutral surface",
    categories: ["cosmetics", "health"],
  },
  {
    id: "hero-cosmetics-2",
    url: u("photo-1522335789203-aabd1fc54bc9"),
    alt: "Skincare products arranged on marble",
    categories: ["cosmetics", "health"],
  },
  {
    id: "hero-cosmetics-3",
    url: u("photo-1571781926291-c477ebfd024b"),
    alt: "Warm-toned beauty products",
    categories: ["cosmetics", "health"],
  },
  {
    id: "hero-clothing-1",
    url: u("photo-1445205170230-053b83016050"),
    alt: "Clothing rack with warm tones",
    categories: ["clothing", "accessories"],
  },
  {
    id: "hero-clothing-2",
    url: u("photo-1483985988355-763728e1935b"),
    alt: "Folded apparel on a wooden surface",
    categories: ["clothing", "accessories"],
  },
  {
    id: "hero-clothing-3",
    url: u("photo-1490481651871-ab68de25d43d"),
    alt: "Fashion editorial shot",
    categories: ["clothing"],
  },
  {
    id: "hero-accessories-1",
    url: u("photo-1611591437281-460bfbe1220a"),
    alt: "Accessories arranged on a surface",
    categories: ["accessories", "clothing"],
  },
  {
    id: "hero-accessories-2",
    url: u("photo-1548036328-c9fa89d128fa"),
    alt: "Leather bag and accessories",
    categories: ["accessories"],
  },
  {
    id: "hero-garden-1",
    url: u("photo-1416879595882-3373a0480b5b"),
    alt: "Green plants in soft light",
    categories: ["garden", "home"],
  },
  {
    id: "hero-garden-2",
    url: u("photo-1466692476868-aef1dfb1e735"),
    alt: "Potted plants near a window",
    categories: ["garden", "home"],
  },
  {
    id: "hero-electronics-1",
    url: u("photo-1498049794561-7780e7231661"),
    alt: "Desk with electronics",
    categories: ["electronics"],
  },
  {
    id: "hero-electronics-2",
    url: u("photo-1505740420928-5e560c06d30e"),
    alt: "Headphones on a yellow background",
    categories: ["electronics"],
  },
  {
    id: "hero-electronics-3",
    url: u("photo-1523275335684-37898b6baf30"),
    alt: "Smartwatch on a clean surface",
    categories: ["electronics"],
  },
  {
    id: "hero-home-1",
    url: u("photo-1586023492125-27b2c045efd7"),
    alt: "Modern living room with warm light",
    categories: ["home"],
  },
  {
    id: "hero-home-2",
    url: u("photo-1513694203232-719a280e022f"),
    alt: "Minimal interior with plants",
    categories: ["home"],
  },
  {
    id: "hero-home-3",
    url: u("photo-1556228720-195a672e8a03"),
    alt: "Warm kitchen shelf",
    categories: ["home"],
  },
  {
    id: "hero-food-1",
    url: u("photo-1542838132-92c53300491e"),
    alt: "Fresh produce on a market stall",
    categories: ["food"],
  },
  {
    id: "hero-food-2",
    url: u("photo-1519996529931-28324d5a630e"),
    alt: "Coffee and pastry setup",
    categories: ["food"],
  },
  {
    id: "hero-food-3",
    url: u("photo-1504674900247-0877df9cc836"),
    alt: "Warm plated dish",
    categories: ["food"],
  },
  {
    id: "hero-sports-1",
    url: u("photo-1517836357463-d25dfeac3438"),
    alt: "Sports gear on a floor",
    categories: ["sports", "health"],
  },
  {
    id: "hero-sports-2",
    url: u("photo-1552674605-db6ffd4facb5"),
    alt: "Running shoes on a track",
    categories: ["sports"],
  },
  {
    id: "hero-health-1",
    url: u("photo-1544367567-0f2fcb009e0b"),
    alt: "Wellness flat lay",
    categories: ["health"],
  },
  {
    id: "hero-health-2",
    url: u("photo-1506126613408-eca07ce68773"),
    alt: "Yoga mat and accessories",
    categories: ["health", "sports"],
  },
  {
    id: "hero-general-1",
    url: u("photo-1441986300917-64674bd600d8"),
    alt: "Storefront with warm light",
    categories: ["general", "home", "accessories"],
  },
  {
    id: "hero-general-2",
    url: u("photo-1556742049-0cfed4f6a45d"),
    alt: "Retail counter",
    categories: ["general"],
  },
  {
    id: "hero-general-3",
    url: u("photo-1567401893414-76b7b1e5a7a5"),
    alt: "Boutique interior",
    categories: ["general", "clothing"],
  },
  {
    id: "hero-general-4",
    url: u("photo-1528698827591-e19ccd7bc23d"),
    alt: "Marketplace stall",
    categories: ["general", "food"],
  },
];

export function heroLibraryFor(
  category: MerchantTemplateCategory
): HeroLibraryImage[] {
  const matching = HERO_LIBRARY.filter((img) =>
    img.categories.includes(category)
  );
  if (matching.length > 0) return matching;
  return HERO_LIBRARY.filter((img) =>
    img.categories.includes("general")
  );
}

export function allHeroImages(): HeroLibraryImage[] {
  return HERO_LIBRARY;
}