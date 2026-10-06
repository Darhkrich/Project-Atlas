import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

export type ThemeHeroLayout =
  | "side-image"
  | "centered"
  | "minimal-split"
  | "full-bleed";

export type ThemePriceColor = "primary" | "accent" | "neutral";

export type ThemeProductFit = "cover" | "contain";

export interface ThemeDefinition {
  id: MerchantStorefrontTheme;
  label: string;
  description: string;

  layout: {
    containerWidth: string;
    sectionSpacing: string;
    sectionSpacingCompact: string;
    heroLayout: ThemeHeroLayout;
    gridGap: string;
    cardPadding: string;
  };

  typography: {
    heroTitle: string;
    sectionTitle: string;
    sectionEyebrow: string;
    body: string;
    price: string;
  };

  color: {
    heroBg: string;
    pageBg: string;
    sectionBg: string;
    surface: string;
    textPrimary: string;
    textMuted: string;
    priceColor: ThemePriceColor;
  };

  components: {
    card: string;
    cardHover: string;
    buttonPrimary: string;
    buttonSecondary: string;
    badge: string;
    divider: string;
  };

  imagery: {
    heroAspect: string;
    productAspect: string;
    productFit: ThemeProductFit;
    productHover: string;
  };
}