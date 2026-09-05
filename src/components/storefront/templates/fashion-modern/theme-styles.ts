import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

export const fashionModernThemeStyles: Record<
  MerchantStorefrontTheme,
  { heroBg: string; heroText: string; button: string; card: string }
> = {
  modern: {
    heroBg: "bg-neutral-950",
    heroText: "text-white",
    button: "rounded-none uppercase tracking-wider",
    card: "rounded-none border border-neutral-200",
  },
  classic: {
    heroBg: "bg-neutral-100",
    heroText: "text-neutral-950",
    button: "rounded-lg",
    card: "rounded-lg border border-neutral-200",
  },
  minimal: {
    heroBg: "bg-white",
    heroText: "text-neutral-950",
    button: "rounded-full",
    card: "rounded-none shadow-none border-0",
  },
  bold: {
    heroBg: "bg-neutral-950",
    heroText: "text-white",
    button: "rounded-none uppercase tracking-wider",
    card: "rounded-none border-2 border-neutral-900",
  },
};