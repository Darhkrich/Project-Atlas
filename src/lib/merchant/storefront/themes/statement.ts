import type { ThemeDefinition } from "./types";

export const statement: ThemeDefinition = {
  id: "statement",
  label: "Statement",
  description:
    "Bold and unapologetic. Strong typography, high contrast, sharp geometry, and expressive product presentation.",

  layout: {
    containerWidth: "max-w-7xl",
    sectionSpacing: "py-16 sm:py-20",
    sectionSpacingCompact: "py-10 sm:py-12",

    heroLayout: "full-bleed",
    productGrid: "dense",
    categoryLayout: "tiles",
    promoLayout: "full-width",
    navigationLayout: "bold",
    footerLayout: "expanded",

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

    body:
      "text-lg leading-7",

    price:
      "text-2xl font-black",

    productTitle:
      "text-sm font-bold uppercase tracking-tight",

    navigation:
      "text-xs font-bold uppercase tracking-wider",

    metadata:
      "text-[11px] font-bold uppercase tracking-wider text-neutral-400",

    button:
      "text-sm font-bold uppercase tracking-wider",
  },

  color: {
    heroBg: "bg-neutral-950",
    pageBg: "bg-neutral-100",
    sectionBg: "bg-neutral-900",
    surface: "bg-neutral-900",

    textPrimary: "text-white",
    textMuted: "text-neutral-300",

    border: "border-neutral-800",
    borderStrong: "border-neutral-950",

    accent: "text-accent",
    accentSoft: "bg-accent/10",

    priceColor: "accent",
  },

  components: {
    card:
      "rounded-none border-2 border-neutral-900 bg-white",

    cardHover:
      "hover:shadow-lg transition-shadow duration-200",

    productCard:
      "rounded-none border-2 border-neutral-900 bg-white overflow-hidden",

    productCardHover:
      "hover:-translate-y-1 hover:shadow-xl transition-all duration-200",

    buttonPrimary:
      "rounded-none px-8 py-4 text-sm font-bold uppercase tracking-wider text-white",

    buttonSecondary:
      "rounded-none border-2 border-neutral-900 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-900 hover:text-white",

    badge:
      "rounded-none px-2 py-1 text-xs font-bold uppercase tracking-wider",

    input:
      "rounded-none border-2 border-neutral-900 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-neutral-900/20",

    divider:
      "border-t-4 border-neutral-900",

    link:
      "text-sm font-bold uppercase tracking-wider underline decoration-2 underline-offset-4",
  },

  imagery: {
    heroAspect: "aspect-[16/9]",
    productAspect: "aspect-square",
    productFit: "cover",

    productHover:
      "transition-transform duration-300 group-hover:scale-110",

    imageRadius:
      "rounded-none",

    imageTreatment:
      "flat",
  },

  variants: {
    hero: "full-bleed",
    productGrid: "dense",
    productCard: "sharp",
    categoryLayout: "tiles",
    promoLayout: "full-width",
    navigation: "bold",
    footer: "expanded",
  },
};