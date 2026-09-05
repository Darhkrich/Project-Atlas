import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";
import { StorefrontHeader } from "@/components/reseller/storefront/storefront-header";
import { StorefrontHero } from "@/components/reseller/storefront/storefront-hero";
import { StorefrontServices } from "@/components/reseller/storefront/storefront-services";
import { StorefrontTrust } from "@/components/reseller/storefront/storefront-trust";
import { StorefrontFooter } from "@/components/reseller/storefront/storefront-footer";
import { AtlasIcon } from "@/components/atlas/icons";

export function Template2Storefront({ config, mode }: { config: StorefrontConfig; mode: "preview" | "public" }) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);

  return (
    <div className={`min-h-screen bg-white ${theme.headingFont}`} style={{ ...brandingStyle, scrollBehavior: "smooth" }}>
      <StorefrontHeader config={config} mode={mode} />

      {/* Large centered hero */}
      <StorefrontHero config={config} mode={mode} />

      {/* Services with extra spacing */}
      <div className="py-16">
        <StorefrontServices config={config} mode={mode} />
      </div>

      {/* Why choose us - uses trust section but with more flair */}
      <section className="py-16 bg-neutral-50">
        <div className={`${theme.container} mx-auto px-4`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">Why Choose Us</h2>
            <p className="mt-2 text-neutral-600">We make digital services easy and reliable</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white mb-4" style={{ backgroundColor: "var(--primary)" }}>
                <AtlasIcon name="lighting" className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="mt-2 text-sm text-neutral-600">Most orders are fulfilled instantly or within minutes.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white mb-4" style={{ backgroundColor: "var(--primary)" }}>
                <AtlasIcon name="shield" className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="mt-2 text-sm text-neutral-600">Your transactions are protected with the latest security.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white mb-4" style={{ backgroundColor: "var(--primary)" }}>
                <AtlasIcon name="support" className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="mt-2 text-sm text-neutral-600">Our team is always ready to help you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo banner */}
      <section className="py-12">
        <div className={`${theme.container} mx-auto px-4`}>
          <div className="rounded-2xl p-8 text-center text-white" style={{ backgroundColor: "var(--primary)" }}>
            <h2 className="text-2xl md:text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-2">Browse our services and enjoy instant delivery.</p>
            <a
              href="#services"
              className="mt-6 inline-block px-8 py-3 bg-white rounded-full font-semibold text-neutral-900 hover:shadow-lg transition"
            >
              Shop Now
            </a>
          </div>
        </div>
      </section>

      <StorefrontTrust config={config} mode={mode} />
      <StorefrontFooter config={config} mode={mode} />
    </div>
  );
}