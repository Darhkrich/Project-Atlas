export type MerchantStorefrontTheme =
  | "modern"
  | "classic"
  | "minimal"
  | "bold";

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
}

export interface MerchantStorefrontConfig {
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
  customDomain?: string;
  customDomainStatus?: "pending" | "verified" | "failed";
  subdomain?: string;
  atlasDomain?: string;
  codEnabled?: boolean;
  planId?: string; // subscription plan code (starter, growth, pro, enterprise)
}

export const defaultMerchantStorefront: MerchantStorefrontConfig = {
  storeName: "My Store",
  slug: "my-store",
  primaryColor: "#14532d",
  accentColor: "#c89c1e",
  tagline: "Quality products, great prices.",
  description: "Welcome to my online store.",
  heroTitle: "Welcome to My Store",
  heroDescription: "Discover amazing products curated just for you.",
  theme: "modern",
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
  customDomain: "",
  customDomainStatus: "pending",
  subdomain: "",
  atlasDomain: "",
  codEnabled: false,
  planId: "starter",
};