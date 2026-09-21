export type StorefrontTemplateId = "template1" | "template2" | "template3";
export type StorefrontThemeId = "classic" | "minimal" | "modern";
export type StorefrontMode = "preview" | "public";
export type BorderRadius = "none" | "sm" | "md" | "lg";
export type CardStyle = "flat" | "bordered" | "shadowed";

export type HeroTemplateId = "classic" | "split" | "centered" | "commerce" | "promotional";

export interface HeroAction {
  label: string;
  type: "services" | "data" | "airtime" | "bills" | "contact" | "custom";
  serviceId?: string;
  href?: string;
}

export interface StoreBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
}

export interface StoreAppearance {
  templateId: StorefrontTemplateId;
  themeId: StorefrontThemeId;
  borderRadius: BorderRadius;
  cardStyle: CardStyle;
}

export interface StoreHero {
  enabled: boolean;
  template: HeroTemplateId;
  title: string;
  subtitle: string;
  image?: string;
  backgroundImage?: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  alignment: "left" | "center" | "right";
  showServices: boolean;
  featuredServices?: string[];
  promoBadge?: string;
  promoEnds?: string;
  buttonText?: string;
  buttonAction?: string;
}

export interface StoreServicesConfig {
  enabled: boolean;
  featured: string[];
}

export interface StorePricing {
  markupPercent: number;
  maxMarkupPercent: number;
  serviceOverrides?: Record<string, number>;
}

export interface StoreContact {
  phone: string;
  whatsapp: string;
  email: string;
}

export interface StoreSocial {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface StoreFooter {
  enabled: boolean;
  description: string;
  copyright: string;
}

export interface StorePublication {
  isPublished: boolean;
  publishedAt?: string;
}

export interface StorefrontConfig {
  ownerId: string;
  id: string;
  /** Cross-references the storefront record in the admin catalog. */
  storefrontId: string;
  store: {
    name: string;
    slug: string;
    /** @deprecated Domains moved to lib/domains/store.ts. Do not read. */
    subdomain?: string;
    description: string;
    logo?: string;
  };
  branding: StoreBranding;
  appearance: StoreAppearance;
  hero: StoreHero;
  services: StoreServicesConfig;
  pricing: StorePricing;
  contact: StoreContact;
  social: StoreSocial;
  footer: StoreFooter;
  publication: StorePublication;
}