import { servicesCategories } from "@/lib/services-page-data";
import type { StorefrontConfig, StorefrontThemeId } from "./types";
import type { CSSProperties } from "react";

export const networkMeta: Record<string, { color: string; headerText: string; initials: string; logo?: string }> = {
  MTN: { color: "bg-yellow-400", headerText: "text-neutral-900", initials: "MTN", logo: "/mtn1.png" },
  Telecel: { color: "bg-red-600", headerText: "text-white", initials: "V", logo: "/telecel1.jpg" },
  AirtelTigo: { color: "bg-blue-600", headerText: "text-white", initials: "A", logo: "/airteltigo.png" },
};

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function validateStorefrontConfig(config: StorefrontConfig): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!config.store.name.trim()) errors.storeName = "Store name is required.";
  if (!config.store.slug.trim()) errors.slug = "Store slug is required.";
  else if (!/^[a-z0-9-]+$/.test(config.store.slug)) errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
  if (config.services.enabled && config.services.featured.length === 0) errors.services = "Enable at least one service.";
  if (!config.contact.phone.trim() && !config.contact.whatsapp.trim()) errors.contact = "Provide a phone or WhatsApp number.";
  if (config.pricing.markupPercent > config.pricing.maxMarkupPercent) errors.markup = `Markup cannot exceed ${config.pricing.maxMarkupPercent}%`;
  if (config.pricing.markupPercent < 0) errors.markup = "Markup cannot be negative.";
  return errors;
}

export function resolveFeaturedServices(config: StorefrontConfig) {
  if (!config.services.enabled) return [];
  return config.services.featured
    .map((id) => servicesCategories.find((cat) => cat.id === id && cat.available))
    .filter(Boolean) as typeof servicesCategories;
}

export function getStorefrontUrl(slug: string): string {
  return `/customer-store/${slug}`;
}

export function getBrandingStyle(config: StorefrontConfig): CSSProperties {
  return {
    "--primary": config.branding.primaryColor,
    "--secondary": config.branding.secondaryColor,
    "--accent": config.branding.accentColor,
    "--text": config.branding.textColor,
  } as CSSProperties;
}

export function getThemeClasses(theme: StorefrontThemeId) {
  switch (theme) {
    case "classic":
      return {
        container: "max-w-6xl",
        headingFont: "font-serif",
        bodyFont: "font-sans",
        buttonRadius: "rounded-sm",
        cardStyle: "border border-neutral-200 shadow-sm",
        heroBg: "bg-gradient-to-b from-neutral-100 to-white",
        heroTitleSize: "text-4xl md:text-5xl",
        heroSubtitleSize: "text-lg",
        sectionBg: "bg-white",
        quickBuyBg: "bg-neutral-50",
        cardHover: "hover:shadow-md hover:border-neutral-300",
        trustBg: "bg-neutral-100",
      };
    case "minimal":
      return {
        container: "max-w-5xl",
        headingFont: "font-sans font-light",
        bodyFont: "font-sans",
        buttonRadius: "rounded-none",
        cardStyle: "border-b border-neutral-200 shadow-none",
        heroBg: "bg-white",
        heroTitleSize: "text-4xl md:text-5xl",
        heroSubtitleSize: "text-lg",
        sectionBg: "bg-white",
        quickBuyBg: "bg-white",
        cardHover: "hover:bg-neutral-50",
        trustBg: "bg-neutral-50",
      };
    case "modern":
    default:
      return {
        container: "max-w-7xl",
        headingFont: "font-sans font-bold",
        bodyFont: "font-sans",
        buttonRadius: "rounded-xl",
        cardStyle: "shadow-lg shadow-neutral-200/50 border border-neutral-100",
        heroBg: "bg-gradient-to-br from-neutral-50 to-neutral-100",
        heroTitleSize: "text-5xl md:text-6xl",
        heroSubtitleSize: "text-xl",
        sectionBg: "bg-neutral-50",
        quickBuyBg: "bg-white",
        cardHover: "hover:shadow-xl hover:-translate-y-0.5",
        trustBg: "bg-white",
      };
  }
}

export function getMarkupPercent(config: StorefrontConfig, serviceId?: string): number {
  const pricing = config.pricing ?? { markupPercent: 0, maxMarkupPercent: 30 };
  if (serviceId && pricing.serviceOverrides?.[serviceId] !== undefined) {
    return pricing.serviceOverrides[serviceId];
  }
  return pricing.markupPercent;
}

export function getSellingPrice(basePrice: number, config: StorefrontConfig, serviceId?: string): number {
  const markup = getMarkupPercent(config, serviceId);
  return basePrice * (1 + markup / 100);
}

export function getStoreInitials(storeName?: string): string {
  const name = storeName?.trim() || "My Store";
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "MS";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}