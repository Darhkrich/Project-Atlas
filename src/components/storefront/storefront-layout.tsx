"use client";

import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import {
  menuForRender,
  resolveMenuHref,
} from "@/lib/merchant/storefront/menu";
import {
  buildGaInit,
  buildMetaPixelInit,
  buildTiktokPixelInit,
} from "@/lib/merchant/storefront/analytics-snippets";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface StorefrontLayoutProps {
  store: MerchantStorefrontConfig;
  children: ReactNode;
}

export function StorefrontLayout({ store, children }: StorefrontLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, setStoreSlug } = useCustomerAuth();

  useEffect(() => {
    setStoreSlug(store.slug);
  }, [store.slug, setStoreSlug]);

  const slug = store.slug || "my-store";
  const menuItems = menuForRender(store.menuItems);
  const navItems = menuItems.map((item) => ({
    label: item.label,
    href: resolveMenuHref(item.href, slug),
  }));

  const font = store.font ?? "atlas";
  const radius = store.cornerRadius ?? "soft";
  const isDark = Boolean(store.darkStorefront);
  const gridCols = String(store.gridDensity ?? 3);

  const rootStyle = {
    "--atlas-grid-cols": gridCols,
  } as CSSProperties;

  const providers = store.analyticsProviders;

  return (
    <div
      data-font={font}
      data-radius={radius}
      data-dark={isDark ? "true" : "false"}
      style={rootStyle}
      className="atlas-storefront min-h-screen overflow-x-hidden"
    >
      {providers?.ga && (
        <>
          <Script
            id="atlas-ga-src"
            strategy="afterInteractive"
            src={
              "https://www.googletagmanager.com/gtag/js?id=" + providers.ga
            }
          />
          <Script id="atlas-ga-init" strategy="afterInteractive">
            {buildGaInit(providers.ga)}
          </Script>
        </>
      )}

      {providers?.metaPixel && (
        <Script id="atlas-meta-pixel" strategy="afterInteractive">
          {buildMetaPixelInit(providers.metaPixel)}
        </Script>
      )}

      {providers?.tiktokPixel && (
        <Script id="atlas-tiktok-pixel" strategy="afterInteractive">
          {buildTiktokPixelInit(providers.tiktokPixel)}
        </Script>
      )}

      {store.showAnnouncement && store.announcement && (
        <div
          className="atlas-storefront-announcement px-3 py-2 text-center text-xs font-medium text-white"
          style={{ backgroundColor: store.accentColor }}
        >
          {store.announcement}
        </div>
      )}

      <header className="atlas-storefront-header sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
          <Link
            href={`/ecommerce-stores/${slug}`}
            className="flex min-w-0 items-center gap-2"
          >
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.storeName}
                width={32}
                height={32}
                className="shrink-0 rounded-lg object-contain"
              />
            ) : (
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white sm:h-9 sm:w-9"
                style={{ backgroundColor: store.primaryColor }}
              >
                {store.storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate text-base font-bold tracking-tight sm:text-lg">
              {store.storeName}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="atlas-storefront-nav-link text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={
                isAuthenticated
                  ? `/ecommerce-stores/${slug}/account`
                  : `/ecommerce-stores/${slug}/account/login`
              }
              className="atlas-storefront-icon-button rounded-lg p-2"
              aria-label="Account"
            >
              <AtlasIcon name="user" className="h-5 w-5" />
            </Link>

            <Link
              href={`/ecommerce-stores/${slug}/cart`}
              className="atlas-storefront-icon-button relative rounded-lg p-2"
              aria-label="Cart"
            >
              <AtlasIcon name="cart" className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: store.accentColor }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="atlas-storefront-icon-button rounded-lg p-2 lg:hidden"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <AtlasIcon
                name={mobileMenuOpen ? "x-circle" : "menu"}
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="atlas-storefront-mobile-menu border-t px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="atlas-storefront-mobile-link border-b py-2 last:border-0"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={
                  isAuthenticated
                    ? `/ecommerce-stores/${slug}/account`
                    : `/ecommerce-stores/${slug}/account/login`
                }
                onClick={() => setMobileMenuOpen(false)}
                className="atlas-storefront-mobile-link py-2"
              >
                {isAuthenticated ? "My Account" : "Sign In"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="atlas-storefront-footer px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.storeName}
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  {store.storeName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-semibold">{store.storeName}</span>
            </div>
            <p className="mt-3 text-sm leading-6">{store.description}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Quick Links</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/ecommerce-stores/${slug}`}
                  className="atlas-storefront-footer-link"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={`/ecommerce-stores/${slug}/products`}
                  className="atlas-storefront-footer-link"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href={`/ecommerce-stores/${slug}/about`}
                  className="atlas-storefront-footer-link"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={`/ecommerce-stores/${slug}/contact`}
                  className="atlas-storefront-footer-link"
                >
                  Contact
                </Link>
              </li>
              {store.returnsPolicy && store.returnsPolicy.trim().length > 0 && (
                <li>
                  <Link
                    href={`/ecommerce-stores/${slug}/returns`}
                    className="atlas-storefront-footer-link"
                  >
                    Returns
                  </Link>
                </li>
              )}
              {store.privacyPolicy && store.privacyPolicy.trim().length > 0 && (
                <li>
                  <Link
                    href={`/ecommerce-stores/${slug}/privacy`}
                    className="atlas-storefront-footer-link"
                  >
                    Privacy
                  </Link>
                </li>
              )}
              {store.termsPolicy && store.termsPolicy.trim().length > 0 && (
                <li>
                  <Link
                    href={`/ecommerce-stores/${slug}/terms`}
                    className="atlas-storefront-footer-link"
                  >
                    Terms
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Contact</p>
            <ul className="space-y-2 text-sm">
              {store.contactPhone && <li>{store.contactPhone}</li>}
              {store.contactEmail && <li>{store.contactEmail}</li>}
              {store.address && <li>{store.address}</li>}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Follow Us</p>
            <div className="flex gap-4">
              {store.socialLinks.facebook && (
                <a
                  href={store.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="atlas-storefront-footer-link"
                  aria-label="Facebook"
                >
                  <AtlasIcon name="facebook" className="h-5 w-5" />
                </a>
              )}
              {store.socialLinks.instagram && (
                <a
                  href={store.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="atlas-storefront-footer-link"
                  aria-label="Instagram"
                >
                  <AtlasIcon name="instagram" className="h-5 w-5" />
                </a>
              )}
              {store.socialLinks.tiktok && (
                <a
                  href={store.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="atlas-storefront-footer-link"
                  aria-label="TikTok"
                >
                  <AtlasIcon name="tiktok" className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="atlas-storefront-footer-meta mt-8 border-t pt-6 text-center text-xs">
          {"\u00A9 "}
          {new Date().getFullYear()} {store.storeName}. All rights reserved.
          Powered by Atlas.
        </div>
      </footer>
    </div>
  );
}