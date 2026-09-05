import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";

interface PromotionalHeroProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PromotionalHero({ config, mode }: PromotionalHeroProps) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);
  const headline = config.hero.title || "Affordable Data Bundles";
  const description = config.hero.subtitle || "Stay connected for less.";
  const primaryAction = config.hero.primaryAction || { label: "Shop Now", type: "services" };
  const promoBadge = config.hero.promoBadge || "LIMITED-TIME OFFER";
  const promoEnds = config.hero.promoEnds;

  return (
    <section className={`relative overflow-hidden ${theme.heroBg} py-20 md:py-28 text-center`}>
      <div className={`${theme.container} mx-auto px-4`} style={brandingStyle}>
        <div className="mb-6 inline-block px-4 py-1 rounded-full bg-white/90 border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-sm">
          {promoBadge}
        </div>
        <h1 className={`${theme.headingFont} text-4xl md:text-5xl font-extrabold text-neutral-900`}>{headline}</h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">{description}</p>
        <a
          href={primaryAction.href || "#services"}
          className={`mt-8 inline-flex items-center justify-center px-8 py-3 ${theme.buttonRadius} text-white font-medium shadow-md`}
          style={{ backgroundColor: "var(--primary)" }}
        >
          {primaryAction.label}
        </a>
        {promoEnds && (
          <p className="mt-4 text-sm text-neutral-500">Offer ends soon</p>
        )}
      </div>
    </section>
  );
}