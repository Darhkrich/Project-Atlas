/* eslint-disable @next/next/no-img-element */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses, getStoreInitials } from "@/lib/storefront/utils";
import { servicesCategories } from "@/lib/services-page-data";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface SplitHeroProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function SplitHero({ config, mode }: SplitHeroProps) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);
  const storeName = config.store.name?.trim() || "My Store";
  const initials = getStoreInitials(config.store.name);
  const headline = config.hero.title || "Everything you need, delivered instantly.";
  const description = config.hero.subtitle || "Buy data, airtime, and digital services quickly and securely.";
  const primaryAction = config.hero.primaryAction || { label: "Buy Now", type: "services" };
  const secondaryAction = config.hero.secondaryAction;
  const heroImage = config.hero.image;
  const featuredServices = (config.hero.showServices && config.hero.featuredServices) || [];
  const resolvedFeatured = featuredServices
    .map((id) => servicesCategories.find((cat) => cat.id === id && cat.available))
    .filter(Boolean) as typeof servicesCategories;

  return (
    <section className={`relative overflow-hidden ${theme.heroBg} py-16 md:py-20`}>
      <div className={`${theme.container} mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center`} style={brandingStyle}>
        <div>
          <div className="flex items-center gap-3 mb-6">
            {config.store.logo ? (
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
          {resolvedFeatured.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {resolvedFeatured.map((service) => (
                <a
                  key={service.id}
                  href="#services"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:shadow-md transition"
                >
                  <AtlasIcon name={service.icon as AtlasIconName} className="h-4 w-4" />
                  {service.name}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Hero" className="w-full h-auto rounded-2xl shadow-lg object-cover" />
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-neutral-100 relative overflow-hidden">
              <p className="text-sm text-neutral-500 mb-4">Quick Top Up</p>
              <div className="flex gap-3">
                <input type="text" placeholder="Enter phone number" className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm" />
                <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "var(--primary)" }}>Top Up</button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["GH₵5", "GH₵10", "GH₵20"].map((amt) => (
                  <button key={amt} className="py-2 rounded-md border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50">{amt}</button>
                ))}
              </div>
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-10" style={{ backgroundColor: "var(--primary)" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}