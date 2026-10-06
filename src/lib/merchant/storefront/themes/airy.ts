import type { ThemeDefinition } from "./types";

export const airy: ThemeDefinition = {
  id: "airy",
  label: "Airy",
  description:
    "Light and spacious. Soft shadows, rounded cards, comfortable rhythm. Works for any category.",

  layout: {
    containerWidth: "max-w-7xl",
    sectionSpacing: "py-20 sm:py-24",
    sectionSpacingCompact: "py-12 sm:py-16",
    heroLayout: "side-image",
    gridGap: "gap-4",
    cardPadding: "p-4",
  },

  typography: {
    heroTitle: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
    sectionTitle: "text-2xl sm:text-3xl font-semibold tracking-tight",
    sectionEyebrow:
      "text-xs font-semibold uppercase tracking-wider text-neutral-500",
    body: "text-base leading-7",
    price: "text-lg font-bold",
  },

  color: {
    heroBg: "bg-neutral-50",
    pageBg: "bg-white",
    sectionBg: "bg-white",
    surface: "bg-white",
    textPrimary: "text-neutral-950",
    textMuted: "text-neutral-500",
    priceColor: "primary",
  },

  components: {
    card: "rounded-2xl border border-neutral-200 bg-white shadow-sm",
    cardHover: "hover:shadow-md transition-shadow",
    buttonPrimary: "rounded-xl px-6 py-3 text-sm font-semibold text-white",
    buttonSecondary:
      "rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50",
    badge: "rounded-full px-2.5 py-1 text-xs font-semibold",
    divider: "border-t border-neutral-200",
  },

  imagery: {
    heroAspect: "aspect-[3/4]",
    productAspect: "aspect-[4/5]",
    productFit: "cover",
    productHover:
      "transition-transform duration-500 group-hover:scale-105",
  },
};