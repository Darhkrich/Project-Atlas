import {
  defaultMerchantStorefront,
  DEFAULT_BUSINESS_HOURS,
  MERCHANT_STOREFRONT_CONFIG_VERSION,
  type AnalyticsProviders,
  type BusinessHours,
  type HeroStyle,
  type MenuItem,
  type MerchantStorefrontConfig,
  type MerchantStorefrontTheme,
  type PromoBanner,
  type PromoBannerAlignment,
  type PromoPlacement,
  type PromoTransition,
  type StorefrontCornerRadius,
  type StorefrontFont,
  type StorefrontGridDensity,
  type TrustItem,
  type WwwRedirect,
} from "@/types/merchant-storefront";

const VALID_FONTS: StorefrontFont[] = ["atlas", "serif", "rounded", "mono"];

const VALID_RADII: StorefrontCornerRadius[] = ["sharp", "soft", "round"];

const VALID_GRID_DENSITIES: StorefrontGridDensity[] = [2, 3, 4];

const VALID_WWW_REDIRECTS: WwwRedirect[] = [
  "none",
  "www_to_apex",
  "apex_to_www",
];

const VALID_THEMES: MerchantStorefrontTheme[] = [
  "airy",
  "editorial",
  "studio",
  "statement",
];

const VALID_TRUST_ICONS: string[] = [
  "shield",
  "package",
  "headphones",
  "lock",
  "check-circle",
  "star",
];

const VALID_PROMO_PLACEMENTS: PromoPlacement[] = [
  "before_hero",
  "after_hero",
  "as_hero_background",
];

const VALID_PROMO_TRANSITIONS: PromoTransition[] = [
  "auto",
  "manual",
  "both",
];

const VALID_HERO_STYLES: HeroStyle[] = [
  "theme_default",
  "image_background",
  "image_side",
  "image_half",
  "text_only",
];

const VALID_BANNER_ALIGNMENTS: PromoBannerAlignment[] = [
  "left",
  "center",
  "right",
];

const LEGACY_THEME_MAP: Record<string, MerchantStorefrontTheme> = {
  modern: "airy",
  classic: "editorial",
  minimal: "studio",
  bold: "statement",
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value !== "number") return undefined;
  if (!Number.isFinite(value)) return undefined;
  return value;
}

function normalizeTheme(value: unknown): MerchantStorefrontTheme {
  if (typeof value === "string") {
    const direct = VALID_THEMES.find((t) => t === value);
    if (direct) return direct;
    const legacy = LEGACY_THEME_MAP[value];
    if (legacy) return legacy;
  }
  return defaultMerchantStorefront.theme;
}

function normalizeFont(value: unknown): StorefrontFont {
  if (typeof value === "string") {
    const found = VALID_FONTS.find((f) => f === value);
    if (found) return found;
  }
  return defaultMerchantStorefront.font ?? "atlas";
}

function normalizeRadius(value: unknown): StorefrontCornerRadius {
  if (typeof value === "string") {
    const found = VALID_RADII.find((r) => r === value);
    if (found) return found;
  }
  return defaultMerchantStorefront.cornerRadius ?? "soft";
}

function normalizeGridDensity(value: unknown): StorefrontGridDensity {
  if (typeof value === "number") {
    const found = VALID_GRID_DENSITIES.find((d) => d === value);
    if (found) return found;
  }
  return defaultMerchantStorefront.gridDensity ?? 3;
}

function normalizeWwwRedirect(value: unknown): WwwRedirect {
  if (typeof value === "string") {
    const found = VALID_WWW_REDIRECTS.find((r) => r === value);
    if (found) return found;
  }
  return "none";
}

function normalizeBusinessHours(value: unknown): BusinessHours {
  if (!Array.isArray(value)) return DEFAULT_BUSINESS_HOURS;
  if (value.length === 0) return DEFAULT_BUSINESS_HOURS;
  const result: BusinessHours = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const day = e.day;
    if (typeof day !== "string") continue;
    if (!DEFAULT_BUSINESS_HOURS.some((d) => d.day === day)) continue;
    result.push({
      day: day as BusinessHours[number]["day"],
      closed: typeof e.closed === "boolean" ? e.closed : false,
      open: typeof e.open === "string" ? e.open : "09:00",
      close: typeof e.close === "string" ? e.close : "18:00",
    });
  }
  if (result.length === 0) return DEFAULT_BUSINESS_HOURS;
  return result;
}

function normalizeAnalyticsProviders(
  value: unknown
): AnalyticsProviders | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const result: AnalyticsProviders = {};
  if (typeof v.ga === "string" && v.ga.length > 0) result.ga = v.ga;
  if (typeof v.metaPixel === "string" && v.metaPixel.length > 0) {
    result.metaPixel = v.metaPixel;
  }
  if (typeof v.tiktokPixel === "string" && v.tiktokPixel.length > 0) {
    result.tiktokPixel = v.tiktokPixel;
  }
  if (!result.ga && !result.metaPixel && !result.tiktokPixel) {
    return undefined;
  }
  return result;
}

function normalizeMenuItems(value: unknown): MenuItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  if (value.length === 0) return undefined;
  const result: MenuItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const label = typeof e.label === "string" ? e.label : "";
    const href = typeof e.href === "string" ? e.href : "";
    if (label.length === 0 || href.length === 0) continue;
    const order =
      typeof e.order === "number" && Number.isFinite(e.order) ? e.order : 0;
    const visible = typeof e.visible === "boolean" ? e.visible : true;
    result.push({ label, href, order, visible });
  }
  if (result.length === 0) return undefined;
  return result;
}

function normalizeSectionOrder(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  if (result.length === 0) return undefined;
  return result;
}

function normalizeTrustItems(value: unknown): TrustItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: TrustItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const icon = typeof e.icon === "string" ? e.icon : "";
    const label = typeof e.label === "string" ? e.label : "";
    if (label.length === 0) continue;
    if (!VALID_TRUST_ICONS.includes(icon)) continue;
    result.push({ icon, label });
    if (result.length >= 6) break;
  }
  if (result.length === 0) return undefined;
  return result;
}

function normalizeBannerAlignment(value: unknown): PromoBannerAlignment {
  if (typeof value === "string") {
    const found = VALID_BANNER_ALIGNMENTS.find((a) => a === value);
    if (found) return found;
  }
  return "left";
}

function normalizePromoBanners(value: unknown): PromoBanner[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: PromoBanner[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const id = typeof e.id === "string" ? e.id : crypto.randomUUID();
    const headline = typeof e.headline === "string" ? e.headline : "";
    const imageUrl = asOptionalString(e.imageUrl);
    const subhead = asOptionalString(e.subhead);
    const badge = asOptionalString(e.badge);
    const linkUrl = asOptionalString(e.linkUrl);
    const linkLabel = asOptionalString(e.linkLabel);
    const backgroundColor = asOptionalString(e.backgroundColor);

    if (headline.length === 0 && !imageUrl) continue;

    const order =
      typeof e.order === "number" && Number.isFinite(e.order) ? e.order : 0;
    const enabled = typeof e.enabled === "boolean" ? e.enabled : true;

    result.push({
      id,
      imageUrl,
      headline,
      subhead,
      badge,
      linkUrl,
      linkLabel,
      alignment: normalizeBannerAlignment(e.alignment),
      backgroundColor,
      enabled,
      order,
    });
  }
  if (result.length === 0) return undefined;
  return result.sort((a, b) => a.order - b.order);
}

// "inside_hero" was the placement name in configVersion 5. It has been
// replaced by "after_hero". Configs saved before this change migrate here.
function normalizePromoPlacement(value: unknown): PromoPlacement {
  if (typeof value === "string") {
    if (value === "inside_hero") return "after_hero";
    const found = VALID_PROMO_PLACEMENTS.find((p) => p === value);
    if (found) return found;
  }
  return "after_hero";
}

function normalizePromoTransition(value: unknown): PromoTransition {
  if (typeof value === "string") {
    const found = VALID_PROMO_TRANSITIONS.find((t) => t === value);
    if (found) return found;
  }
  return "auto";
}

function normalizeHeroStyle(value: unknown): HeroStyle {
  if (typeof value === "string") {
    const found = VALID_HERO_STYLES.find((h) => h === value);
    if (found) return found;
  }
  return "theme_default";
}

function normalizePromoInterval(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 2000) {
    return Math.min(value, 60000);
  }
  return 5000;
}

function migrateLegacyPromo(
  banners: PromoBanner[] | undefined,
  legacy: {
    showPromoInHero: unknown;
    promoText: unknown;
    promoLink: unknown;
    promoLinkLabel: unknown;
  }
): PromoBanner[] | undefined {
  if (banners && banners.length > 0) return banners;
  const show = legacy.showPromoInHero === true;
  const text =
    typeof legacy.promoText === "string" ? legacy.promoText.trim() : "";
  if (!show || text.length === 0) return banners;

  const link =
    typeof legacy.promoLink === "string" ? legacy.promoLink.trim() : "";
  const label =
    typeof legacy.promoLinkLabel === "string" &&
    legacy.promoLinkLabel.trim().length > 0
      ? legacy.promoLinkLabel.trim()
      : "Shop now";

  const migrated: PromoBanner = {
    id: crypto.randomUUID(),
    headline: text,
    alignment: "left",
    enabled: true,
    order: 0,
    ...(link.length > 0 ? { linkUrl: link, linkLabel: label } : {}),
  };
  return [migrated];
}

export function normalizeMerchantStorefront(
  input: Partial<MerchantStorefrontConfig> | null | undefined
): MerchantStorefrontConfig {
  const base = defaultMerchantStorefront;
  const src = (input ?? {}) as Partial<MerchantStorefrontConfig>;

  const social = {
    facebook: asString(src.socialLinks?.facebook, base.socialLinks.facebook),
    instagram: asString(
      src.socialLinks?.instagram,
      base.socialLinks.instagram
    ),
    tiktok: asString(src.socialLinks?.tiktok, base.socialLinks.tiktok),
    twitter: asString(src.socialLinks?.twitter, base.socialLinks.twitter),
  };

  const status: MerchantStorefrontConfig["status"] =
    src.status === "live" ? "live" : "draft";

  const promoBanners = migrateLegacyPromo(
    normalizePromoBanners(src.promoBanners),
    {
      showPromoInHero: src.showPromoInHero,
      promoText: src.promoText,
      promoLink: src.promoLink,
      promoLinkLabel: src.promoLinkLabel,
    }
  );

  return {
    storefrontId: asString(src.storefrontId, base.storefrontId),
    storeName: asString(src.storeName, base.storeName),
    slug: asString(src.slug, base.slug),
    logo: asOptionalString(src.logo),
    primaryColor: asString(src.primaryColor, base.primaryColor),
    accentColor: asString(src.accentColor, base.accentColor),
    tagline: asString(src.tagline, base.tagline),
    description: asString(src.description, base.description),
    heroTitle: asString(src.heroTitle, base.heroTitle),
    heroDescription: asString(src.heroDescription, base.heroDescription),
    heroImage: asOptionalString(src.heroImage),
    theme: normalizeTheme(src.theme),
    templateId: asString(src.templateId, base.templateId),
    templateCategory: src.templateCategory ?? base.templateCategory,
    announcement: asString(src.announcement, base.announcement),
    contactEmail: asString(src.contactEmail, base.contactEmail),
    contactPhone: asString(src.contactPhone, base.contactPhone),
    whatsapp: asString(src.whatsapp, base.whatsapp),
    address: asString(src.address, base.address),
    socialLinks: social,
    showAnnouncement: asBoolean(
      src.showAnnouncement,
      base.showAnnouncement
    ),
    showTrustSection: asBoolean(
      src.showTrustSection,
      base.showTrustSection
    ),
    showFeaturedProducts: asBoolean(
      src.showFeaturedProducts,
      base.showFeaturedProducts
    ),
    status,
    paymentMethodIds: Array.isArray(src.paymentMethodIds)
      ? src.paymentMethodIds.filter(
          (id): id is string => typeof id === "string"
        )
      : base.paymentMethodIds,
    codEnabled: asBoolean(src.codEnabled, base.codEnabled ?? false),
    planId: asOptionalString(src.planId),

    configVersion: MERCHANT_STOREFRONT_CONFIG_VERSION,
    favicon: asOptionalString(src.favicon),
    font: normalizeFont(src.font),
    cornerRadius: normalizeRadius(src.cornerRadius),
    gridDensity: normalizeGridDensity(src.gridDensity),
    darkStorefront: asBoolean(
      src.darkStorefront,
      base.darkStorefront ?? false
    ),
    seoTitle: asString(src.seoTitle, base.seoTitle ?? ""),
    seoDescription: asString(
      src.seoDescription,
      base.seoDescription ?? ""
    ),
    ogImage: asOptionalString(src.ogImage),
    businessHours: normalizeBusinessHours(src.businessHours),
    pickupEnabled: asBoolean(
      src.pickupEnabled,
      base.pickupEnabled ?? false
    ),
    codMaxOrderValue: asOptionalNumber(src.codMaxOrderValue),
    codFee: asOptionalNumber(src.codFee),
    returnsPolicy: asString(src.returnsPolicy, base.returnsPolicy ?? ""),
    privacyPolicy: asString(src.privacyPolicy, base.privacyPolicy ?? ""),
    termsPolicy: asString(src.termsPolicy, base.termsPolicy ?? ""),
    wwwRedirect: normalizeWwwRedirect(src.wwwRedirect),

    promoBanners,
    promoPlacement: normalizePromoPlacement(src.promoPlacement),
    promoTransition: normalizePromoTransition(src.promoTransition),
    promoAutoIntervalMs: normalizePromoInterval(src.promoAutoIntervalMs),
    promoLoop: asBoolean(src.promoLoop, base.promoLoop ?? true),

    heroStyle: normalizeHeroStyle(src.heroStyle),

    showCategoryStrip: asBoolean(
      src.showCategoryStrip,
      base.showCategoryStrip ?? true
    ),
    showAbout: asBoolean(src.showAbout, base.showAbout ?? true),
    heroImageInAbout: asBoolean(
      src.heroImageInAbout,
      base.heroImageInAbout ?? false
    ),
    taxPercent: asOptionalNumber(src.taxPercent),
    taxIncluded: asBoolean(src.taxIncluded, base.taxIncluded ?? false),
    taxAppliesToShipping: asBoolean(
      src.taxAppliesToShipping,
      base.taxAppliesToShipping ?? false
    ),
    analyticsProviders: normalizeAnalyticsProviders(src.analyticsProviders),
    menuItems: normalizeMenuItems(src.menuItems),
    sectionOrder: normalizeSectionOrder(src.sectionOrder),
    trustItems: normalizeTrustItems(src.trustItems),
    showLookbook: asBoolean(src.showLookbook, base.showLookbook ?? true),

    showPromoInHero: undefined,
    promoText: undefined,
    promoLink: undefined,
    promoLinkLabel: undefined,

    customDomain: src.customDomain,
    customDomainStatus: src.customDomainStatus,
    subdomain: src.subdomain,
    atlasDomain: src.atlasDomain,
  };
}