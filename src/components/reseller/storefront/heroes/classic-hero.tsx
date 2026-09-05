/* eslint-disable @next/next/no-img-element */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses, getStoreInitials } from "@/lib/storefront/utils";
import { servicesCategories } from "@/lib/services-page-data";

interface ClassicHeroProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ClassicHero({ config, mode }: ClassicHeroProps) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);
  const storeName = config.store.name?.trim() || "My Store";
  const initials = getStoreInitials(config.store.name);
  const headline = config.hero.title || "Everything you need, delivered instantly.";
  const description = config.hero.subtitle || "Buy data, airtime, and digital services quickly and securely.";
  const primaryAction = config.hero.primaryAction || { label: "Buy Now", type: "services" };
  const secondaryAction = config.hero.secondaryAction;
  const featuredServices = (config.hero.showServices && config.hero.featuredServices) || [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resolvedFeatured = featuredServices
    .map((id) => servicesCategories.find((cat) => cat.id === id && cat.available))
    .filter(Boolean) as typeof servicesCategories;

  return (
    <section className={`relative overflow-hidden ${theme.heroBg} py-16 md:py-20`}>
      <div className={`${theme.container} mx-auto px-4 sm:px-6 lg:px-8`} style={brandingStyle}>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            {config.store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.store.logo} alt={storeName} className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: "var(--primary)" }}>
                {initials}
              </div>
            )}
            <span className="text-lg font-semibold text-neutral-900">{storeName}</span>
          </div>

          <h1 className={`${theme.headingFont} text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900`}>
            {headline}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 leading-relaxed">{description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={primaryAction.href || "#services"}
              className={`inline-flex items-center justify-center px-8 py-3 ${theme.buttonRadius} text-white font-medium shadow-md`}
              style={{ backgroundColor: "var(--primary)" }}
            >
              {primaryAction.label}
            </a>
            {secondaryAction && (
              <a
                href={secondaryAction.href || "#services"}
                className={`inline-flex items-center justify-center px-8 py-3 ${theme.buttonRadius} border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-100 transition`}
              >
                {secondaryAction.label}
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Instant Delivery
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Secure Payments
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}