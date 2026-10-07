import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

/**
 * Controls the overall hero composition used by a theme.
 */
export type ThemeHeroLayout =
  | "side-image"
  | "centered"
  | "minimal-split"
  | "full-bleed";

/**
 * Controls how prices are visually emphasized.
 */
export type ThemePriceColor = "primary" | "accent" | "neutral";

/**
 * Controls how product imagery is fitted inside its container.
 */
export type ThemeProductFit = "cover" | "contain";

/**
 * Controls the visual structure of product grids.
 *
 * These are intentionally structural rather than purely cosmetic.
 * This allows the same template to feel meaningfully different
 * across Airy, Statement, Editorial, and Studio.
 */
export type ThemeProductGrid =
  | "standard"
  | "dense"
  | "editorial"
  | "minimal";

/**
 * Controls the visual treatment of product cards.
 */
export type ThemeProductCard =
  | "soft"
  | "sharp"
  | "editorial"
  | "clean";

/**
 * Controls the visual treatment of category/collection sections.
 */
export type ThemeCategoryLayout =
  | "cards"
  | "tiles"
  | "editorial"
  | "minimal";

/**
 * Controls how promotional content is presented.
 */
export type ThemePromoLayout =
  | "card"
  | "split"
  | "full-width"
  | "editorial";

/**
 * Controls the navigation style.
 */
export type ThemeNavigationLayout =
  | "standard"
  | "bold"
  | "editorial"
  | "minimal";

/**
 * Controls the footer structure.
 */
export type ThemeFooterLayout =
  | "standard"
  | "expanded"
  | "editorial"
  | "minimal";

/**
 * Theme-level layout configuration.
 */
export interface ThemeLayoutDefinition {
  containerWidth: string;
  sectionSpacing: string;
  sectionSpacingCompact: string;

  heroLayout: ThemeHeroLayout;

  /**
   * Product grid structure.
   */
  productGrid: ThemeProductGrid;

  /**
   * Category/collection structure.
   */
  categoryLayout: ThemeCategoryLayout;

  /**
   * Promotional section structure.
   */
  promoLayout: ThemePromoLayout;

  /**
   * Navigation structure.
   */
  navigationLayout: ThemeNavigationLayout;

  /**
   * Footer structure.
   */
  footerLayout: ThemeFooterLayout;

  gridGap: string;
  cardPadding: string;
}

/**
 * Theme typography configuration.
 */
export interface ThemeTypographyDefinition {
  heroTitle: string;
  sectionTitle: string;
  sectionEyebrow: string;
  body: string;
  price: string;

  /**
   * Product name typography.
   */
  productTitle: string;

  /**
   * Navigation typography.
   */
  navigation: string;

  /**
   * Small metadata such as SKU, category, condition, etc.
   */
  metadata: string;

  /**
   * Button typography.
   */
  button: string;
}

/**
 * Theme color configuration.
 *
 * These are theme defaults. Merchant branding should be applied
 * separately through the storefront branding configuration.
 */
export interface ThemeColorDefinition {
  heroBg: string;
  pageBg: string;
  sectionBg: string;
  surface: string;

  textPrimary: string;
  textMuted: string;

  border: string;
  borderStrong: string;

  accent: string;
  accentSoft: string;

  priceColor: ThemePriceColor;
}

/**
 * Shared component styling.
 */
export interface ThemeComponentDefinition {
  card: string;
  cardHover: string;

  productCard: string;
  productCardHover: string;

  buttonPrimary: string;
  buttonSecondary: string;

  badge: string;

  input: string;

  divider: string;

  /**
   * Used for small interactive links.
   */
  link: string;
}

/**
 * Image treatment configuration.
 */
export interface ThemeImageryDefinition {
  heroAspect: string;
  productAspect: string;
  productFit: ThemeProductFit;

  productHover: string;

  /**
   * Controls the general visual treatment of images.
   */
  imageRadius: string;

  /**
   * Controls whether product images appear visually elevated.
   */
  imageTreatment: "flat" | "soft" | "framed";
}

/**
 * Structural variants allow themes to differ beyond colors.
 *
 * This is important for Atlas because the same industry template
 * should be capable of looking substantially different under
 * each theme.
 */
export interface ThemeVariantDefinition {
  hero: ThemeHeroLayout;
  productGrid: ThemeProductGrid;
  productCard: ThemeProductCard;
  categoryLayout: ThemeCategoryLayout;
  promoLayout: ThemePromoLayout;
  navigation: ThemeNavigationLayout;
  footer: ThemeFooterLayout;
}

/**
 * Complete Atlas storefront theme definition.
 *
 * Existing properties have been preserved for backwards compatibility.
 */
export interface ThemeDefinition {
  id: MerchantStorefrontTheme;
  label: string;
  description: string;

  layout: ThemeLayoutDefinition;

  typography: ThemeTypographyDefinition;

  color: ThemeColorDefinition;

  components: ThemeComponentDefinition;

  imagery: ThemeImageryDefinition;

  /**
   * Structural design variants.
   */
  variants: ThemeVariantDefinition;
}