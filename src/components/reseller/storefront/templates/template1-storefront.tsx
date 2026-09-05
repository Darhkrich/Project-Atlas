import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";
import { StorefrontHeader } from "@/components/reseller/storefront/storefront-header";
import { StorefrontHero } from "@/components/reseller/storefront/storefront-hero";
import { StorefrontServices } from "@/components/reseller/storefront/storefront-services";
import { StorefrontTrust } from "@/components/reseller/storefront/storefront-trust";
import { StorefrontFooter } from "@/components/reseller/storefront/storefront-footer";
import { AtlasIcon } from "@/components/atlas/icons";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { servicesCategories } from "@/lib/services-page-data";
import type { AtlasIconName } from "@/components/atlas/icons";

const steps = [
  {
    icon: "search" as AtlasIconName,
    title: "Choose service",
    desc: "Select from a wide range of digital services.",
  },
  {
    icon: "credit-card" as AtlasIconName,
    title: "Pay securely",
    desc: "Use mobile money, card, or wallet.",
  },
  {
    icon: "check-circle" as AtlasIconName,
    title: "Get delivery",
    desc: "Instant or within minutes.",
  },
];

export function Template1Storefront({ config, mode }: { config: StorefrontConfig; mode: "preview" | "public" }) {
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);

  return (
    <div className={`min-h-screen bg-white ${theme.headingFont}`} style={{ ...brandingStyle, scrollBehavior: "smooth" }}>
      <StorefrontHeader config={config} mode={mode} />
      {/* Top accent line */}
      <div className="h-1 w-full" style={{ backgroundColor: "var(--primary)" }} />

      <StorefrontHero config={config} mode={mode} />

      <StorefrontServices config={config} mode={mode} />

      {/* How It Works - only in Template1 */}
      <section className="py-16 bg-neutral-50">
        <div className={`${theme.container} mx-auto px-4`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">How It Works</h2>
            <p className="mt-2 text-neutral-600">Three simple steps to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary)" }}>
                  <AtlasIcon name={step.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StorefrontTrust config={config} mode={mode} />
      <StorefrontFooter config={config} mode={mode} />
    </div>
  );
}