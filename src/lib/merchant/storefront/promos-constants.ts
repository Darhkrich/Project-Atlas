import type {
  HeroStyle,
  PromoPlacement,
  PromoTransition,
} from "@/types/merchant-storefront";

export const PROMO_PLACEMENT_LABELS: Record<PromoPlacement, string> = {
  before_hero: "Above the hero",
  after_hero: "Below the hero",
  as_hero_background: "As the hero background",
};

export const PROMO_PLACEMENT_DESCRIPTIONS: Record<PromoPlacement, string> = {
  before_hero:
    "A wide banner above the hero. Good for sales and campaigns.",
  after_hero:
    "A wide banner below the hero. Good for collections and offers.",
  as_hero_background:
    "Banners become the hero itself with your headline over the top. Good for short-lived campaigns.",
};

export const PROMO_PLACEMENT_SIZES: Record<PromoPlacement, string> = {
  before_hero: "Renders wide and short. Upload 1600 x 400 or wider.",
  after_hero: "Renders wide and short. Upload 1600 x 400 or wider.",
  as_hero_background:
    "Fills the hero. Upload 1600 x 1200 or larger. Text sits on a scrim.",
};

export const PROMO_TRANSITION_LABELS: Record<PromoTransition, string> = {
  auto: "Automatic",
  manual: "Manual only",
  both: "Automatic with controls",
};

export const PROMO_TRANSITION_DESCRIPTIONS: Record<PromoTransition, string> = {
  auto:
    "Banners rotate on their own. No dots or arrows shown to customers.",
  manual:
    "Customers swipe or tap arrows to move between banners.",
  both:
    "Banners rotate on their own and customers can also swipe or tap.",
};

export const PROMO_INTERVAL_OPTIONS: { value: number; label: string }[] = [
  { value: 3000, label: "3 seconds" },
  { value: 5000, label: "5 seconds" },
  { value: 8000, label: "8 seconds" },
  { value: 12000, label: "12 seconds" },
];

export const HERO_STYLE_LABELS: Record<HeroStyle, string> = {
  theme_default: "Theme default",
  image_background: "Image as background",
  image_side: "Image on the side",
  image_half: "Image at half width",
  text_only: "Text only",
};

export const HERO_STYLE_DESCRIPTIONS: Record<HeroStyle, string> = {
  theme_default:
    "Uses whatever your theme does. Safe default. Change this if you want a different hero shape.",
  image_background:
    "Full-bleed image with the headline on a darkened overlay. Best for one strong image.",
  image_side:
    "Image sits beside the headline. Balanced and editorial.",
  image_half:
    "Image takes exactly half the hero. Text on the other half.",
  text_only:
    "No image. Just the headline on a solid surface. Best when you have no hero image.",
};

export const PROMO_BANNER_HEADLINE_MAX = 80;
export const PROMO_BANNER_SUBHEAD_MAX = 140;
export const PROMO_BANNER_BADGE_MAX = 30;
export const PROMO_BANNER_LINK_LABEL_MAX = 30;
export const PROMO_BANNER_LINK_URL_MAX = 300;
export const MAX_PROMO_BANNERS = 8;