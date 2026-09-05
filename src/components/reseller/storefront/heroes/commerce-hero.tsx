/* eslint-disable @typescript-eslint/no-unused-vars */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses, getStoreInitials } from "@/lib/storefront/utils";
import { servicesCategories } from "@/lib/services-page-data";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface CommerceHeroProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function CommerceHero({ config, mode }: CommerceHeroProps) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);
  const storeName = config.store.name?.trim() || "My Store";
  const initials = getStoreInitials(config.store.name);
  const headline = config.hero.title || "Get connected without the hassle";
  const description = config.hero.subtitle || "Affordable data, airtime and digital services.";
  const primaryAction = config.hero.primaryAction || { label: "Shop Now", type: "services" };
  const featuredServices = (config.hero.showServices && config.hero.featuredServices) || [];
  const resolvedFeatured = featuredServices
    .map((id) => servicesCategories.find((cat) => cat.id === id && cat.available))
    .filter(Boolean) as typeof servicesCategories;

  return (
    <section className={`relative overflow-hidden ${theme.heroBg} py-16 md:py-20`}>
      <div className={`${theme.container} mx-auto px-4`} style={brandingStyle}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-4 inline-block px-4 py-1 rounded-full bg-white/90 border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-sm">
              SPECIAL OFFER
            </div>
            <h1 className={`${theme.headingFont} text-4xl md:text-5xl font-extrabold text-neutral-900`}>{headline}</h1>
            <p className="mt-4 text-lg text-neutral-600">{description}</p>
            <a
              href={primaryAction.href || "#services"}
              className={`mt-8 inline-flex items-center justify-center px-8 py-3 ${theme.buttonRadius} text-white font-medium shadow-md`}
              style={{ backgroundColor: "var(--primary)" }}
            >
              {primaryAction.label}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {resolvedFeatured.map((service) => (
              <a
                key={service.id}
                href="#services"
                className="bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-md transition text-left"
              >
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white mb-3" style={{ backgroundColor: "var(--primary)" }}>
                  <AtlasIcon name={service.icon as AtlasIconName} className="h-5 w-5" />
                </div>
                <p className="font-semibold text-neutral-900">{service.name}</p>
                <p className="text-sm text-neutral-500 mt-1">{service.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}