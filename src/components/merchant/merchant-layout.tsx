"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MerchantHeader } from "./merchant-header";
import { MerchantSidebar } from "./merchant-sidebar";
import { MerchantMobileNav } from "./merchant-mobile-nav";
import { AiAssistantWidget } from "./ai-assistant-widget";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useMerchantPreferences } from "@/lib/merchant/preferences/use-merchant-preferences";
import {
  applyThemeToDocument,
  effectiveTheme,
} from "@/lib/merchant/preferences/apply-theme";

export function MerchantLayout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const merchant = useCurrentMerchant();
  const router = useRouter();
  const { storefrontConfig } = useStorefrontConfig();
  const storeSlug = storefrontConfig.slug || "my-store";
  const preferences = useMerchantPreferences(storeSlug);

  useEffect(() => {
    applyThemeToDocument(effectiveTheme(preferences.theme));
  }, [preferences.theme]);

  useEffect(() => {
    if (preferences.theme !== "system") return;
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyThemeToDocument(effectiveTheme("system"));
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [preferences.theme]);

  useEffect(() => {
    if (merchant === null) {
      router.replace("/merchant/login");
    }
  }, [merchant, router]);

  if (merchant === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <p className="text-sm text-neutral-500">Redirecting to sign in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <MerchantHeader onMenuToggle={() => setMobileNavOpen((p) => !p)} />
      <div className="flex">
        <MerchantSidebar className="hidden w-64 shrink-0 lg:block" />
        <main
          id="main"
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
      <MerchantMobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <AiAssistantWidget />
    </div>
  );
}