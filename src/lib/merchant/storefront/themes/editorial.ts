import type { ThemeDefinition } from "./types";

export const editorial: ThemeDefinition = {
  id: "editorial",
  label: "Editorial",
  description:
    "Warm and considered. Refined typography, generous composition, thin dividers, and storytelling-led layouts.",

  layout: {
    containerWidth: "max-w-6xl",
    sectionSpacing: "py-24 sm:py-28",
    sectionSpacingCompact: "py-16 sm:py-20",

    heroLayout: "centered",
    productGrid: "editorial",
    categoryLayout: "editorial",
    promoLayout: "editorial",
    navigationLayout: "editorial",
    footerLayout: "editorial",

    gridGap: "gap-6",
    cardPadding: "p-6",
  },

  typography: {
    heroTitle:
      "text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight font-serif",

    sectionTitle:
      "text-2xl sm:text-3xl font-medium tracking-wide font-serif",

    sectionEyebrow:
      "text-xs font-semibold uppercase tracking-widest text-neutral-400",

    body:
      "text-base leading-8",

    price:
      "text-lg font-semibold",

    productTitle:
      "text-sm sm:text-base font-medium tracking-tight font-serif",

    navigation:
      "text-sm font-medium tracking-wide",

    metadata:
      "text-[11px] font-medium uppercase tracking-widest text-neutral-400",

    button:
      "text-sm font-semibold",
  },

  color: {
    heroBg: "bg-neutral-100",
    pageBg: "bg-neutral-50",
    sectionBg: "bg-white",
    surface: "bg-white",

    textPrimary: "text-neutral-900",
    textMuted: "text-neutral-600",

    border: "border-neutral-200",
    borderStrong: "border-neutral-300",

    accent: "text-neutral-900",
    accentSoft: "bg-neutral-100",

    priceColor: "neutral",
  },

  components: {
    card:
      "rounded-lg border border-neutral-300 bg-white",

    cardHover:
      "hover:border-neutral-400 transition-colors duration-200",

    productCard:
      "rounded-lg border border-neutral-200 bg-white overflow-hidden",

    productCardHover:
      "hover:border-neutral-400 transition-colors duration-300",

    buttonPrimary:
      "rounded-md px-6 py-3 text-sm font-semibold text-white",

    buttonSecondary:
      "rounded-md border border-neutral-900 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-900 hover:text-white",

    badge:
      "rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",

    input:
      "rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900",

    divider:
      "border-t border-neutral-300",

    link:
      "text-sm font-medium underline underline-offset-4",
  },

  imagery: {
    heroAspect: "aspect-[4/5]",
    productAspect: "aspect-[4/5]",
    productFit: "cover",

    productHover:
      "transition-opacity duration-300 group-hover:opacity-90",

    imageRadius:
      "rounded-lg",

    imageTreatment:
      "framed",
  },

  variants: {
    hero: "centered",
    productGrid: "editorial",
    productCard: "editorial",
    categoryLayout: "editorial",
    promoLayout: "editorial",
    navigation: "editorial",
    footer: "editorial",
  },
};