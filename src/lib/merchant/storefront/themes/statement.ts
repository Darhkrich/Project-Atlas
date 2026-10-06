import type { ThemeDefinition } from "./types";

export const statement: ThemeDefinition = {
  id: "statement",
  label: "Statement",
  description:
    "Bold and unapologetic. Dark surfaces, sharp corners, big type. For brands that want to shout.",

  layout: {
    containerWidth: "max-w-7xl",
    sectionSpacing: "py-16 sm:py-20",
    sectionSpacingCompact: "py-10 sm:py-12",
    heroLayout: "full-bleed",
    gridGap: "gap-3",
    cardPadding: "p-4",
  },

  typography: {
    heroTitle:
      "text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight",
    sectionTitle:
      "text-3xl sm:text-5xl font-black uppercase tracking-tight",
    sectionEyebrow:
      "text-sm font-bold uppercase tracking-wider",
    body: "text-lg leading-7",
    price: "text-2xl font-black",
  },

  color: {
    heroBg: "bg-neutral-950",
    pageBg: "bg-neutral-100",
    sectionBg: "bg-neutral-900",
    surface: "bg-neutral-900",
    textPrimary: "text-white",
    textMuted: "text-neutral-300",
    priceColor: "accent",
  },

  components: {
    card: "rounded-none border-2 border-neutral-900 bg-white",
    cardHover: "hover:shadow-lg transition-shadow",
    buttonPrimary:
      "rounded-none px-8 py-4 text-sm font-bold uppercase tracking-wider text-white",
    buttonSecondary:
      "rounded-none border-2 border-neutral-900 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-900 hover:text-white",
    badge: "rounded-none px-2 py-1 text-xs font-bold uppercase tracking-wider",
    divider: "border-t-4 border-neutral-900",
  },

  imagery: {
    heroAspect: "aspect-[16/9]",
    productAspect: "aspect-square",
    productFit: "cover",
    productHover:
      "transition-transform duration-300 group-hover:scale-110",
  },
};