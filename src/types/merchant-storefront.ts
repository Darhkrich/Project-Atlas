export type MerchantStorefrontTheme =
  | "airy"
  | "editorial"
  | "studio"
  | "statement";

export type MerchantTemplateCategory =
  | "cosmetics"
  | "clothing"
  | "garden"
  | "accessories"
  | "electronics"
  | "home"
  | "food"
  | "sports"
  | "health"
  | "general";

export type StorefrontFont = "atlas" | "serif" | "rounded" | "mono";

export type StorefrontCornerRadius = "sharp" | "soft" | "round";

export type StorefrontGridDensity = 2 | 3 | 4;

export type WwwRedirect = "none" | "www_to_apex" | "apex_to_www";

export type DayOfWeek =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export interface BusinessHoursDay {
  day: DayOfWeek;
  closed: boolean;
  open: string;
  close: string;
}

export type BusinessHours = BusinessHoursDay[];

export interface ProductVariantGroup {
  id: string;
  name: string;
  options: string[];
}

export interface ProductVariant {
  id: string;
  options: Record<string, string>;
  name?: string;
  priceOverride?: number;
  stockLevel: number;
  sku?: string;
}

export interface MerchantStorefrontProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  categoryId: string;
  inStock: boolean;
  featured: boolean;
  status?: "Active" | "Draft" | "Archived";
  sku?: string;
  stockLevel?: number;
  variantGroups?: ProductVariantGroup[];
  variants?: ProductVariant[];
}

export type DiscountType = "percent" | "fixed";

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: number;
  enabled: boolean;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  showInFooter: boolean;
  order: number;
}

export interface MenuItem {
  label: string;
  href: string;
  order: number;
  visible: boolean;
}

export interface AnalyticsProviders {
  ga?: string;
  metaPixel?: string;
  tiktokPixel?: string;
}

export interface TrustItem {
  icon: string;
  label: string;
}

export type PromoBannerAlignment = "left" | "center" | "right";

export interface PromoBanner {
  id: string;
  imageUrl?: string;
  headline: string;
  subhead?: string;
  badge?: string;
  linkUrl?: string;
  linkLabel?: string;
  alignment: PromoBannerAlignment;
  backgroundColor?: string;
  enabled: boolean;
  order: number;
}

export type PromoPlacement =
  | "before_hero"
  | "after_hero"
  | "as_hero_background";

export type PromoTransition = "auto" | "manual" | "both";

export type HeroStyle =
  | "theme_default"
  | "image_background"
  | "image_side"
  | "image_half"
  | "text_only";

export interface MerchantStorefrontConfig {
  storefrontId: string;
  storeName: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  heroImage?: string;
  theme: MerchantStorefrontTheme;
  templateId: string;
  templateCategory: MerchantTemplateCategory;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    tiktok: string;
    twitter: string;
  };
  showAnnouncement: boolean;
  showTrustSection: boolean;
  showFeaturedProducts: boolean;
  status: "draft" | "live";
  paymentMethodIds: string[];
  codEnabled?: boolean;
  planId?: string;

  configVersion?: number;

  favicon?: string;
  font?: StorefrontFont;
  cornerRadius?: StorefrontCornerRadius;
  gridDensity?: StorefrontGridDensity;
  darkStorefront?: boolean;

  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;

  businessHours?: BusinessHours;
  pickupEnabled?: boolean;
  codMaxOrderValue?: number;
  codFee?: number;

  returnsPolicy?: string;
  privacyPolicy?: string;
  termsPolicy?: string;

  wwwRedirect?: WwwRedirect;

  promoBanners?: PromoBanner[];
  promoPlacement?: PromoPlacement;
  promoTransition?: PromoTransition;
  promoAutoIntervalMs?: number;
  promoLoop?: boolean;

  heroStyle?: HeroStyle;

  showCategoryStrip?: boolean;
  showAbout?: boolean;
  heroImageInAbout?: boolean;

  taxPercent?: number;
  taxIncluded?: boolean;
  taxAppliesToShipping?: boolean;

  analyticsProviders?: AnalyticsProviders;

  menuItems?: MenuItem[];
  sectionOrder?: string[];

  trustItems?: TrustItem[];
  showLookbook?: boolean;

  /** @deprecated Replaced by promoBanners. Migrated on first read. */
  showPromoInHero?: boolean;
  /** @deprecated Replaced by promoBanners. Migrated on first read. */
  promoText?: string;
  /** @deprecated Replaced by promoBanners. Migrated on first read. */
  promoLink?: string;
  /** @deprecated Replaced by promoBanners. Migrated on first read. */
  promoLinkLabel?: string;

  /** @deprecated Domains moved to lib/domains/store.ts. Do not read. */
  customDomain?: string;
  /** @deprecated Domains moved to lib/domains/store.ts. Do not read. */
  customDomainStatus?: "pending" | "verified" | "failed";
  /** @deprecated Domains moved to lib/domains/store.ts. Do not read. */
  subdomain?: string;
  /** @deprecated Domains moved to lib/domains/store.ts. Do not read. */
  atlasDomain?: string;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = [
  { day: "mon", closed: false, open: "09:00", close: "18:00" },
  { day: "tue", closed: false, open: "09:00", close: "18:00" },
  { day: "wed", closed: false, open: "09:00", close: "18:00" },
  { day: "thu", closed: false, open: "09:00", close: "18:00" },
  { day: "fri", closed: false, open: "09:00", close: "18:00" },
  { day: "sat", closed: false, open: "10:00", close: "16:00" },
  { day: "sun", closed: true, open: "10:00", close: "16:00" },
];

export const MERCHANT_STOREFRONT_CONFIG_VERSION = 5;

export const defaultMerchantStorefront: MerchantStorefrontConfig = {
  storefrontId: "SF-MER-001",
  storeName: "My Store",
  slug: "my-store",
  primaryColor: "#14532d",
  accentColor: "#c89c1e",
  tagline: "Quality products, great prices.",
  description: "Welcome to my online store.",
  heroTitle: "Welcome to My Store",
  heroDescription: "Discover amazing products curated just for you.",
  theme: "airy",
  templateId: "tpl-general-store",
  templateCategory: "general",
  announcement: "",
  contactEmail: "contact@example.com",
  contactPhone: "024 123 4567",
  whatsapp: "024 123 4567",
  address: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  },
  showAnnouncement: false,
  showTrustSection: true,
  showFeaturedProducts: true,
  status: "draft",
  paymentMethodIds: ["momo"],
  codEnabled: false,
  planId: "starter",

  configVersion: MERCHANT_STOREFRONT_CONFIG_VERSION,
  favicon: undefined,
  font: "atlas",
  cornerRadius: "soft",
  gridDensity: 3,
  darkStorefront: false,
  seoTitle: "",
  seoDescription: "",
  ogImage: undefined,
  businessHours: DEFAULT_BUSINESS_HOURS,
  pickupEnabled: false,
  codMaxOrderValue: undefined,
  codFee: undefined,
  returnsPolicy: "",
  privacyPolicy: "",
  termsPolicy: "",
  wwwRedirect: "none",

  promoBanners: undefined,
  promoPlacement: "after_hero",
  promoTransition: "auto",
  promoAutoIntervalMs: 5000,
  promoLoop: true,

  heroStyle: "theme_default",

  showCategoryStrip: true,
  showAbout: true,
  heroImageInAbout: false,
  taxPercent: undefined,
  taxIncluded: false,
  taxAppliesToShipping: false,
  analyticsProviders: undefined,
  menuItems: undefined,
  sectionOrder: undefined,
  trustItems: undefined,
  showLookbook: true,
};