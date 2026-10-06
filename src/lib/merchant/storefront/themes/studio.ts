import type { ThemeDefinition } from "./types";

export const studio: ThemeDefinition = {
  id: "studio",
  label: "Studio",
  description:
    "Pure and minimal. No corners, no shadows, generous whitespace. Lets the product speak.",

  layout: {
    containerWidth: "max-w-7xl",
    sectionSpacing: "py-28 sm:py-32",
    sectionSpacingCompact: "py-20 sm:py-24",
    heroLayout: "minimal-split",
    gridGap: "gap-8",
    cardPadding: "p-0",
  },

  typography: {
    heroTitle:
      "text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter",
    sectionTitle: "text-3xl sm:text-4xl font-light tracking-tight",
    sectionEyebrow:
      "text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400",
    body: "text-base leading-7",
    price: "text-lg font-normal",
  },

  color: {
    heroBg: "bg-white",
    pageBg: "bg-white",
    sectionBg: "bg-white",
    surface: "bg-transparent",
    textPrimary: "text-neutral-900",
    textMuted: "text-neutral-500",
    priceColor: "neutral",
  },

  components: {
    card: "rounded-none border-0 bg-transparent",
    cardHover: "hover:opacity-80 transition-opacity",
    buttonPrimary:
      "rounded-none px-6 py-3 text-sm font-medium uppercase tracking-wider text-white",
    buttonSecondary:
      "rounded-none border-b border-neutral-900 px-0 py-2 text-sm font-medium text-neutral-900",
    badge: "rounded-none text-[10px] font-medium uppercase tracking-[0.2em]",
    divider: "border-t border-neutral-100",
  },

  imagery: {
    heroAspect: "aspect-square",
    productAspect: "aspect-square",
    productFit: "cover",
    productHover: "transition-opacity duration-300 group-hover:opacity-80",
  },
};