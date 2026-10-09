import type { MediaUsage } from "./types";

export const MAX_MEDIA_ASSETS = 30;
export const MAX_UPLOAD_DIMENSION = 2000;
export const UPLOAD_JPEG_QUALITY = 0.82;
export const UPLOAD_TARGET_KB = 400;

export const MEDIA_USAGE_LABELS: Record<MediaUsage, string> = {
  hero: "Hero image",
  hero_background: "Hero background",
  promo_before_hero: "Promo banner above hero",
  promo_after_hero: "Promo banner below hero",
  promo_inside_hero: "Promo strip inside hero",
  promo_as_hero_background: "Promo as hero background",
  product: "Product image",
  logo: "Store logo",
  favicon: "Favicon",
  og_image: "Social share image",
  page: "Page image",
  generic: "Image",
};

export const MEDIA_USAGE_HINTS: Record<MediaUsage, string> = {
  hero: "Upload 1600 x 1600 or larger. The theme decides the display shape.",
  hero_background: "Upload 1600 x 1200 or larger. Fills the hero. Text sits on a scrim.",
  promo_before_hero:
    "Upload 1600 x 400 or wider. A cut-out product or person on a plain background looks best. Photos of a whole shop look cluttered in this band.",
  promo_after_hero:
    "Upload 1600 x 400 or wider. A cut-out product or person on a plain background looks best. Photos of a whole shop look cluttered in this band.",
  promo_inside_hero: "Upload 2000 x 200 or wider. Thin strip inside the hero.",
  promo_as_hero_background:
    "Upload 1600 x 1200 or larger. A strong single image with space for text works best.",
  product: "Upload 800 x 1000 or larger. Portrait works best.",
  logo: "Upload 512 x 512. Square. Transparent background works.",
  favicon: "Upload 512 x 512. Square. Small file, under 100 KB.",
  og_image: "Upload 1200 x 630. Landscape. Used for link previews on social media.",
  page: "Upload 1200 x 800 or larger.",
  generic: "Upload the largest version you have. It will be resized automatically.",
};

export interface PlacementAspect {
  mobile: string;
  tablet: string;
  desktop: string;
  maxHeightPx?: number;
}

// Locked responsive sizing contract. Renderers read this so a banner
// renders at the same dimensions everywhere.
export const PLACEMENT_ASPECTS: Record<MediaUsage, PlacementAspect | null> = {
  hero: null,
  hero_background: null,
  promo_before_hero: {
    mobile: "16/9",
    tablet: "3/1",
    desktop: "4/1",
    maxHeightPx: 320,
  },
  promo_after_hero: {
    mobile: "16/9",
    tablet: "3/1",
    desktop: "4/1",
    maxHeightPx: 320,
  },
  promo_inside_hero: {
    mobile: "6/1",
    tablet: "8/1",
    desktop: "10/1",
    maxHeightPx: 120,
  },
  promo_as_hero_background: null,
  product: {
    mobile: "4/5",
    tablet: "4/5",
    desktop: "4/5",
  },
  logo: {
    mobile: "1/1",
    tablet: "1/1",
    desktop: "1/1",
  },
  favicon: {
    mobile: "1/1",
    tablet: "1/1",
    desktop: "1/1",
  },
  og_image: {
    mobile: "1200/630",
    tablet: "1200/630",
    desktop: "1200/630",
  },
  page: {
    mobile: "3/2",
    tablet: "3/2",
    desktop: "3/2",
  },
  generic: null,
};