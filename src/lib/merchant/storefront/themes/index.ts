import type { MerchantStorefrontTheme } from "@/types/merchant-storefront";
import type { ThemeDefinition } from "./types";
import { airy } from "./airy";
import { editorial } from "./editorial";
import { studio } from "./studio";
import { statement } from "./statement";

export type { ThemeDefinition, ThemeHeroLayout, ThemePriceColor, ThemeProductFit } from "./types";

const THEMES: Record<MerchantStorefrontTheme, ThemeDefinition> = {
  airy,
  editorial,
  studio,
  statement,
};

export const ALL_THEME_DEFINITIONS: ThemeDefinition[] = [
  airy,
  editorial,
  studio,
  statement,
];

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