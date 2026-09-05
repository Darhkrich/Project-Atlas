/* eslint-disable @next/next/no-img-element */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses, getStoreInitials } from "@/lib/storefront/utils";

interface CenteredHeroProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function CenteredHero({ config, mode }: CenteredHeroProps) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);
  const storeName = config.store.name?.trim() || "My Store";
  const initials = getStoreInitials(config.store.name);
  const headline = config.hero.title || "Welcome to My Store";
  const description = config.hero.subtitle || "Your trusted destination for digital services.";
  const primaryAction = config.hero.primaryAction || { label: "Buy Services", type: "services" };
  const secondaryAction = config.hero.secondaryAction;

  return (
    <section className={`relative ${theme.heroBg} py-20 md:py-28 text-center`}>
      <div className={`${theme.container} mx-auto px-4`} style={brandingStyle}>
        <div className="flex flex-col items-center">
          {config.store.logo ? (
            <img src={config.store.logo} alt={storeName} className="h-14 w-14 rounded-xl object-contain mb-6" />
          ) : (
            <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6" style={{ backgroundColor: "var(--primary)" }}>
              {initials}
            </div>
          )}
          <h1 className={`${theme.headingFont} text-4xl md:text-5xl font-bold text-neutral-900`}>{headline}</h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
            <span className="flex items-center gap-1"><svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Fast delivery</span>
            <span className="flex items-center gap-1"><svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Secure payment</span>
            <span className="flex items-center gap-1"><svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Reliable service</span>
          </div>
        </div>
      </div>
    </section>
  );
}