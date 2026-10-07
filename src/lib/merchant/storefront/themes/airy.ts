import type { ThemeDefinition } from "./types";

export const airy: ThemeDefinition = {
  id: "airy",
  label: "Airy",
  description:
    "Light and spacious. Soft surfaces, comfortable rhythm, generous whitespace, and approachable product presentation.",

  layout: {
    containerWidth: "max-w-7xl",
    sectionSpacing: "py-20 sm:py-24",
    sectionSpacingCompact: "py-12 sm:py-16",

    heroLayout: "side-image",
    productGrid: "standard",
    categoryLayout: "cards",
    promoLayout: "split",
    navigationLayout: "standard",
    footerLayout: "standard",

    gridGap: "gap-4",
    cardPadding: "p-4",
  },

  typography: {
    heroTitle:
      "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",

    sectionTitle:
      "text-2xl sm:text-3xl font-semibold tracking-tight",

    sectionEyebrow:
      "text-xs font-semibold uppercase tracking-wider text-neutral-500",

    body: "text-base leading-7",

    price: "text-lg font-bold",

    productTitle:
      "text-sm sm:text-base font-medium tracking-tight",

    navigation:
      "text-sm font-medium",

    metadata:
      "text-xs font-medium text-neutral-500",

    button:
      "text-sm font-semibold",
  },

  color: {
    heroBg: "bg-neutral-50",
    pageBg: "bg-white",
    sectionBg: "bg-white",
    surface: "bg-white",

    textPrimary: "text-neutral-950",
    textMuted: "text-neutral-500",

    border: "border-neutral-200",
    borderStrong: "border-neutral-300",

    accent: "text-primary",
    accentSoft: "bg-primary/10",

    priceColor: "primary",
  },

  components: {
    card:
      "rounded-2xl border border-neutral-200 bg-white shadow-sm",

    cardHover:
      "hover:shadow-md transition-shadow duration-200",

    productCard:
      "rounded-2xl border border-neutral-200 bg-white overflow-hidden",

    productCardHover:
      "hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",

    buttonPrimary:
      "rounded-xl px-6 py-3 text-sm font-semibold text-white",

    buttonSecondary:
      "rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50",

    badge:
      "rounded-full px-2.5 py-1 text-xs font-semibold",

    input:
      "rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10",

    divider:
      "border-t border-neutral-200",

    link:
      "text-sm font-medium text-neutral-900 underline-offset-4 hover:underline",
  },

  imagery: {
    heroAspect: "aspect-[3/4]",
    productAspect: "aspect-[4/5]",
    productFit: "cover",

    productHover:
      "transition-transform duration-500 group-hover:scale-105",

    imageRadius:
      "rounded-2xl",

    imageTreatment:
      "soft",
  },

  variants: {
    hero: "side-image",
    productGrid: "standard",
    productCard: "soft",
    categoryLayout: "cards",
    promoLayout: "split",
    navigation: "standard",
    footer: "standard",
  },
};