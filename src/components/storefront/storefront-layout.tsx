"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

export function StorefrontLayout({
  store,
  children,
}: {
  store: MerchantStorefrontConfig;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, setStoreSlug } = useCustomerAuth();

  useEffect(() => {
    setStoreSlug(store.slug);
  }, [store.slug, setStoreSlug]);

  const slug = store.slug || "my-store";
  const navItems = [
    { label: "Home", href: `/ecommerce-stores/${slug}` },
    { label: "Products", href: `/ecommerce-stores/${slug}/products` },
    { label: "About", href: `/ecommerce-stores/${slug}/about` },
    { label: "Contact", href: `/ecommerce-stores/${slug}/contact` },
  ];

  // ... rest of component remains same, but replace any `store.slug` in link hrefs with `slug`
  return (
    <div className="min-h-screen bg-white text-neutral-950 overflow-x-hidden">
      {/* Announcement bar */}
      {store.showAnnouncement && store.announcement && (
        <div
          className="px-3 py-2 text-center text-xs font-medium text-white"
          style={{ backgroundColor: store.accentColor }}
        >
          {store.announcement}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Logo & store name */}
          <Link
            href={`/ecommerce-stores/${slug}`}
            className="flex items-center gap-2 min-w-0"
          >
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.storeName}
                width={32}
                height={32}
                className="rounded-lg object-contain shrink-0"
              />
            ) : (
              <div
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: store.primaryColor }}
              >
                {store.storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-base sm:text-lg font-bold tracking-tight truncate">
              {store.storeName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Account */}
            <Link
              href={
                isAuthenticated
                  ? `/ecommerce-stores/${slug}/account`
                  : `/ecommerce-stores/${slug}/account/login`
              }
              className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"
              aria-label="Account"
            >
              <AtlasIcon name="user" className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href={`/ecommerce-stores/${slug}/cart`}
              className="relative rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"
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

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
              aria-label="Menu"
            >
              <AtlasIcon
                name={mobileMenuOpen ? "x-circle" : "menu"}
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 last:border-0"
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
                className="py-2"
              >
                {isAuthenticated ? "My Account" : "Sign In"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-neutral-950 px-4 py-10 text-white sm:px-6 lg:px-8">
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
            <p className="mt-3 text-sm leading-6 text-neutral-400">{store.description}</p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Quick Links</p>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link href={`/ecommerce-stores/${slug}`} className="hover:text-white">Home</Link></li>
              <li><Link href={`/ecommerce-stores/${slug}/products`} className="hover:text-white">Products</Link></li>
              <li><Link href={`/ecommerce-stores/${slug}/about`} className="hover:text-white">About</Link></li>
              <li><Link href={`/ecommerce-stores/${slug}/contact`} className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Contact</p>
            <ul className="space-y-2 text-sm text-neutral-400">
              {store.contactPhone && <li>{store.contactPhone}</li>}
              {store.contactEmail && <li>{store.contactEmail}</li>}
              {store.address && <li>{store.address}</li>}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Follow Us</p>
            <div className="flex gap-4">
              {store.socialLinks.facebook && (
                <a href={store.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                  <AtlasIcon name="facebook" className="h-5 w-5" />
                </a>
              )}
              {store.socialLinks.instagram && (
                <a href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                  <AtlasIcon name="instagram" className="h-5 w-5" />
                </a>
              )}
              {store.socialLinks.tiktok && (
                <a href={store.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                  <AtlasIcon name="tiktok" className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {store.storeName}. All rights reserved. Powered by Atlas.
        </div>
      </footer>
    </div>
  );
}