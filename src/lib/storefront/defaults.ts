import type { StorefrontConfig } from "./types";

export const defaultStorefrontConfig: StorefrontConfig = {
  id: "reseller-default",
  storefrontId: "SF-RS-001",
  store: {
    name: "My Storefront",
    slug: "my-storefront",
    subdomain: "",
    description: "Fast and reliable digital services.",
    logo: "",
  },
  branding: {
    primaryColor: "#064E3B",
    secondaryColor: "#0F766E",
    accentColor: "#D97706",
    textColor: "#111827",
  },
  appearance: {
    templateId: "template1",
    themeId: "modern",
    borderRadius: "md",
    cardStyle: "shadowed",
  },
  hero: {
    enabled: true,
    template: "classic",
    title: "Welcome to My Storefront",
    subtitle: "Affordable data, airtime, and digital services delivered instantly.",
    primaryAction: {
      label: "Buy Now",
      type: "services",
    },
    secondaryAction: {
      label: "Explore Services",
      type: "services",
    },
    alignment: "left",
    showServices: true,
    featuredServices: ["data", "airtime", "electricity"],
    image: "",
    backgroundImage: "",
  },
  services: {
    enabled: true,
    featured: ["airtime", "data", "electricity", "cabletv", "exampins"],
  },
  pricing: {
    markupPercent: 10,
    maxMarkupPercent: 30,
    serviceOverrides: {},
  },
  contact: {
    phone: "0550000000",
    whatsapp: "0550000000",
    email: "support@example.com",
  },
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },
  footer: {
    enabled: true,
    description: "Your trusted partner for digital services.",
    copyright: `©️ ${new Date().getFullYear()} My Storefront`,
  },
  publication: {
    isPublished: false,
  },
};

export const mockStorefronts: Record<string, StorefrontConfig> = {
  "techvault-connect": {
    ...defaultStorefrontConfig,
    id: "reseller-techvault",
    storefrontId: "SF-RS-002",
    store: {
      name: "TechVault Connect",
      slug: "techvault-connect",
      subdomain: "techvault",
      description: "Smart connections for a smarter you.",
      logo: "",
    },
    branding: {
      primaryColor: "#0B1120",
      secondaryColor: "#1E293B",
      accentColor: "#3B82F6",
      textColor: "#F8FAFC",
    },
    hero: {
      ...defaultStorefrontConfig.hero,
      template: "split",
      title: "Smart connections for a smarter you.",
      subtitle: "Gone are the hassles. Endless possibilities.",
      primaryAction: { label: "Top Up", type: "services" },
    },
    pricing: {
      markupPercent: 15,
      maxMarkupPercent: 30,
    },
    publication: {
      isPublished: true,
      publishedAt: "2026-08-20T12:00:00Z",
    },
  },
};

export function getMockStorefrontBySlug(slug: string): StorefrontConfig | undefined {
  return mockStorefronts[slug];
}