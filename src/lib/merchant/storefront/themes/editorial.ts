import type { ThemeDefinition } from "./types";

export const editorial: ThemeDefinition = {
  id: "editorial",
  label: "Editorial",
  description:
    "Warm and considered. Serif headlines, centered layouts, thin dividers. Suits storytelling brands.",

  layout: {
    containerWidth: "max-w-6xl",
    sectionSpacing: "py-24 sm:py-28",
    sectionSpacingCompact: "py-16 sm:py-20",
    heroLayout: "centered",
    gridGap: "gap-6",
    cardPadding: "p-6",
  },

  typography: {
    heroTitle:
      "text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight font-serif",
    sectionTitle: "text-2xl sm:text-3xl font-medium tracking-wide font-serif",
    sectionEyebrow:
      "text-xs font-semibold uppercase tracking-widest text-neutral-400",
    body: "text-base leading-8",
    price: "text-lg font-semibold",
  },

  color: {
    heroBg: "bg-neutral-100",
    pageBg: "bg-neutral-50",
    sectionBg: "bg-white",
    surface: "bg-white",
    textPrimary: "text-neutral-900",
    textMuted: "text-neutral-600",
    priceColor: "neutral",
  },

  components: {
    card: "rounded-lg border border-neutral-300 bg-white",
    cardHover: "hover:border-neutral-400 transition-colors",
    buttonPrimary: "rounded-md px-6 py-3 text-sm font-semibold text-white",
    buttonSecondary:
      "rounded-md border border-neutral-900 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-900 hover:text-white",
    badge: "rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",
    divider: "border-t-2 border-neutral-900",
  },

  imagery: {
    heroAspect: "aspect-[4/5]",
    productAspect: "aspect-[4/5]",
    productFit: "cover",
    productHover: "transition-opacity duration-300 group-hover:opacity-90",
  },
};