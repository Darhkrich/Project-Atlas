/* eslint-disable @typescript-eslint/no-explicit-any */
export type TemplateCategory =
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

  
export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnailUrl: string;
  componentName: string;
  defaultSettings: Record<string, any>;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  code: string;
  priceMonthly: string;
  priceAnnual: string;
  features: string[];
};

export type MerchantOnboardingData = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessDescription: string;
  businessCategory: TemplateCategory;
  templateId: string;
  customization: {
    logoUrl: string;
    brandColor: string;
    accentColor: string;
    heroHeadline: string;
    heroDescription: string;
    aboutText: string;
    contactEmail: string;
    contactPhone: string;
    whatsappNumber: string;
    address: string;
    socialLinks: {
      facebook: string;
      instagram: string;
      tiktok: string;
    };
    announcement: string;
  };
  planId: string;
  billingCycle: "monthly" | "annual";
};