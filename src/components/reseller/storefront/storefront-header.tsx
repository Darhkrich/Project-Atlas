/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle } from "@/lib/storefront/utils";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import { CustomerAccountModal } from "./customer-account-modal";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { AtlasIcon } from "@/components/atlas/icons";

interface StorefrontHeaderProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontHeader({ config, mode }: StorefrontHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const brandingStyle = getBrandingStyle(config);
  const { isAuthenticated, customer } = useStorefrontCustomer();

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100">
      <div style={brandingStyle} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and name */}
          <div className="flex items-center gap-3">
            {config.store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.store.logo} alt={`${config.store.name} logo`} className="h-8 w-auto" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: "var(--primary)" }}>
                {config.store.name.charAt(0)}
              </div>
            )}
            <span className="text-lg font-semibold text-neutral-900">{config.store.name}</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-neutral-900 transition-colors">
                {link.label}
              </a>
            ))}
            {/* Account button */}
            <button
              onClick={() => setAccountModalOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              <AtlasIcon name="user" className="h-5 w-5" />
              {isAuthenticated ? customer?.name?.split(" ")[0] : "Account"}
            </button>
            <a href="#services" className="px-4 py-2 rounded-md text-white font-medium text-sm" style={{ backgroundColor: "var(--primary)" }}>
              Top Up
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <StorefrontMobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} config={config} />

      {accountModalOpen && (
        <CustomerAccountModal
          resellerSlug={config.store.slug}
          onClose={() => setAccountModalOpen(false)}
        />
      )}
    </header>
  );
}