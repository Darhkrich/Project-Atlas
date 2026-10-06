export type BrandingField =
  | "tagline"
  | "description"
  | "heroTitle"
  | "heroDescription";

export interface SuggestionSet {
  field: BrandingField;
  variants: string[];
}

// Curated suggestions per field. Deterministic, no randomness. The panel
// shifts through the arrays so the merchant always sees the same content
// in the same order.
export const BRANDING_SUGGESTIONS: SuggestionSet[] = [
  {
    field: "tagline",
    variants: [
      "Quality you can feel.",
      "Made with care, priced with sense.",
      "Everyday essentials, done well.",
      "Shop local. Shop better.",
      "Small shop, big selection.",
    ],
  },
  {
    field: "description",
    variants: [
      "A curated collection, ready when you are. Fast delivery across Ghana.",
      "We bring you the best of what we sell. Simple, honest, dependable.",
      "Independent shop serving customers across Ghana since day one.",
      "Handpicked products, fair prices, and a checkout that respects your time.",
    ],
  },
  {
    field: "heroTitle",
    variants: [
      "Welcome to our store",
      "Find something you love",
      "Browse the collection",
      "Shop the latest",
    ],
  },
  {
    field: "heroDescription",
    variants: [
      "Quality products, fast delivery, secure checkout. Start shopping today.",
      "A small shop with a big selection. Built for Ghana.",
      "Take a look around. Everything ships from Accra.",
      "Fast dispatch, easy returns, real customer service.",
    ],
  },
];

const MAP = new Map<BrandingField, string[]>(
  BRANDING_SUGGESTIONS.map((s) => [s.field, s.variants])
);

export function suggestionsFor(field: BrandingField): string[] {
  return MAP.get(field) ?? [];
}

export function nextSuggestions(
  field: BrandingField,
  currentOffset: number,
  count = 3
): { items: string[]; nextOffset: number } {
  const all = suggestionsFor(field);
  if (all.length === 0) return { items: [], nextOffset: 0 };
  const items: string[] = [];
  for (let i = 0; i < Math.min(count, all.length); i += 1) {
    items.push(all[(currentOffset + i) % all.length]);
  }
  return {
    items,
    nextOffset: (currentOffset + count) % all.length,
  };
}