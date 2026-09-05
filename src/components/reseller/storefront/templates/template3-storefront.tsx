/* eslint-disable @typescript-eslint/no-unused-vars */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";
import { StorefrontHeader } from "@/components/reseller/storefront/storefront-header";
import { StorefrontHero } from "@/components/reseller/storefront/storefront-hero";
import { StorefrontServices } from "@/components/reseller/storefront/storefront-services";
import { StorefrontTrust } from "@/components/reseller/storefront/storefront-trust";
import { StorefrontFooter } from "@/components/reseller/storefront/storefront-footer";

export function Template3Storefront({ config, mode }: { config: StorefrontConfig; mode: "preview" | "public" }) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);

  return (
    <div className={`min-h-screen bg-white ${theme.headingFont}`} style={{ ...brandingStyle, scrollBehavior: "smooth" }}>
      <StorefrontHeader config={config} mode={mode} />

      {/* Minimal hero */}
      <StorefrontHero config={config} mode={mode} />

      {/* Services with clean background */}
      <div className="bg-neutral-50 py-16">
        <StorefrontServices config={config} mode={mode} />
      </div>

      {/* Trust bar – simple line */}
      <section className="py-10 bg-white border-b border-neutral-100">
        <div className={`${theme.container} mx-auto px-4 flex flex-wrap justify-center gap-8 text-sm text-neutral-600`}>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            Instant Delivery
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            Secure Payments
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            Reliable Service
          </span>
        </div>
      </section>

      <StorefrontFooter config={config} mode={mode} />
    </div>
  );
}