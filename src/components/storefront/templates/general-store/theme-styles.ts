import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

export const generalStoreThemeStyles: Record<
  MerchantStorefrontTheme,
  {
    heroBg: string;
    heroText: string;
    button: string;
    card: string;
    sectionBg: string;
  }
> = {
  modern: {
    heroBg: "bg-neutral-50",
    heroText: "text-neutral-950",
    button: "rounded-xl",
    card: "rounded-2xl border border-neutral-200",
    sectionBg: "bg-white",
  },
  classic: {
    heroBg: "bg-neutral-100",
    heroText: "text-neutral-950",
    button: "rounded-lg",
    card: "rounded-lg border border-neutral-200",
    sectionBg: "bg-white",
  },
  minimal: {
    heroBg: "bg-white",
    heroText: "text-neutral-950",
    button: "rounded-full",
    card: "rounded-none shadow-none border-0",
    sectionBg: "bg-transparent",
  },
  bold: {
    heroBg: "bg-neutral-950",
    heroText: "text-white",
    button: "rounded-none uppercase tracking-wider",
    card: "rounded-none border-2 border-neutral-900",
    sectionBg: "bg-neutral-100",
  },
};