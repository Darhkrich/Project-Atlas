/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { MerchantHeader } from "./merchant-header";
import { MerchantSidebar } from "./merchant-sidebar";
import { MerchantMobileNav } from "./merchant-mobile-nav";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { AiAssistantWidget } from "./ai-assistant-widget";

export function MerchantLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { storefrontConfig } = useStorefrontConfig();
  const store = storefrontConfig;
  const storeUrl = store.customDomain && store.customDomainStatus === "verified"
    ? `https://${store.customDomain}`
    : store.atlasDomain
    ? `https://${store.atlasDomain}`
    : store.subdomain
    ? `https://${store.subdomain}.atlas.com`
    : `https://atlas.com/ecommerce/${store.slug}`;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <MerchantHeader
        mobileNavOpen={mobileNavOpen}
        onMenuToggle={() => setMobileNavOpen((prev) => !prev)}
        storeName={store.storeName}
        storeUrl={storeUrl}
      />
      <div className="flex">
        <MerchantSidebar className="hidden w-64 shrink-0 lg:block sticky top-16 h-[calc(100vh-4rem)]" />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
         <AiAssistantWidget />
          {children}
        </main>
      </div>
      <MerchantMobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}

