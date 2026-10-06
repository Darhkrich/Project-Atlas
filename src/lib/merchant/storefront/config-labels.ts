import type {
  DayOfWeek,
  StorefrontCornerRadius,
  StorefrontFont,
  StorefrontGridDensity,
  WwwRedirect,
} from "@/types/merchant-storefront";

export const STOREFRONT_FONT_LABEL: Record<StorefrontFont, string> = {
  atlas: "Atlas Sans",
  serif: "Serif",
  rounded: "Rounded",
  mono: "Monospace",
};

export const STOREFRONT_FONT_DESCRIPTION: Record<StorefrontFont, string> = {
  atlas: "Clean and modern. The Atlas default.",
  serif: "Traditional and editorial.",
  rounded: "Soft and friendly.",
  mono: "Technical and precise.",
};

export const STOREFRONT_FONT_CLASS: Record<StorefrontFont, string> = {
  atlas: "font-sans",
  serif: "font-serif",
  rounded: "font-sans tracking-normal",
  mono: "font-mono",
};

export const STOREFRONT_CORNER_RADIUS_LABEL: Record<
  StorefrontCornerRadius,
  string
> = {
  sharp: "Sharp",
  soft: "Soft",
  round: "Round",
};

export const STOREFRONT_CORNER_RADIUS_DESCRIPTION: Record<
  StorefrontCornerRadius,
  string
> = {
  sharp: "Square corners. Modern and serious.",
  soft: "Slightly rounded. Balanced.",
  round: "Fully rounded. Friendly.",
};

export const STOREFRONT_CORNER_RADIUS_CLASS: Record<
  StorefrontCornerRadius,
  string
> = {
  sharp: "rounded-none",
  soft: "rounded-lg",
  round: "rounded-2xl",
};

export const STOREFRONT_GRID_DENSITY_LABEL: Record<
  StorefrontGridDensity,
  string
> = {
  2: "2 columns",
  3: "3 columns",
  4: "4 columns",
};

export const STOREFRONT_GRID_DENSITY_DESCRIPTION: Record<
  StorefrontGridDensity,
  string
> = {
  2: "Best for large product images.",
  3: "Best for most stores.",
  4: "Best for wide catalogs with small images.",
};

export const WWW_REDIRECT_LABEL: Record<WwwRedirect, string> = {
  none: "No redirect",
  www_to_apex: "Redirect www to apex",
  apex_to_www: "Redirect apex to www",
};

export const WWW_REDIRECT_DESCRIPTION: Record<WwwRedirect, string> = {
  none: "Both www and the apex domain work. No redirect.",
  www_to_apex: "yourstore.com wins. www.yourstore.com redirects to it.",
  apex_to_www: "www.yourstore.com wins. yourstore.com redirects to it.",
};

export const DAY_OF_WEEK_LABEL: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DAY_OF_WEEK_SHORT: Record<DayOfWeek, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const FONT_OPTIONS: StorefrontFont[] = [
  "atlas",
  "serif",
  "rounded",
  "mono",
];

export const CORNER_RADIUS_OPTIONS: StorefrontCornerRadius[] = [
  "sharp",
  "soft",
  "round",
];

export const GRID_DENSITY_OPTIONS: StorefrontGridDensity[] = [2, 3, 4];

export const WWW_REDIRECT_OPTIONS: WwwRedirect[] = [
  "none",
  "www_to_apex",
  "apex_to_www",
];

export const DAY_OF_WEEK_ORDER: DayOfWeek[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];