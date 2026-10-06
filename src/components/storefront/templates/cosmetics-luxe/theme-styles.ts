import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

export const cosmeticsLuxeThemeStyles: Record<
  MerchantStorefrontTheme,
  { heroBg: string; heroText: string; button: string; card: string }
> = {
  airy: {
    heroBg: "bg-[#faf8f5]",
    heroText: "text-neutral-950",
    button: "rounded-full",
    card: "rounded-3xl border border-neutral-100",
  },
  editorial: {
    heroBg: "bg-neutral-100",
    heroText: "text-neutral-950",
    button: "rounded-lg",
    card: "rounded-2xl border border-neutral-200",
  },
  studio: {
    heroBg: "bg-white",
    heroText: "text-neutral-950",
    button: "rounded-full",
    card: "rounded-none shadow-none border-0",
  },
  statement: {
    heroBg: "bg-neutral-950",
    heroText: "text-white",
    button: "rounded-none uppercase tracking-wider",
    card: "rounded-none border-2 border-neutral-900",
  },
};