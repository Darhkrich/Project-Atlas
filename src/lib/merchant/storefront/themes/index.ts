/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";

import { airy } from "./airy";
import { editorial } from "./editorial";
import { statement } from "./statement";
import { studio } from "./studio";

import type {
  ThemeCategoryLayout,
  ThemeDefinition,
  ThemeFooterLayout,
  ThemeHeroLayout,
  ThemeNavigationLayout,
  ThemePriceColor,
  ThemeProductCard,
  ThemeProductFit,
  ThemeProductGrid,
  ThemePromoLayout,
} from "./types";

export type {
  ThemeCategoryLayout,
  ThemeDefinition,
  ThemeFooterLayout,
  ThemeHeroLayout,
  ThemeNavigationLayout,
  ThemePriceColor,
  ThemeProductCard,
  ThemeProductFit,
  ThemeProductGrid,
  ThemePromoLayout,
} from "./types";

/**
 * Central Atlas theme registry.
 *
 * Every supported storefront theme must be registered here.
 */
const THEMES: Record<MerchantStorefrontTheme, ThemeDefinition> = {
  airy,
  editorial,
  statement,
  studio,
};

/**
 * Ordered theme definitions used by theme selectors,
 * admin interfaces, onboarding and storefront previews.
 */
export const ALL_THEME_DEFINITIONS: ThemeDefinition[] = [
  airy,
  editorial,
  statement,
  studio,
];

/**
 * Safely resolve a storefront theme.
 *
 * Airy remains the fallback theme because it is the
 * safest general-purpose storefront experience.
 */
export function getThemeDefinition(
  id: MerchantStorefrontTheme
): ThemeDefinition {
  return THEMES[id] ?? airy;
}

export function themeLabel(id: MerchantStorefrontTheme): string {
  return getThemeDefinition(id).label;
}

export function themeDescription(id: MerchantStorefrontTheme): string {
  return getThemeDefinition(id).description;
}