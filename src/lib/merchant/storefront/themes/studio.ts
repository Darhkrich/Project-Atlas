import type { ThemeDefinition } from "./types";

export const studio: ThemeDefinition = {
  id: "studio",
  label: "Studio",
  description:
    "Pure and minimal. Precise typography, open space, restrained controls, and product-first composition.",

  layout: {
    containerWidth: "max-w-7xl",
    sectionSpacing: "py-28 sm:py-32",
    sectionSpacingCompact: "py-20 sm:py-24",

    heroLayout: "minimal-split",
    productGrid: "minimal",
    categoryLayout: "minimal",
    promoLayout: "split",
    navigationLayout: "minimal",
    footerLayout: "minimal",

    gridGap: "gap-8",
    cardPadding: "p-0",
  },

  typography: {
    heroTitle:
      "text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter",

    sectionTitle:
      "text-3xl sm:text-4xl font-light tracking-tight",

    sectionEyebrow:
      "text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400",

    body:
      "text-base leading-7",

    price:
      "text-lg font-normal",

    productTitle:
      "text-sm font-medium tracking-tight",

    navigation:
      "text-xs font-medium uppercase tracking-wider",

    metadata:
      "text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400",

    button:
      "text-sm font-medium",
  },

  color: {
    heroBg: "bg-white",
    pageBg: "bg-white",
    sectionBg: "bg-white",
    surface: "bg-transparent",

    textPrimary: "text-neutral-900",
    textMuted: "text-neutral-500",

    border: "border-neutral-100",
    borderStrong: "border-neutral-300",

    accent: "text-neutral-900",
    accentSoft: "bg-neutral-100",

    priceColor: "neutral",
  },

  components: {
    card:
      "rounded-none border-0 bg-transparent",

    cardHover:
      "hover:opacity-80 transition-opacity duration-200",

    productCard:
      "rounded-none border-0 bg-transparent overflow-hidden",

    productCardHover:
      "hover:opacity-80 transition-opacity duration-300",

    buttonPrimary:
      "rounded-none px-6 py-3 text-sm font-medium uppercase tracking-wider text-white",

    buttonSecondary:
      "rounded-none border-b border-neutral-900 px-0 py-2 text-sm font-medium text-neutral-900",

    badge:
      "rounded-none text-[10px] font-medium uppercase tracking-[0.2em]",

    input:
      "rounded-none border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-sm outline-none focus:border-neutral-900",

    divider:
      "border-t border-neutral-100",

    link:
      "text-sm font-medium underline-offset-4 hover:underline",
  },

  imagery: {
    heroAspect: "aspect-square",
    productAspect: "aspect-square",
    productFit: "cover",

    productHover:
      "transition-opacity duration-300 group-hover:opacity-80",

    imageRadius:
      "rounded-none",

    imageTreatment:
      "flat",
  },

  variants: {
    hero: "minimal-split",
    productGrid: "minimal",
    productCard: "clean",
    categoryLayout: "minimal",
    promoLayout: "split",
    navigation: "minimal",
    footer: "minimal",
  },
};