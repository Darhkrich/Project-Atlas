/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle } from "@/lib/storefront/utils";
import { servicesCategories } from "@/lib/services-page-data";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface StorefrontFooterProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontFooter({ config, mode }: StorefrontFooterProps) {
  if (!config.footer.enabled) return null;

  const brandingStyle = getBrandingStyle(config);
  const currentYear = new Date().getFullYear();

  const featuredServices = config.services.featured
    .map((id) => servicesCategories.find((cat) => cat.id === id && cat.available))
    .filter((service): service is (typeof servicesCategories)[number] => Boolean(service))
    .slice(0, 5);

  const socialLinks = [
    { id: "facebook", icon: "facebook" as AtlasIconName, href: config.social.facebook },
    { id: "instagram", icon: "instagram" as AtlasIconName, href: config.social.instagram },
    { id: "tiktok", icon: "tiktok" as AtlasIconName, href: config.social.tiktok },
  ].filter((link) => link.href);

  return (
    <footer id="contact" className="bg-neutral-900 text-neutral-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" style={brandingStyle}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store info */}
          <div>
            <div className="flex items-center gap-3">
              {config.store.logo ? (
                <img
                  src={config.store.logo}
                  alt={config.store.name}
                  className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {config.store.name?.trim()?.charAt(0) || "S"}
                </div>
              )}
              <span className="text-lg font-bold text-white">{config.store.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              {config.footer.description || config.store.description}
            </p>
            {config.contact.whatsapp && (
              <a
                href={`https://wa.me/${config.contact.whatsapp}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {featuredServices.map((service) => (
                <li key={service.id}>
                  <a href="#services" className="text-neutral-400 hover:text-white transition">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="text-neutral-400 hover:text-white transition">Services</a>
              </li>
              <li>
                <a href="#contact" className="text-neutral-400 hover:text-white transition">Contact</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              {config.contact.phone && (
                <li className="flex items-center gap-2">
                  <AtlasIcon name="phone" className="h-4 w-4" />
                  {config.contact.phone}
                </li>
              )}
              {config.contact.email && (
                <li className="flex items-center gap-2">
                  <AtlasIcon name="mail" className="h-4 w-4" />
                  {config.contact.email}
                </li>
              )}
              {config.store.subdomain && (
                <li className="flex items-center gap-2">
                  <AtlasIcon name="globe" className="h-4 w-4" />
                  {`${config.store.subdomain}.atlas.com`}
                </li>
              )}
            </ul>

            {socialLinks.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">Follow Us</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:text-white transition"
                    >
                      <AtlasIcon name={social.icon} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-500">
            {config.footer.copyright || `© ${currentYear} ${config.store.name}. All rights reserved.`}
          </p>
          <p className="text-xs text-neutral-500">
            Powered by <span className="text-white font-semibold">Atlas</span>
          </p>
        </div>
      </div>
    </footer>
  );
}