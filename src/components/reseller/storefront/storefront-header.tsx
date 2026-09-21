/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle } from "@/lib/storefront/utils";
import { StorefrontMobileNav } from "./storefront-mobile-nav";
import { CustomerAccountModal } from "./customer-account-modal";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { useCurrentStorefrontWallet } from "@/lib/storefront-user/hooks/use-current-storefront-wallet";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";

interface StorefrontHeaderProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontHeader({ config, mode }: StorefrontHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const brandingStyle = getBrandingStyle(config);
  const { isAuthenticated, customer } = useStorefrontCustomer();
  const walletState = useCurrentStorefrontWallet();

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  const accountHref = "/customer-store/" + config.store.slug + "/account";

  const handleAccountClick = () => {
    if (isAuthenticated) {
      router.push(accountHref);
    } else {
      setAccountModalOpen(true);
    }
  };

  const walletBalance = walletState.wallet?.record.balance ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100">
      <div
        style={brandingStyle}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {config.store.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.store.logo}
                alt={config.store.name + " logo"}
                className="h-8 w-auto"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {config.store.name.charAt(0)}
              </div>
            )}
            <span className="text-lg font-semibold text-neutral-900">
              {config.store.name}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <button
              type="button"
              onClick={handleAccountClick}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
              aria-label={
                isAuthenticated && customer
                  ? "Open account for " + customer.name
                  : "Open account menu"
              }
            >
              <AtlasIcon name="user" className="h-4 w-4" aria-hidden="true" />
              {isAuthenticated && customer ? (
                <>
                  <span>{customer.name.split(" ")[0]}</span>
                  {walletState.wallet && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                      {formatCurrency(walletBalance)}
                    </span>
                  )}
                </>
              ) : (
                <span>Account</span>
              )}
            </button>

            <a
              href="#services"
              className="px-4 py-2 rounded-md text-white font-medium text-sm"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Top Up
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <StorefrontMobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        config={config}
      />

      {accountModalOpen && (
        <CustomerAccountModal
          resellerSlug={config.store.slug}
          storefrontId={config.storefrontId}
          onClose={() => setAccountModalOpen(false)}
        />
      )}
    </header>
  );
}